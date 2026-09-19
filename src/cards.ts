/** A small deck: cut to browse, choose a card to visit its chapter. */
export function initCards(root: HTMLElement): () => void {
  const place = root.querySelector<HTMLElement>('.bc-card-place');
  const mainCard = place?.querySelector<HTMLButtonElement>('.bc-playing-card');
  const foundHint = place?.querySelector<HTMLButtonElement>('.bc-card-hint');
  if (!place || !mainCard || !foundHint) return () => {};
  const hint = foundHint;

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  const originalChildren = [...place.childNodes];
  const originalHint = [...hint.childNodes];
  const originalMainAttributes = [...mainCard.attributes].map(attribute => [attribute.name, attribute.value]);
  const originalHintLabel = hint.getAttribute('aria-label');
  let active = 0;
  let cutting = false;
  let epoch = 0;
  let destroyed = false;
  let suppressClickUntil = 0;
  let gesture: { id: number; x: number; y: number; dx: number; dragging: boolean; card: HTMLButtonElement } | null = null;
  const seen = new Set([0]);
  let deckDiscovered = false;

  const chapters = [
    { name: 'Beyond work', target: 'beyond-work', description: 'A little more about me.', rank: 'V', suit: '♥', caption: 'OFF THE CLOCK' },
    { name: 'Building', target: 'work', description: 'What I’m building with Oversine.', rank: 'A', suit: '♣', caption: 'OVERSINE' },
    { name: 'Experience', target: 'experience', description: 'The teams I’ve been part of.', rank: 'K', suit: '♦', caption: 'THE EXPERIENCE' },
    { name: 'Projects', target: 'projects', description: 'Things I’ve brought to life.', rank: 'Q', suit: '♠', caption: 'PAST BUILDS' },
  ];

  function artwork(rank: string, suit: string, caption: string, name: string): string {
    return `<span class="bc-chapter-art" aria-hidden="true">
      <span class="bc-card-frame"></span>
      <span class="bc-card-corner bc-card-corner-top">${rank}<small>${suit}</small></span>
      <span class="bc-card-corner bc-card-corner-bottom">${rank}<small>${suit}</small></span>
      <span class="bc-chapter-ornament"><span></span><span></span><span></span></span>
      <span class="bc-chapter-suit">${suit}</span>
      <span class="bc-chapter-title">${name}</span>
      <span class="bc-card-imprint">${caption}</span>
    </span>`;
  }

  const deck = document.createElement('div');
  deck.className = 'bc-chapter-deck';
  deck.id = 'chapter-cards';
  deck.setAttribute('role', 'group');
  deck.setAttribute('aria-label', 'Chapter cards. Use the left and right arrow keys to cut the deck.');
  const cards = chapters.map((chapter, index) => {
    const card = index === 0 ? mainCard : document.createElement('button');
    card.type = 'button';
    card.classList.add('bc-deck-card');
    if (index > 0) {
      card.classList.add('bc-chapter-card');
      card.setAttribute('aria-label', `Open ${chapter.name.toLowerCase()}`);
      card.innerHTML = artwork(chapter.rank, chapter.suit, chapter.caption, chapter.name);
      card.addEventListener('click', () => visit(chapter.target), options);
    }
    deck.append(card);
    return card;
  });

  const caption = document.createElement('div');
  caption.className = 'bc-deck-caption';
  const count = document.createElement('span');
  count.className = 'bc-deck-count';
  count.setAttribute('aria-hidden', 'true');
  caption.append(count, hint);
  const description = document.createElement('p');
  description.className = 'bc-deck-card-description';
  const action = document.createElement('button');
  action.className = 'bc-deck-action';
  action.type = 'button';
  action.textContent = 'Cut deck';
  action.setAttribute('aria-controls', deck.id);
  action.setAttribute('aria-label', 'Cut deck to the next chapter card');
  const guide = document.createElement('span');
  guide.className = 'bc-deck-guide';
  guide.textContent = 'or swipe the cards';
  guide.setAttribute('aria-hidden', 'true');
  const controls = document.createElement('div');
  controls.className = 'bc-deck-controls';
  controls.append(action, guide);
  const status = document.createElement('span');
  status.className = 'bc-sr-only';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  place.replaceChildren(deck, caption, description, controls, status);
  place.classList.add('bc-card-place-enhanced');

  function paint(announce = false): void {
    cards.forEach((card, index) => {
      const depth = (index - active + cards.length) % cards.length;
      card.dataset.depth = String(depth);
      card.style.setProperty('--bc-card-depth', String(depth));
      card.inert = depth !== 0;
      card.tabIndex = depth === 0 ? 0 : -1;
      if (depth === 0) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    });
    const chapter = chapters[active];
    count.textContent = `0${active + 1} / 0${cards.length}`;
    hint.textContent = chapter.name;
    hint.setAttribute('aria-label', `Open ${chapter.name.toLowerCase()}`);
    description.textContent = chapter.description;
    status.textContent = announce ? `${chapter.name}, card ${active + 1} of ${cards.length}. ${chapter.description}` : '';
  }

  function clearGesture(): void {
    const current = gesture;
    gesture = null;
    delete deck.dataset.dragging;
    if (!current) return;
    current.card.style.removeProperty('transform');
    try {
      if (current.card.hasPointerCapture(current.id)) current.card.releasePointerCapture(current.id);
    } catch { /* The browser may already have released a cancelled pointer. */ }
  }

  function stopMotion(): void {
    epoch++;
    if (gesture?.dragging) suppressClickUntil = performance.now() + 400;
    clearGesture();
    animations.forEach(animation => animation.cancel());
    animations.clear();
    cards.forEach(card => card.style.removeProperty('transform'));
    cutting = false;
    delete deck.dataset.cutting;
  }

  async function animate(element: HTMLElement, frames: Keyframe[], duration: number): Promise<void> {
    if (reduced.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.2,.75,.25,1)', fill: 'both' });
    animations.add(animation);
    await animation.finished.catch(() => undefined);
    animation.cancel();
    animations.delete(animation);
  }

  function recordCard(): void {
    seen.add(active);
    if (seen.size === cards.length && !deckDiscovered) {
      deckDiscovered = true;
      root.dispatchEvent(new CustomEvent('carddiscovered', { detail: { suit: 'clubs' } }));
    }
  }

  async function cut(direction = 1, startTransform?: string): Promise<void> {
    if (destroyed || cutting || root.dataset.busy === 'true') return;
    stopMotion();
    const token = epoch;
    const previous = cards[active];
    const moveFocus = document.activeElement === previous;
    const next = (active + direction + cards.length) % cards.length;
    const from = startTransform ?? getComputedStyle(previous).transform;
    cutting = true;
    deck.dataset.cutting = 'true';
    const exit = `translate(${-direction * previous.offsetWidth * .75}px, -14px) rotate(${-direction * 14}deg)`;
    await animate(previous, [{ transform: from }, { transform: exit }], 160);
    if (destroyed || token !== epoch) return;
    const positions = cards.map(card => getComputedStyle(card).transform);
    positions[active] = exit;
    active = next;
    paint(true);
    recordCard();
    if (moveFocus) cards[active].focus({ preventScroll: true });
    await Promise.all(cards.map((card, index) => animate(card, [
      { transform: positions[index] },
      { transform: getComputedStyle(card).transform },
    ], 270)));
    if (destroyed || token !== epoch) return;
    cutting = false;
    delete deck.dataset.cutting;
  }

  function visit(id: string): void {
    if (destroyed || cutting || root.dataset.busy === 'true') return;
    stopMotion();
    if (id === 'beyond-work') {
      root.dispatchEvent(new CustomEvent('chapterrequest', { detail: { open: true } }));
      return;
    }
    const destination = root.querySelector<HTMLElement>(`#${id}`);
    if (!destination || root.querySelector<HTMLElement>('.bc-cover')?.hidden) return;
    try { window.history.pushState(null, '', `#${id}`); } catch { /* Scrolling still works without history access. */ }
    destination.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    const heading = destination.querySelector<HTMLElement>('h2') ?? destination;
    const previousTabIndex = heading.getAttribute('tabindex');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    if (previousTabIndex === null) heading.removeAttribute('tabindex');
    else heading.setAttribute('tabindex', previousTabIndex);
  }

  action.addEventListener('click', () => { void cut(); }, options);
  hint.addEventListener('click', () => visit(chapters[active].target), options);
  place.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    void cut(event.key === 'ArrowRight' ? 1 : -1);
  }, options);
  deck.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil || cutting || root.dataset.busy === 'true') {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, { ...options, capture: true });
  deck.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || cutting || root.dataset.busy === 'true') return;
    const card = (event.target as Element).closest<HTMLButtonElement>('.bc-deck-card');
    if (card !== cards[active]) return;
    card.getAnimations().forEach(animation => animation.cancel());
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dragging: false, card };
    card.setPointerCapture(event.pointerId);
  }, options);
  deck.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { clearGesture(); return; }
      if (Math.abs(dx) < 8) return;
      gesture.dragging = true;
      deck.dataset.dragging = 'true';
    }
    gesture.dx = dx;
    const travel = Math.max(-160, Math.min(160, dx));
    gesture.card.style.transform = `translate(${travel}px, ${-Math.abs(travel) * .04}px) rotate(${travel * .075}deg)`;
  }, options);
  deck.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const current = gesture;
    const from = getComputedStyle(current.card).transform;
    clearGesture();
    if (!current.dragging) return;
    suppressClickUntil = performance.now() + 400;
    if (Math.abs(current.dx) > current.card.offsetWidth * .22) {
      void cut(current.dx < 0 ? 1 : -1, from);
    } else {
      void animate(current.card, [{ transform: from }, { transform: getComputedStyle(current.card).transform }], 200);
    }
  }, options);
  const cancelGesture = (): void => {
    if (gesture?.dragging) suppressClickUntil = performance.now() + 400;
    clearGesture();
  };
  deck.addEventListener('pointercancel', cancelGesture, options);
  deck.addEventListener('lostpointercapture', cancelGesture, options);
  root.addEventListener('chapterwillchange', event => {
    stopMotion();
    if (!(event as CustomEvent<{ open: boolean }>).detail.open) active = 0;
    paint();
  }, options);
  window.addEventListener('hashchange', stopMotion, options);
  window.addEventListener('popstate', stopMotion, options);
  reduced.addEventListener('change', stopMotion, options);
  const themeObserver = new MutationObserver(stopMotion);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-deck', 'data-palette'] });
  paint();

  const projectName = root.querySelector<HTMLElement>('.bc-project-name');
  const projectNotes = root.querySelector<HTMLDetailsElement>('.bc-project-notes');
  let projectCard: HTMLButtonElement | null = null;
  let originalDetailsId: string | null = null;
  if (projectName && projectNotes) {
    originalDetailsId = projectNotes.getAttribute('id');
    if (!projectNotes.id) projectNotes.id = 'crowdsupply-story';
    projectCard = document.createElement('button');
    projectCard.type = 'button';
    projectCard.className = 'bc-project-story-card';
    projectCard.setAttribute('aria-controls', projectNotes.id);
    projectCard.innerHTML = `<span class="bc-story-card-turn" aria-hidden="true">
      <span class="bc-story-front"><span class="bc-story-rank">Q<span>♠</span></span><span class="bc-story-mark">C</span><span class="bc-story-caption">THE STORY</span></span>
      <span class="bc-story-back"><span class="bc-story-mark">♠</span><span class="bc-story-caption">CROWDSUPPLY</span></span>
    </span>`;
    const syncStory = (): void => {
      projectCard?.setAttribute('aria-expanded', String(projectNotes.open));
      projectCard?.setAttribute('aria-label', `${projectNotes.open ? 'Close' : 'Read'} the Crowdsupply story`);
      if (projectNotes.open) {
        root.dispatchEvent(new CustomEvent('carddiscovered', { detail: { suit: 'spades' } }));
        const story = projectNotes.querySelector<HTMLElement>('p');
        if (story) void animate(story, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], 260);
      }
    };
    projectCard.addEventListener('click', () => { projectNotes.open = !projectNotes.open; }, options);
    projectNotes.addEventListener('toggle', syncStory, options);
    projectName.classList.add('bc-project-name-with-card');
    projectName.append(projectCard);
    syncStory();
  }

  return () => {
    destroyed = true;
    controller.abort();
    themeObserver.disconnect();
    stopMotion();
    projectCard?.remove();
    projectName?.classList.remove('bc-project-name-with-card');
    if (projectNotes && originalDetailsId === null) projectNotes.removeAttribute('id');
    for (const attribute of [...mainCard.attributes]) mainCard.removeAttribute(attribute.name);
    for (const [name, value] of originalMainAttributes) mainCard.setAttribute(name, value);
    hint.replaceChildren(...originalHint);
    if (originalHintLabel === null) hint.removeAttribute('aria-label');
    else hint.setAttribute('aria-label', originalHintLabel);
    place.replaceChildren(...originalChildren);
    place.classList.remove('bc-card-place-enhanced');
  };
}
