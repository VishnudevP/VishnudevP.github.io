/** Tactile shortcuts that leave every chapter available through normal links. */
export function initCards(root: HTMLElement): () => void {
  const place = root.querySelector<HTMLElement>('.bc-card-place');
  const mainCard = place?.querySelector<HTMLButtonElement>('.bc-playing-card');
  const hint = place?.querySelector<HTMLButtonElement>('.bc-card-hint');
  if (!place || !mainCard || !hint) return () => {};

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set<Animation>();
  const ghosts = new Set<HTMLElement>();
  const originalChildren = [...place.childNodes];
  let expanded = false;
  let navigation = 0;
  let destroyed = false;

  const chapters = [
    { name: 'Building', target: 'work', rank: 'A', suit: '♣', caption: 'OVERSINE' },
    { name: 'Experience', target: 'experience', rank: 'K', suit: '♦', caption: 'THE EXPERIENCE' },
    { name: 'Projects', target: 'projects', rank: 'Q', suit: '♠', caption: 'PAST BUILDS' },
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
  deck.setAttribute('aria-label', 'Portfolio chapter cards');
  deck.dataset.expanded = 'false';

  const links = document.createElement('div');
  links.className = 'bc-deck-links';
  links.hidden = true;
  const chapterCards = chapters.map((chapter, index) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'bc-chapter-card';
    card.style.setProperty('--bc-card-index', String(index));
    card.setAttribute('aria-label', `Explore ${chapter.name.toLowerCase()}`);
    card.innerHTML = artwork(chapter.rank, chapter.suit, chapter.caption, chapter.name);
    card.inert = true;
    card.tabIndex = -1;
    card.setAttribute('aria-hidden', 'true');
    deck.append(card);
    const link = document.createElement('a');
    link.href = `#${chapter.target}`;
    link.textContent = chapter.name;
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      void visit(chapter.target, card);
    }, options);
    links.append(link);
    card.addEventListener('click', () => void visit(chapter.target, card), options);
    return card;
  });
  deck.append(mainCard);

  const action = document.createElement('button');
  action.className = 'bc-deck-action';
  action.type = 'button';
  action.textContent = 'Explore deck';
  action.setAttribute('aria-expanded', 'false');
  action.setAttribute('aria-controls', deck.id);
  const controls = document.createElement('div');
  controls.className = 'bc-deck-controls';
  controls.append(action, hint);
  place.replaceChildren(deck, controls, links);
  place.classList.add('bc-card-place-enhanced');

  function stopMotion(): void {
    navigation++;
    animations.forEach(animation => animation.cancel());
    animations.clear();
    ghosts.forEach(ghost => ghost.remove());
    ghosts.clear();
  }

  function setExpanded(value: boolean): void {
    expanded = value;
    deck.dataset.expanded = String(value);
    action.setAttribute('aria-expanded', String(value));
    action.textContent = value ? 'Gather cards' : 'Explore deck';
    links.hidden = !value;
    for (const card of chapterCards) {
      card.inert = !value;
      card.tabIndex = value ? 0 : -1;
      if (value) card.removeAttribute('aria-hidden');
      else card.setAttribute('aria-hidden', 'true');
    }
  }

  async function animate(element: HTMLElement, frames: Keyframe[], duration: number): Promise<void> {
    if (reduced.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, {
      duration, easing: 'cubic-bezier(.22,.72,.24,1)', fill: 'both',
    });
    animations.add(animation);
    await animation.finished.catch(() => undefined);
    animation.cancel();
    animations.delete(animation);
  }

  async function visit(id: string, source: HTMLElement): Promise<void> {
    const destination = root.querySelector<HTMLElement>(`#${id}`);
    if (!destination || root.dataset.busy === 'true') return;
    stopMotion();
    const ticket = navigation;
    if (!reduced.matches && typeof source.animate === 'function') {
      const box = source.getBoundingClientRect();
      const rootBox = root.getBoundingClientRect();
      const targetBox = destination.getBoundingClientRect();
      const ghost = source.cloneNode(true) as HTMLElement;
      ghost.classList.add('bc-card-deal-ghost');
      ghost.removeAttribute('id');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.tabIndex = -1;
      ghost.inert = true;
      const width = source.offsetWidth;
      const height = source.offsetHeight;
      let angle = 0;
      try {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(source).transform);
        angle = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
      } catch { /* A planar deal remains available without DOMMatrix. */ }
      ghost.style.width = `${width}px`;
      ghost.style.height = `${height}px`;
      ghost.style.transformOrigin = '50% 50%';
      ghost.style.left = `${box.left + box.width / 2 - rootBox.left - width / 2}px`;
      ghost.style.top = `${box.top + box.height / 2 - rootBox.top - height / 2}px`;
      root.append(ghost);
      ghosts.add(ghost);
      const distance = Math.max(80, Math.min(targetBox.top - box.top, window.innerHeight * .5));
      await animate(ghost, [
        { transform: `rotate(${angle}deg)`, opacity: .92 },
        { transform: `translate(-24px, ${distance * .3}px) rotate(-12deg) scale(.93)`, opacity: .92, offset: .45 },
        { transform: `translate(-80px, ${distance}px) rotate(-8deg) scale(.52)`, opacity: 0 },
      ], 430);
      ghost.remove();
      ghosts.delete(ghost);
    }
    if (destroyed || ticket !== navigation || root.dataset.busy === 'true'
      || root.querySelector<HTMLElement>('.bc-cover')?.hidden) return;
    setExpanded(false);
    try { window.history.pushState(null, '', `#${id}`); } catch { /* Links still navigate locally. */ }
    destination.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    const heading = destination.querySelector<HTMLElement>('h2') ?? destination;
    const previousTabIndex = heading.getAttribute('tabindex');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    if (previousTabIndex === null) heading.removeAttribute('tabindex');
    else heading.setAttribute('tabindex', previousTabIndex);
    void animate(destination, [{ opacity: .55 }, { opacity: 1 }], 420);
  }

  action.addEventListener('click', () => {
    stopMotion();
    setExpanded(!expanded);
  }, options);
  place.addEventListener('keydown', event => {
    if (event.key === 'Escape' && expanded) {
      stopMotion();
      setExpanded(false);
      action.focus({ preventScroll: true });
    }
  }, options);
  // The original playing card retains its own Beyond Work deal animation.
  mainCard.addEventListener('click', stopMotion, { ...options, capture: true });
  hint.addEventListener('click', stopMotion, { ...options, capture: true });
  root.querySelector('.bc-bonus-link')?.addEventListener('click', stopMotion, { ...options, capture: true });
  window.addEventListener('hashchange', stopMotion, options);
  window.addEventListener('popstate', stopMotion, options);
  reduced.addEventListener('change', stopMotion, options);
  const themeObserver = new MutationObserver(stopMotion);
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-deck', 'data-palette'] });

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
    place.replaceChildren(...originalChildren);
    place.classList.remove('bc-card-place-enhanced');
  };
}
