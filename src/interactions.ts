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
  const miniArt = required<HTMLElement>('.bc-deal-art');
  const seal = required<HTMLElement>('.bc-chapter-seal');
  const live = required('.bc-live');
  const returnButton = required<HTMLButtonElement>('.bc-return');
  const shuffleHint = required('.bc-shuffle-hint');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const controller = new AbortController();
  const listenerOptions = { signal: controller.signal };
  const isBeyondWork = (): boolean => ['#beyond-work', '#bonus'].includes(window.location.hash);
  const state = { chapter: isBeyondWork() };
  const originalMiniContents = [...miniArt.childNodes];
  const originalMiniHeight = miniArt.style.height;
  const cloneArtwork = (): HTMLElement => {
    const clone = cardObject.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    return clone;
  };
  const sealArtwork = cloneArtwork();
  seal.append(sealArtwork);
  const miniature = cloneArtwork();
  miniature.classList.add('bc-personal-mini');
  const shuffleLeaves = [cloneArtwork(), cloneArtwork()];
  shuffleLeaves.forEach(leaf => leaf.classList.add('bc-shuffle-leaf'));
  miniArt.replaceChildren(...shuffleLeaves, miniature);

  let destroyed = false;
  let busy = false;
  let epoch = 0;
  let pendingChapter = state.chapter;
  let transitionLayer: HTMLDivElement | null = null;
  let detailEpoch = 0;
  let shuffling = false;
  const animations = new Set<Animation>();
  const detailAnimations = new Set<Animation>();
  const hasMotion = (): boolean => !reduced.matches && typeof root.animate === 'function';
  const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

  // Computed dimensions remain available while the original card's chapter is hidden.
  function cardDimensions(): { width: number; height: number; miniWidth: number; scale: number } | null {
    const style = getComputedStyle(card);
    const width = Number.parseFloat(style.width);
    const height = Number.parseFloat(style.height);
    const miniWidth = Number.parseFloat(getComputedStyle(miniArt).width);
    if (![width, height, miniWidth].every(value => Number.isFinite(value) && value > 0)) return null;
    const scale = miniWidth / width;
    if (scale < 0.02 || scale > 1) return null;
    return { width, height, miniWidth, scale };
  }

  function syncMiniature(): void {
    const size = cardDimensions();
    if (!size) return;
    miniArt.style.height = `${size.height * size.scale}px`;
    const sealWidth = Number.parseFloat(getComputedStyle(seal).width);
    if (Number.isFinite(sealWidth) && sealWidth > 0) {
      seal.style.height = `${size.height * sealWidth / size.width}px`;
      sealArtwork.style.width = `${size.width}px`;
      sealArtwork.style.height = `${size.height}px`;
      sealArtwork.style.transform = `scale(${sealWidth / size.width})`;
    }
    for (const artwork of [miniature, ...shuffleLeaves]) {
      artwork.style.width = `${size.width}px`;
      artwork.style.height = `${size.height}px`;
      artwork.style.transform = `scale(${size.scale})`;
    }
  }

  function paint(): void {
    document.title = state.chapter ? 'Beyond work — Vishnudev Poil' : 'Vishnudev Poil — Developer';
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

  function revealCard(requestedId?: string): void {
    root.dispatchEvent(new CustomEvent('carddiscovered', { detail: { suit: 'hearts' } }));
    root.dispatchEvent(new CustomEvent('personaldeckdraw', { detail: { id: requestedId } }));
  }

  function stopDetails(): void {
    detailEpoch++;
    detailAnimations.forEach(animation => animation.cancel());
    detailAnimations.clear();
    shuffling = false;
    smallCard.removeAttribute('aria-busy');
    miniature.classList.remove('bc-mini-drawn');
    miniature.replaceChildren(...cloneArtwork().childNodes);
    shuffleHint.textContent = 'Draw a card';
    root.dispatchEvent(new CustomEvent('personaldeckreset'));
  }

  function cancelAnimations(): void {
    epoch++;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    transitionLayer?.remove();
    transitionLayer = null;
    for (const element of [cover, bonus, card, cardObject, smallCard, seal]) {
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
    live.textContent = state.chapter ? 'Beyond work opened.' : 'Returned to the portfolio.';
  }

  function updateHistory(open: boolean): void {
    const hash = open ? '#beyond-work' : '#intro';
    if (window.location.hash === hash) return;
    try {
      const url = new URL(window.location.href);
      url.hash = hash;
      window.history.pushState(null, '', url);
    } catch { /* Local previews can disallow history changes; chapter navigation still works. */ }
  }

  function settle(open: boolean, focus = true): void {
    // Interrupted transitions and Escape must restore the active hero card too.
    if (!open) root.dispatchEvent(new CustomEvent('chapterwillchange', { detail: { open } }));
    cancelAnimations();
    state.chapter = open;
    pendingChapter = open;
    paint();
    if (focus) focusDestination();
  }

  function cardPose(element: HTMLElement): { x: number; y: number; angle: number; width: number } {
    const box = element.getBoundingClientRect();
    let angle = 0;
    try {
      const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
      angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    } catch { /* Straight cards also provide a continuous transition. */ }
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, angle, width: element.offsetWidth };
  }

  async function go(open: boolean, userInitiated = false): Promise<void> {
    if (destroyed || busy || state.chapter === open) return;
    if (userInitiated) updateHistory(open);
    root.dispatchEvent(new CustomEvent('chapterwillchange', { detail: { open } }));
    resetCardTilt();
    stopDetails();
    pendingChapter = open;
    if (!hasMotion()) {
      settle(open);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const token = ++epoch;
    busy = true;
    root.dataset.busy = 'true';
    const outgoing = open ? cover : bonus;
    const incoming = open ? bonus : cover;
    const source = open ? card : seal;
    const destination = open ? seal : card;
    outgoing.inert = true;
    incoming.inert = true;
    try {
      // Lift one card into a viewport layer before either page changes its layout.
      const from = cardPose(source);
      const size = cardDimensions();
      const sourceVisible = source.getClientRects().length > 0
        && (!open || !card.inert)
        && from.x > 0 && from.x < window.innerWidth && from.y > 0 && from.y < window.innerHeight;
      let flight: HTMLButtonElement | null = null;
      if (sourceVisible && size) {
        transitionLayer = document.createElement('div');
        transitionLayer.className = 'bc-transition-layer';
        transitionLayer.dataset.finish = root.dataset.finish ?? 'Foil';
        transitionLayer.setAttribute('aria-hidden', 'true');
        transitionLayer.inert = true;
        flight = card.cloneNode(true) as HTMLButtonElement;
        flight.className = 'bc-playing-card bc-page-flight';
        flight.removeAttribute('id');
        flight.removeAttribute('aria-label');
        flight.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
        flight.disabled = true;
        flight.style.cssText = `left:${from.x - size.width / 2}px;top:${from.y - size.height / 2}px;width:${size.width}px;height:${size.height}px;transform:rotate(${from.angle}deg) scale(${from.width / size.width});`;
        transitionLayer.append(flight);
        document.body.append(transitionLayer);
        source.style.visibility = 'hidden';
      }

      // The pages never overlap: clear the outgoing text, switch, then reveal.
      await animate(outgoing, [{ opacity: 1 }, { opacity: 0 }], { duration: 130, easing: 'ease-out' });
      if (destroyed || token !== epoch) return;
      outgoing.hidden = true;
      incoming.style.opacity = '0';
      incoming.hidden = false;
      window.scrollTo({ top: 0, behavior: 'instant' });
      syncMiniature();
      const arrivals: Promise<void>[] = [];
      if (flight && size) {
        const to = cardPose(destination);
        destination.style.visibility = 'hidden';
        arrivals.push(animate(flight, [
          { transform: `rotate(${from.angle}deg) scale(${from.width / size.width})` },
          { transform: `translate(${to.x - from.x}px,${to.y - from.y}px) rotate(${to.angle}deg) scale(${to.width / size.width})` },
        ], { duration: 430, easing: 'cubic-bezier(.22,.8,.22,1)' }));
      }
      arrivals.push(animate(incoming, [
        { opacity: 0, transform: 'translateY(7px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: flight ? 340 : 240, delay: flight ? 55 : 0, easing: 'cubic-bezier(.22,.75,.25,1)' }));
      await Promise.all(arrivals);
      if (!destroyed && token === epoch) settle(open);
    } catch {
      if (!destroyed && token === epoch) {
        settle(open);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  }

  root.addEventListener('chapterrequest', event => {
    const detail = (event as CustomEvent<{ open: boolean }>).detail;
    if (typeof detail?.open === 'boolean') void go(detail.open, true);
  }, listenerOptions);

  root.addEventListener('personaldeckclose', stopDetails, listenerOptions);

  for (const selector of ['.bc-playing-card', '.bc-bonus-link']) {
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

  async function drawPersonalCard(requestedId?: string): Promise<void> {
    if (busy || shuffling || !state.chapter) return;
    root.dispatchEvent(new CustomEvent('personaldeckdrawing'));
    if (!hasMotion()) {
      revealCard(requestedId);
      return;
    }
    const size = cardDimensions();
    if (!size) {
      revealCard(requestedId);
      return;
    }
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
      if (destroyed || token !== detailEpoch) return;
      await detailAnimate(miniature, [
        { transform: `scale(${size.scale}) rotateY(0deg)` },
        { transform: `scale(${size.scale}) rotateY(90deg)` },
      ], { duration: 140, easing: 'ease-in' });
      if (destroyed || token !== detailEpoch) return;
      revealCard(requestedId);
      await detailAnimate(miniature, [
        { transform: `scale(${size.scale}) rotateY(-90deg)` },
        { transform: `scale(${size.scale}) rotateY(0deg)` },
      ], { duration: 180, easing: 'ease-out' });
    } catch {
      if (token === detailEpoch) stopDetails();
      return;
    }
    if (destroyed || token !== detailEpoch) return;
    shuffling = false;
    smallCard.removeAttribute('aria-busy');
  }

  smallCard.addEventListener('click', () => { void drawPersonalCard(); }, listenerOptions);
  root.addEventListener('personaldeckrequest', event => {
    const id: unknown = (event as CustomEvent<{ id?: unknown }>).detail?.id;
    if (id === 'music' || id === 'f1') void drawPersonalCard(id);
  }, listenerOptions);

  root.addEventListener('deckchange', () => {
    resetCardTilt();
    stopDetails();
    if (busy) settle(pendingChapter);
  }, listenerOptions);

  function followLocation(): void {
    const open = isBeyondWork();
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
    if (event.key !== 'Escape' || root.querySelector('dialog[open]') || !root.getClientRects().length || (!state.chapter && !busy)) return;
    event.preventDefault();
    updateHistory(false);
    resetCardTilt();
    stopDetails();
    settle(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, listenerOptions);
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    resetCardTilt();
    stopDetails();
    if (busy) settle(pendingChapter);
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
    sealArtwork.remove();
    miniArt.replaceChildren(...originalMiniContents);
    if (originalMiniHeight) miniArt.style.height = originalMiniHeight;
    else miniArt.style.removeProperty('height');
    delete root.dataset.enhanced;
  };
}
