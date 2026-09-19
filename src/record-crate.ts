interface CrateOptions {
  playlists: Array<{ title: string; href: string }>;
  announce: (message: string) => void;
}

const svgNS = 'http://www.w3.org/2000/svg';

/** A little crate of real saved months. Nothing plays until its Spotify link is opened. */
export function mountRecordCrate(art: HTMLElement, controls: HTMLElement, options: CrateOptions): () => void {
  const playlists = options.playlists.filter(playlist => playlist.title.trim() && playlist.href);
  if (!playlists.length) return () => {};
  const controller = new AbortController();
  const listen = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motions = new Set<Animation>();
  let selected = 0;
  let gesture: { id: number; x: number; y: number; dx: number; horizontal: boolean } | null = null;
  let suppressClickUntil = 0;
  let disposed = false;

  art.classList.add('bc-crate-art');
  controls.classList.add('bc-crate-controls');
  const browse = document.createElement('button');
  browse.type = 'button';
  browse.className = 'bc-crate-browse';
  browse.innerHTML = `
    <svg class="bc-crate-scene" viewBox="0 0 270 242" fill="none" aria-hidden="true">
      <g class="bc-crate-ground">
        <path d="M23 176 133 113 248 179 138 242M43 188l111-64M65 201l111-64M86 214l112-64M44 164l115 66M66 151l115 66M88 138l115 66"/>
      </g>
      <path class="bc-crate-shadow" d="m39 175 92 53 116-67-92-53Z"/>
      <g class="bc-crate-box-back">
        <path class="bc-crate-fill" d="m43 141 93-53 92 53-93 54Z"/>
        <path d="m43 141 93-53 92 53-93 54Z M136 88v48 M43 141l93 53 92-53"/>
        <path class="bc-crate-soft" d="m51 141 85-48 84 48-85 49Z"/>
      </g>
      <g class="bc-crate-sleeves"></g>
      <g class="bc-crate-box-front">
        <path class="bc-crate-fill" d="m43 141 92 53 93-53v47l-93 54-92-53Z"/>
        <path d="m43 141 92 53 93-53v47l-93 54-92-53Z M135 194v48"/>
        <path class="bc-crate-soft" d="m48 150 82 47v34l-82-47Z M141 198l81-47v33l-81 47Z"/>
        <path d="m54 161 69 40m-69-29 69 40m-69-29 69 40m25-12 67-39m-67 28 67-39" class="bc-crate-slats"/>
        <path class="bc-crate-label" d="m166 187 27-16v14l-27 16Z"/>
        <path d="m171 188 17-10m-17 14 10-6" class="bc-crate-label-ink"/>
        <path d="m49 186 4 2m71 40 4 2m15 0 4-2m71-41 4-2" class="bc-crate-nails"/>
      </g>
    </svg>
    <span class="bc-crate-guide">Swipe or tap to browse</span>`;
  const scene = browse.querySelector<SVGSVGElement>('svg')!;
  const sleeveContainer = browse.querySelector<SVGGElement>('.bc-crate-sleeves')!;
  art.replaceChildren(browse);

  const selectedTitle = document.createElement('span');
  selectedTitle.className = 'bc-crate-selected';
  const open = document.createElement('a');
  open.className = 'bc-crate-open';
  open.target = '_blank';
  open.rel = 'noopener noreferrer';
  open.textContent = 'Open playlist';
  const caption = document.createElement('div');
  caption.className = 'bc-crate-caption';
  caption.append(selectedTitle, open);
  const months = document.createElement('div');
  months.className = 'bc-crate-months';
  months.setAttribute('role', 'group');
  months.setAttribute('aria-label', 'Saved playlists');
  const monthButtons = playlists.map((playlist, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bc-crate-month';
    button.textContent = playlist.title.replace(/\s+\d{4}$/, '').slice(0, 3);
    button.setAttribute('aria-label', `Browse ${playlist.title}`);
    button.addEventListener('click', () => select(index), listen);
    months.append(button);
    return button;
  });
  controls.replaceChildren(months, caption);

  function clearMotions(): void {
    motions.forEach(animation => animation.cancel());
    motions.clear();
  }

  function sleeve(depth: number, playlistIndex: number): SVGGElement {
    const slot = document.createElementNS(svgNS, 'g');
    slot.setAttribute('transform', `translate(${57 + depth * 25} ${66 - depth * 14})`);
    const lifted = document.createElementNS(svgNS, 'g');
    lifted.classList.add('bc-crate-sleeve');
    lifted.dataset.active = String(depth === 0);
    lifted.setAttribute('transform', depth === 0 ? 'translate(0 -25)' : 'translate(0 0)');
    const front = document.createElementNS(svgNS, 'g');
    front.setAttribute('transform', 'matrix(.86 .5 0 1 0 0)');
    // Each cover is engraved rather than using a made-up photo from the month.
    front.innerHTML = `
      <g class="bc-crate-vinyl">
        <circle cx="43" cy="26" r="31" class="bc-crate-disc"/>
        <circle cx="43" cy="26" r="25"/>
        <circle cx="43" cy="26" r="20"/>
        <circle cx="43" cy="26" r="7" class="bc-crate-disc-label"/>
        <circle cx="43" cy="26" r="1.5" class="bc-crate-disc-hole"/>
      </g>
      <rect class="bc-crate-cover" x="0" y="22" width="86" height="96" rx="1.5"/>
      <path class="bc-crate-soft" d="M5 27h76v86H5Z"/>
      <g class="bc-crate-cover-motif">
        <path d="M13 92V46m0 0 59 34M13 46l59-3v49H13m12-58 34 20-34 20 34 19M13 81l59-34"/>
        <circle cx="43" cy="67" r="20"/>
        <circle cx="43" cy="67" r="13"/>
      </g>
      <text x="11" y="105" class="bc-crate-cover-name"></text>
      <text x="75" y="35" text-anchor="end" class="bc-crate-cover-number">${String(playlistIndex + 1).padStart(2, '0')}</text>`;
    front.querySelector('.bc-crate-cover-name')!.textContent = playlists[playlistIndex].title.toUpperCase();
    lifted.append(front);
    slot.append(lifted);
    return slot;
  }

  function paint(): void {
    const playlist = playlists[selected];
    selectedTitle.textContent = playlist.title;
    open.href = playlist.href;
    open.setAttribute('aria-label', `Open ${playlist.title} playlist on Spotify`);
    browse.setAttribute('aria-label', `${playlist.title} record selected. Browse the next saved month`);
    monthButtons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === selected)));
    const count = Math.min(playlists.length, 3);
    const layers: SVGGElement[] = [];
    for (let depth = count - 1; depth >= 0; depth--) layers.push(sleeve(depth, (selected + depth) % playlists.length));
    sleeveContainer.replaceChildren(...layers);
  }

  function select(index: number, direction = 1): void {
    if (disposed) return;
    const next = (index + playlists.length) % playlists.length;
    if (next === selected) return;
    clearMotions();
    selected = next;
    paint();
    if (!reduced.matches) {
      const active = sleeveContainer.querySelector<SVGGElement>('[data-active="true"]')!;
      const animation = active.animate(
        [{ transform: `translate(${direction * 7}px, 3px)` }, { transform: 'translate(0, -25px)' }],
        { duration: 380, easing: 'cubic-bezier(.22,.8,.22,1)' },
      );
      motions.add(animation);
      void animation.finished.catch(() => {}).finally(() => { animation.cancel(); motions.delete(animation); });
    }
    options.announce(`${playlists[selected].title}. Playlist selected.`);
  }

  browse.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
    select(selected + 1);
  }, listen);
  browse.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    select(selected + direction, direction);
  }, listen);
  browse.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || playlists.length < 2) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, horizontal: false };
  }, listen);
  browse.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 8) return;
      gesture.horizontal = true;
      browse.setPointerCapture(event.pointerId);
      browse.dataset.dragging = 'true';
    }
    gesture.dx = dx;
    if (!reduced.matches) scene.style.transform = `translateX(${Math.max(-12, Math.min(12, dx * .1))}px)`;
  }, listen);

  function finishGesture(event: PointerEvent): void {
    if (!gesture || gesture.id !== event.pointerId) return;
    const { horizontal, dx, id } = gesture;
    gesture = null;
    delete browse.dataset.dragging;
    scene.style.removeProperty('transform');
    if (browse.hasPointerCapture(id)) browse.releasePointerCapture(id);
    if (horizontal) {
      suppressClickUntil = performance.now() + 400;
      if (event.type === 'pointerup' && Math.abs(dx) > 26) select(selected + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  }
  browse.addEventListener('pointerup', finishGesture, listen);
  browse.addEventListener('pointercancel', finishGesture, listen);
  browse.addEventListener('lostpointercapture', finishGesture, listen);
  reduced.addEventListener('change', () => { clearMotions(); scene.style.removeProperty('transform'); }, listen);
  paint();

  return () => {
    disposed = true;
    controller.abort();
    clearMotions();
    if (gesture && browse.hasPointerCapture(gesture.id)) browse.releasePointerCapture(gesture.id);
    gesture = null;
    art.classList.remove('bc-crate-art');
    controls.classList.remove('bc-crate-controls');
  };
}
