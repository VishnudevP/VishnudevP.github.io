type DeckId = 'noir' | 'ivory' | 'midnight' | 'bordeaux';

const decks: { id: DeckId; name: string; finish: string; background: string; mark: string }[] = [
  { id: 'noir', name: 'Noir', finish: 'Black & gold', background: '#1c1b1a', mark: '♠' },
  { id: 'ivory', name: 'Ivory', finish: 'Cream & oxblood', background: '#f5f0e8', mark: '♦' },
  { id: 'midnight', name: 'Midnight', finish: 'Ink & silver', background: '#151c2a', mark: '♣' },
  { id: 'bordeaux', name: 'Bordeaux', finish: 'Wine & rose gold', background: '#241b20', mark: '♥' },
];

const isDeck = (value: string | null | undefined): value is DeckId =>
  decks.some(deck => deck.id === value);

/** Theme selection is presented as a small collection of playable card finishes. */
export function initDecks(root: HTMLElement): () => void {
  const triggers = [...root.querySelectorAll<HTMLButtonElement>('.bc-deck-toggle')];
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  function readPreference(): DeckId | null {
    try {
      const storedDeck = window.localStorage.getItem('vishnu-deck');
      const legacy = window.localStorage.getItem('vishnu-theme');
      if (isDeck(storedDeck)) return storedDeck;
      if (legacy === 'light' || legacy === 'dark') return legacy === 'light' ? 'ivory' : 'noir';
    } catch { /* An unavailable preference store does not prevent switching decks. */ }
    return null;
  }
  const saved = readPreference();
  let followsSystem = saved === null;
  let current: DeckId = saved ?? (system.matches ? 'noir' : 'ivory');
  let previousOverflow: string | null = null;
  let entrance: Animation | null = null;

  const dialog = document.createElement('dialog');
  dialog.className = 'bc-deck-dialog';
  dialog.setAttribute('aria-labelledby', 'bc-deck-title');
  dialog.innerHTML = `
    <div class="bc-deck-dialog-head">
      <p class="bc-kicker">THE COLLECTION</p>
      <h2 id="bc-deck-title">Pick your deck<span>.</span></h2>
      <p class="bc-deck-description">A different feel, from the first card to the last.</p>
    </div>
    <div class="bc-deck-collection" role="group" aria-label="Available decks">
      ${decks.map(deck => `
        <button class="bc-deck-choice" type="button" data-choice="${deck.id}" aria-pressed="false" aria-label="${deck.name}, ${deck.finish}">
          <span class="bc-deck-preview" aria-hidden="true">
            <span class="bc-deck-preview-frame"></span>
            <span class="bc-deck-preview-corner">V<small>${deck.mark}</small></span>
            <span class="bc-deck-preview-pattern"><i></i><i></i><i></i><i></i></span>
            <span class="bc-deck-preview-monogram">V<span>V</span></span>
            <span class="bc-deck-preview-bottom">V<small>${deck.mark}</small></span>
          </span>
          <span class="bc-deck-choice-name">${deck.name}<span class="bc-deck-selection-mark" aria-hidden="true">✓</span></span>
          <span class="bc-deck-choice-finish">${deck.finish}</span>
        </button>
      `).join('')}
    </div>
    <div class="bc-deck-dialog-foot">
      <p class="bc-deck-status" role="status" aria-live="polite"></p>
      <button type="button" class="bc-deck-done">Done</button>
    </div>
  `;
  root.append(dialog);
  const choices = [...dialog.querySelectorAll<HTMLButtonElement>('.bc-deck-choice')];
  const status = dialog.querySelector<HTMLElement>('.bc-deck-status')!;

  function apply(deckId: DeckId, announce: boolean): void {
    const deck = decks.find(item => item.id === deckId)!;
    current = deckId;
    const palette = deckId === 'ivory' ? 'light' : 'dark';
    for (const element of [document.documentElement, root]) {
      element.dataset.deck = deckId;
      element.dataset.palette = palette;
      element.style.colorScheme = palette;
    }
    document.documentElement.style.backgroundColor = deck.background;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = deck.background;
    for (const choice of choices) choice.setAttribute('aria-pressed', String(choice.dataset.choice === deckId));
    for (const trigger of triggers) {
      trigger.setAttribute('aria-label', `Choose deck. Current deck: ${deck.name}`);
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.title = `${deck.name} deck`;
    }
    status.textContent = `${deck.name} selected`;
    if (announce) root.dispatchEvent(new CustomEvent('deckchange', { detail: { deck: deckId, palette } }));
  }

  function releaseScroll(): void {
    if (previousOverflow === null) return;
    document.documentElement.style.overflow = previousOverflow;
    previousOverflow = null;
  }

  function open(): void {
    if (dialog.open) return;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    choices.find(choice => choice.dataset.choice === current)?.focus({ preventScroll: true });
    if (!reduced.matches) {
      entrance?.cancel();
      entrance = dialog.animate([
        { opacity: 0, transform: 'translateY(12px) scale(.98)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 230, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  }

  for (const trigger of triggers) trigger.addEventListener('click', open, options);
  for (const choice of choices) {
    choice.addEventListener('click', () => {
      const id = choice.dataset.choice;
      if (!isDeck(id)) return;
      followsSystem = false;
      try { window.localStorage.setItem('vishnu-deck', id); } catch { /* Use the chosen deck for this visit. */ }
      apply(id, true);
    }, options);
  }
  dialog.querySelector('.bc-deck-done')!.addEventListener('click', () => dialog.close(), options);
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }, options);
  dialog.addEventListener('close', () => { entrance?.cancel(); releaseScroll(); }, options);
  reduced.addEventListener('change', () => { if (reduced.matches) entrance?.cancel(); }, options);
  system.addEventListener('change', () => {
    if (followsSystem) apply(system.matches ? 'noir' : 'ivory', true);
  }, options);
  window.addEventListener('storage', event => {
    if (event.key !== null && event.key !== 'vishnu-deck' && event.key !== 'vishnu-theme') return;
    const preference = readPreference();
    followsSystem = preference === null;
    const next = preference ?? (system.matches ? 'noir' : 'ivory');
    if (next !== current) apply(next, true);
  }, options);
  apply(current, false);

  return () => {
    controller.abort();
    entrance?.cancel();
    if (dialog.open) dialog.close();
    releaseScroll();
    dialog.remove();
  };
}
