type Palette = 'light' | 'dark';

/** Enhance the two portfolio chapters. Call the returned function before remounting. */
export function initPortfolio(root: HTMLElement): () => void {
  const required = <T extends HTMLElement>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Portfolio element missing: ${selector}`);
    return element;
  };
  const cover = required('.bc-cover');
  const bonus = required('.bc-bonus');
  const card = required<HTMLButtonElement>('.bc-playing-card');
  const cardObject = required('.bc-playing-card .bc-card-object');
  const smallCard = required<HTMLButtonElement>('.bc-small-card');
  const live = required('.bc-live');
  const returnButton = required<HTMLButtonElement>('.bc-return');
  const themeButtons = root.querySelectorAll<HTMLButtonElement>('.bc-theme-toggle');
  const weekends = required('.bc-weekends');
  const raceButton = required<HTMLButtonElement>('.bc-race-button');
  const raceCaption = required('.bc-race-caption');
  const raceLights = [...root.querySelectorAll<HTMLElement>('.bc-race-lights > span')];
  const shuffleHint = required('.bc-shuffle-hint');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const controller = new AbortController();
  const listenerOptions = { signal: controller.signal };
  const paletteValue = (value: string | null | undefined): Palette | null =>
    value === 'light' || value === 'dark' ? value : null;
  const storedPalette = (): Palette | null => {
    try { return paletteValue(window.localStorage.getItem('vishnu-theme')); }
    catch { return null; }
  };
  const saved = storedPalette();
  let followsSystem = saved === null;
  const state = {
    chapter: window.location.hash === '#bonus',
    palette: saved ?? paletteValue(root.dataset.theme)
      ?? paletteValue(document.documentElement.dataset.palette)
      ?? paletteValue(root.dataset.palette) ?? (systemTheme.matches ? 'dark' : 'light'),
  };
  const originalMiniContents = [...smallCard.childNodes];
  const originalMiniHeight = smallCard.style.height;
  const cloneArtwork = (): HTMLElement => {
    const clone = cardObject.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    return clone;
  };
  const miniature = cloneArtwork();
  const shuffleLeaves = [cloneArtwork(), cloneArtwork()];
  shuffleLeaves.forEach(leaf => leaf.classList.add('bc-shuffle-leaf'));
  smallCard.replaceChildren(...shuffleLeaves, miniature);

  let destroyed = false;
  let busy = false;
  let epoch = 0;
  let pendingChapter = state.chapter;
  let flying: HTMLButtonElement | null = null;
  let detailEpoch = 0;
  let shuffling = false;
  let racing = false;
  const animations = new Set<Animation>();
  const detailAnimations = new Set<Animation>();
  const hasMotion = (): boolean => !reduced.matches && typeof root.animate === 'function';
  const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

  // Computed dimensions remain available while the original card's chapter is hidden.
  function cardDimensions(): { width: number; height: number; miniWidth: number; scale: number } | null {
    const style = getComputedStyle(card);
    const width = Number.parseFloat(style.width);
    const height = Number.parseFloat(style.height);
    const miniWidth = Number.parseFloat(getComputedStyle(smallCard).width);
    if (![width, height, miniWidth].every(value => Number.isFinite(value) && value > 0)) return null;
    const scale = miniWidth / width;
    if (scale < 0.02 || scale > 1) return null;
    return { width, height, miniWidth, scale };
  }

  function syncMiniature(): void {
    const size = cardDimensions();
    if (!size) return;
    smallCard.style.height = `${size.height * size.scale}px`;
    for (const artwork of [miniature, ...shuffleLeaves]) {
      artwork.style.width = `${size.width}px`;
      artwork.style.height = `${size.height}px`;
      artwork.style.transform = `scale(${size.scale})`;
    }
  }

  function paintTheme(): void {
    root.dataset.palette = state.palette;
    root.style.colorScheme = state.palette;
    document.documentElement.dataset.palette = state.palette;
    document.documentElement.style.colorScheme = state.palette;
    const background = state.palette === 'dark' ? '#1c1b1a' : '#f5f0e8';
    document.documentElement.style.backgroundColor = background;
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) themeColor.content = background;
    const next = state.palette === 'dark' ? 'light' : 'dark';
    for (const button of themeButtons) {
      button.setAttribute('aria-label', `Switch to ${next} mode`);
      const label = button.querySelector('.bc-theme-label');
      if (label) label.textContent = next === 'light' ? 'Light mode' : 'Dark mode';
    }
  }

  function paint(): void {
    paintTheme();
    cover.hidden = state.chapter;
    bonus.hidden = !state.chapter;
    cover.inert = state.chapter;
    bonus.inert = !state.chapter;
    syncMiniature();
  }

  function resetCardTilt(): void {
    for (const name of ['--bc-tilt-x', '--bc-tilt-y', '--bc-glint-x', '--bc-glint-opacity']) {
      card.style.removeProperty(name);
    }
  }

  function stopDetails(): void {
    detailEpoch++;
    detailAnimations.forEach(animation => animation.cancel());
    detailAnimations.clear();
    shuffling = false;
    racing = false;
    smallCard.removeAttribute('aria-busy');
    raceButton.removeAttribute('aria-busy');
    weekends.dataset.race = 'idle';
    shuffleHint.textContent = 'Shuffle';
    raceCaption.textContent = 'Ready?';
  }

  function cancelAnimations(): void {
    epoch++;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    flying?.remove();
    flying = null;
    for (const element of [cover, bonus, card, cardObject, smallCard]) {
      for (const property of ['opacity', 'transform', 'visibility', 'z-index']) element.style.removeProperty(property);
    }
    root.style.removeProperty('height');
    cover.inert = false;
    bonus.inert = false;
    busy = false;
    root.dataset.busy = 'false';
  }

  function animate(element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
    const animation = element.animate(frames, {
      easing: 'cubic-bezier(.22,.72,.24,1)', fill: 'both', ...options,
    });
    animations.add(animation);
    return animation.finished.then(() => undefined, () => undefined);
  }

  function detailAnimate(element: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
    const animation = element.animate(frames, {
      fill: 'both', easing: 'cubic-bezier(.2,.7,.2,1)', ...options,
    });
    detailAnimations.add(animation);
    return animation.finished.then(() => undefined, () => undefined).finally(() => {
      animation.cancel();
      detailAnimations.delete(animation);
    });
  }

  function focusDestination(): void {
    (state.chapter ? returnButton : card).focus({ preventScroll: true });
    live.textContent = state.chapter ? 'Bonus chapter opened.' : 'Returned to the portfolio.';
  }

  function updateHistory(open: boolean): void {
    const hash = open ? '#bonus' : '#work';
    if (window.location.hash === hash) return;
    try {
      const url = new URL(window.location.href);
      url.hash = hash;
      window.history.pushState(null, '', url);
    } catch { /* Local previews can disallow history changes; chapter navigation still works. */ }
  }

  function settle(open: boolean, focus = true): void {
    cancelAnimations();
    state.chapter = open;
    pendingChapter = open;
    paint();
    if (focus) focusDestination();
  }

  async function go(open: boolean, userInitiated = false): Promise<void> {
    if (destroyed || busy || state.chapter === open) return;
    if (userInitiated) updateHistory(open);
    resetCardTilt();
    stopDetails();
    pendingChapter = open;
    root.scrollIntoView({ block: 'start', behavior: 'instant' });
    if (!hasMotion()) {
      settle(open);
      return;
    }
    const token = ++epoch;
    busy = true;
    root.dataset.busy = 'true';
    const outgoing = open ? cover : bonus;
    const incoming = open ? bonus : cover;
    outgoing.inert = true;
    incoming.inert = true;
    try {
      const fromHeight = outgoing.getBoundingClientRect().height;
      root.style.height = `${fromHeight}px`;
      incoming.hidden = false;
      incoming.style.opacity = '0';
      incoming.style.zIndex = '2';
      syncMiniature();
      const toHeight = incoming.getBoundingClientRect().height;
      const rootBox = root.getBoundingClientRect();
      const mainBox = card.getBoundingClientRect();
      const miniBox = smallCard.getBoundingClientRect();
      const destination = open ? miniBox : mainBox;
      const size = cardDimensions();
      const visibleDestination = destination.top >= 0 && destination.bottom <= window.innerHeight;
      const canDeal = root.clientWidth > 520 && visibleDestination && size !== null;
      const duration = canDeal ? 600 : 320;
      const promises: Promise<void>[] = [];
      if (canDeal && size) {
        const mainX = mainBox.left + mainBox.width / 2 - rootBox.left;
        const mainY = mainBox.top + mainBox.height / 2 - rootBox.top;
        const miniX = miniBox.left + miniBox.width / 2 - rootBox.left;
        const miniY = miniBox.top + miniBox.height / 2 - rootBox.top;
        let mainAngle = 0;
        try {
          const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
          mainAngle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
        } catch { /* A browser without DOMMatrix still gets the same planar card deal. */ }
        const arc = clamp(Math.hypot(miniX - mainX, miniY - mainY) * 0.13, 20, 56);
        flying = card.cloneNode(true) as HTMLButtonElement;
        flying.classList.add('bc-flying-card');
        flying.removeAttribute('id');
        flying.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        flying.disabled = true;
        flying.inert = true;
        flying.setAttribute('aria-hidden', 'true');
        flying.removeAttribute('aria-label');
        flying.style.width = `${size.width}px`;
        flying.style.height = `${size.height}px`;
        flying.style.left = `${mainX - size.width / 2}px`;
        flying.style.top = `${mainY - size.height / 2}px`;
        root.append(flying);
        card.style.visibility = 'hidden';
        smallCard.style.visibility = 'hidden';
        const frames = [0, 0.16, 0.36, 0.6, 0.82, 1].map(t => {
          const bow = Math.sin(Math.PI * t);
          const x = (miniX - mainX) * t + arc * bow;
          const y = (miniY - mainY) * t - arc * 0.8 * bow;
          const rotation = mainAngle + (15 - mainAngle) * t - 17 * bow;
          const scale = 1 + (size.scale - 1) * t + 0.035 * bow;
          return { offset: t, transform: `translate(${x}px,${y}px) rotate(${rotation}deg) scale(${scale})` };
        });
        const dealFrames = open ? frames : frames.slice().reverse().map(frame => ({ ...frame, offset: 1 - frame.offset }));
        promises.push(animate(flying, dealFrames, { duration, easing: 'cubic-bezier(.2,.65,.25,1)' }));
      }
      promises.push(
        animate(root, [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], { duration }),
        animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: duration * 0.58 }),
        animate(incoming, [{ opacity: 0 }, { opacity: 1 }], { duration: duration * 0.86 }),
      );
      await Promise.all(promises);
      if (!destroyed && token === epoch) settle(open);
    } catch {
      if (!destroyed && token === epoch) settle(open);
    }
  }

  for (const selector of ['.bc-playing-card', '.bc-card-hint', '.bc-bonus-link']) {
    required(selector).addEventListener('click', () => { void go(true, true); }, listenerOptions);
  }
  for (const selector of ['.bc-return', '.bc-end-return']) {
    required(selector).addEventListener('click', () => { void go(false, true); }, listenerOptions);
  }

  card.addEventListener('pointermove', event => {
    if (busy || !hasMotion() || !finePointer.matches) return;
    const box = card.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const x = clamp((event.clientX - box.left) / box.width, 0, 1);
    const y = clamp((event.clientY - box.top) / box.height, 0, 1);
    card.style.setProperty('--bc-tilt-x', `${(0.5 - y) * 7}deg`);
    card.style.setProperty('--bc-tilt-y', `${(x - 0.5) * 9}deg`);
    card.style.setProperty('--bc-glint-x', `${15 + x * 70}%`);
    card.style.setProperty('--bc-glint-opacity', '.7');
  }, listenerOptions);
  card.addEventListener('pointerleave', resetCardTilt, listenerOptions);
  card.addEventListener('pointercancel', resetCardTilt, listenerOptions);
  finePointer.addEventListener('change', resetCardTilt, listenerOptions);

  smallCard.addEventListener('click', async () => {
    if (busy || shuffling || !state.chapter) return;
    if (!hasMotion()) {
      shuffleHint.textContent = 'Fresh hand.';
      live.textContent = 'Cards shuffled.';
      return;
    }
    const size = cardDimensions();
    if (!size) return;
    shuffling = true;
    smallCard.setAttribute('aria-busy', 'true');
    const token = detailEpoch;
    try {
      const leafMotions = shuffleLeaves.map((leaf, index) => {
        const direction = index === 0 ? -1 : 1;
        return detailAnimate(leaf, [
          { transform: `translate(0,0) rotate(0deg) scale(${size.scale})`, opacity: 0 },
          { transform: `translate(${direction * 23}px,-8px) rotate(${direction * 19}deg) scale(${size.scale})`, opacity: 1, offset: 0.36 },
          { transform: `translate(${direction * 12}px,-3px) rotate(${direction * 8}deg) scale(${size.scale})`, opacity: 1, offset: 0.67 },
          { transform: `translate(0,0) rotate(0deg) scale(${size.scale})`, opacity: 0 },
        ], { duration: 650 });
      });
      await Promise.all([...leafMotions, detailAnimate(miniature, [
        { transform: `scale(${size.scale})` },
        { transform: `translate(-7px,-13px) rotate(-8deg) scale(${size.scale})`, offset: 0.42 },
        { transform: `scale(${size.scale})` },
      ], { duration: 650 })]);
    } catch {
      if (token === detailEpoch) stopDetails();
      return;
    }
    if (destroyed || token !== detailEpoch) return;
    shuffling = false;
    smallCard.removeAttribute('aria-busy');
    shuffleHint.textContent = 'Fresh hand.';
    live.textContent = 'Cards shuffled.';
  }, listenerOptions);

  // Resolve theme-aware CSS colors before passing them to the animation engine.
  function raceColors(): { off: string; red: string } {
    const probe = document.createElement('span');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;';
    root.append(probe);
    probe.style.color = 'var(--bc-race-off)';
    const off = getComputedStyle(probe).color;
    probe.style.color = 'var(--bc-race-red)';
    const red = getComputedStyle(probe).color;
    probe.remove();
    return { off, red };
  }

  raceButton.addEventListener('click', async () => {
    if (busy || racing || !state.chapter) return;
    if (!hasMotion()) {
      weekends.dataset.race = 'done';
      raceCaption.textContent = 'Lights out.';
      live.textContent = 'Lights out. Race started.';
      return;
    }
    racing = true;
    raceButton.setAttribute('aria-busy', 'true');
    weekends.dataset.race = 'running';
    raceCaption.textContent = 'On the grid.';
    const token = detailEpoch;
    try {
      const { off, red } = raceColors();
      await Promise.all(raceLights.map((light, index) => detailAnimate(light, [
        { backgroundColor: off, offset: 0 },
        { backgroundColor: off, offset: (index * 170 + 50) / 1600 },
        { backgroundColor: red, offset: (index * 170 + 51) / 1600 },
        { backgroundColor: red, offset: 0.8 },
        { backgroundColor: off, offset: 0.801 },
        { backgroundColor: off, offset: 1 },
      ], { duration: 1600, easing: 'linear' })));
    } catch {
      if (token === detailEpoch) stopDetails();
      return;
    }
    if (destroyed || token !== detailEpoch) return;
    racing = false;
    raceButton.removeAttribute('aria-busy');
    weekends.dataset.race = 'done';
    raceCaption.textContent = 'Lights out.';
    live.textContent = 'Lights out. Race started.';
  }, listenerOptions);

  for (const button of themeButtons) {
    button.addEventListener('click', () => {
      if (busy) return;
      resetCardTilt();
      stopDetails();
      followsSystem = false;
      state.palette = state.palette === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem('vishnu-theme', state.palette); } catch { /* Keep the theme usable when storage is blocked. */ }
      paintTheme();
      live.textContent = state.palette === 'dark' ? 'Dark mode.' : 'Light mode.';
    }, listenerOptions);
  }

  function followLocation(): void {
    const open = window.location.hash === '#bonus';
    if (busy) {
      if (pendingChapter !== open) {
        stopDetails();
        settle(open);
      }
      return;
    }
    void go(open);
  }
  window.addEventListener('popstate', followLocation, listenerOptions);
  window.addEventListener('hashchange', followLocation, listenerOptions);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !root.getClientRects().length || (!state.chapter && !busy)) return;
    event.preventDefault();
    updateHistory(false);
    resetCardTilt();
    stopDetails();
    settle(false);
  }, listenerOptions);
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    resetCardTilt();
    stopDetails();
    if (busy) settle(pendingChapter);
  }, listenerOptions);
  systemTheme.addEventListener('change', () => {
    if (!followsSystem) return;
    stopDetails();
    state.palette = systemTheme.matches ? 'dark' : 'light';
    paintTheme();
  }, listenerOptions);
  window.addEventListener('storage', event => {
    if (event.key !== 'vishnu-theme' && event.key !== null) return;
    const palette = paletteValue(event.newValue);
    followsSystem = palette === null;
    state.palette = palette ?? (systemTheme.matches ? 'dark' : 'light');
    stopDetails();
    paintTheme();
  }, listenerOptions);

  let lastWidth = root.clientWidth;
  function onResize(): void {
    if (destroyed || root.clientWidth === lastWidth) return;
    lastWidth = root.clientWidth;
    resetCardTilt();
    stopDetails();
    if (busy) settle(pendingChapter);
    else syncMiniature();
  }
  window.addEventListener('resize', onResize, listenerOptions);
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
  resizeObserver?.observe(root);
  window.addEventListener('pagehide', () => {
    resetCardTilt();
    stopDetails();
    if (busy) settle(pendingChapter, false);
  }, listenerOptions);
  window.addEventListener('pageshow', followLocation, listenerOptions);

  root.dataset.enhanced = 'true';
  root.dataset.busy = 'false';
  root.dataset.cardStyle ??= 'Engraved';
  root.dataset.finish ??= 'Foil';
  paint();
  void document.fonts.ready.then(() => { if (!destroyed) syncMiniature(); });

  return () => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    resizeObserver?.disconnect();
    resetCardTilt();
    stopDetails();
    cancelAnimations();
    state.chapter = pendingChapter;
    paint();
    smallCard.replaceChildren(...originalMiniContents);
    if (originalMiniHeight) smallCard.style.height = originalMiniHeight;
    else smallCard.style.removeProperty('height');
    delete root.dataset.enhanced;
  };
}
