type Suit = 'clubs' | 'diamonds' | 'spades' | 'hearts';

const discoveries: ReadonlyArray<{ suit: Suit; mark: string; clue: string; found: string }> = [
  { suit: 'clubs', mark: '♣', clue: 'Turn through all four cards at the top.', found: 'Four cards at the top.' },
  { suit: 'diamonds', mark: '♦', clue: 'Visit three companies in Experience.', found: 'Three stops in Experience.' },
  { suit: 'spades', mark: '♠', clue: 'Turn over the Crowdsupply story card.', found: 'The story behind Crowdsupply.' },
  { suit: 'hearts', mark: '♥', clue: 'Draw a card in Beyond work.', found: 'A card from Beyond work.' },
];

const storageKey = 'vishnu-card-discoveries';
const isSuit = (value: unknown): value is Suit => discoveries.some(item => item.suit === value);

interface Collection {
  details: HTMLDetailsElement;
  summary: HTMLElement;
  marks: HTMLElement[];
  clues: HTMLElement[];
  list: HTMLUListElement;
  reward: HTMLElement;
  cards: HTMLElement[];
}

/** Small, optional discoveries shared by the two page footers. */
export function initDiscoveries(root: HTMLElement): () => void {
  const footers = Array.from(root.querySelectorAll<HTMLElement>('.bc-footer'));
  if (!footers.length) return () => {};

  const found = new Set<Suit>();
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]');
    if (Array.isArray(saved)) saved.filter(isSuit).forEach(suit => found.add(suit));
  } catch { /* The little discoveries also work without browser storage. */ }

  const controller = new AbortController();
  const { signal } = controller;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motions = new Set<Animation>();
  const live = document.createElement('span');
  live.className = 'bc-discoveries-live';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  root.append(live);

  function track(animation: Animation): void {
    motions.add(animation);
    void animation.finished.catch(() => {}).finally(() => motions.delete(animation));
  }

  function deal(collection: Collection): void {
    collection.cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    if (reducedMotion.matches) return;
    collection.cards.forEach((card, index) => {
      track(card.animate([
        { opacity: 0, transform: 'translate(0, 19px) rotate(0deg)' },
        { opacity: 1, transform: card.style.transform },
      ], {
        duration: 420,
        delay: index * 64,
        easing: 'cubic-bezier(.22,.8,.25,1)',
        fill: 'backwards',
      }));
    });
  }

  const collections = footers.map(footer => {
    const details = document.createElement('details');
    details.className = 'bc-discoveries';
    details.innerHTML = `
      <summary class="bc-discoveries-summary" title="A few things to find">
        ${discoveries.map(item => `<span class="bc-discovery-mark" aria-hidden="true">${item.mark}</span>`).join('')}
      </summary>
      <div class="bc-discoveries-panel">
        <p class="bc-discoveries-heading">A few things to find</p>
        <ul class="bc-discoveries-clues">
          ${discoveries.map(item => `<li><span aria-hidden="true">${item.mark}</span><span class="bc-discovery-clue"></span></li>`).join('')}
        </ul>
        <div class="bc-discoveries-reward" hidden>
          <div class="bc-discoveries-hand" role="img" aria-label="A royal flush in spades: ten, jack, queen, king, ace.">
            ${['10', 'J', 'Q', 'K', 'A'].map(rank => `
              <span class="bc-discoveries-card" aria-hidden="true">
                <span class="bc-discoveries-rank">${rank}<small>♠</small></span>
                <span class="bc-discoveries-pip">♠</span>
                <span class="bc-discoveries-rank bc-discoveries-rank-bottom">${rank}<small>♠</small></span>
              </span>`).join('')}
          </div>
          <p class="bc-discoveries-thanks">Thanks for looking around.</p>
          <button class="bc-discoveries-redeal" type="button">Deal again</button>
        </div>
      </div>`;
    footer.append(details);

    const collection: Collection = {
      details,
      summary: details.querySelector<HTMLElement>('summary')!,
      marks: Array.from(details.querySelectorAll<HTMLElement>('.bc-discovery-mark')),
      clues: Array.from(details.querySelectorAll<HTMLElement>('.bc-discovery-clue')),
      list: details.querySelector<HTMLUListElement>('.bc-discoveries-clues')!,
      reward: details.querySelector<HTMLElement>('.bc-discoveries-reward')!,
      cards: Array.from(details.querySelectorAll<HTMLElement>('.bc-discoveries-card')),
    };
    collection.cards.forEach((card, index) => {
      const offset = index - 2;
      card.style.transform = `translate(${offset * 39}px, ${Math.abs(offset) * 4}px) rotate(${offset * 7}deg)`;
    });
    details.addEventListener('toggle', () => {
      if (details.open && found.size === discoveries.length) deal(collection);
    }, { signal });
    details.querySelector<HTMLButtonElement>('.bc-discoveries-redeal')!.addEventListener('click', () => deal(collection), { signal });
    details.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        event.preventDefault();
        event.stopPropagation();
        details.open = false;
        collection.summary.focus({ preventScroll: true });
      }
    }, { signal });
    return collection;
  });

  function paint(): void {
    const complete = found.size === discoveries.length;
    collections.forEach(collection => {
      collection.summary.setAttribute('aria-label', `Card discoveries, ${found.size} of ${discoveries.length}`);
      collection.details.dataset.complete = String(complete);
      discoveries.forEach((item, index) => {
        const discovered = found.has(item.suit);
        collection.marks[index]!.dataset.found = String(discovered);
        const clue = collection.clues[index]!;
        clue.textContent = discovered ? item.found : item.clue;
        clue.parentElement!.dataset.found = String(discovered);
        clue.parentElement!.setAttribute('aria-label', `${discovered ? 'Found' : 'Clue'}: ${clue.textContent}`);
      });
      collection.list.hidden = complete;
      collection.reward.hidden = !complete;
      collection.details.querySelector<HTMLElement>('.bc-discoveries-heading')!.textContent = complete
        ? 'All four suits, found.'
        : 'A few things to find';
    });
  }

  root.addEventListener('carddiscovered', event => {
    const detail: unknown = (event as CustomEvent<unknown>).detail;
    if (!detail || typeof detail !== 'object' || !('suit' in detail) || !isSuit(detail.suit) || found.has(detail.suit)) return;
    found.add(detail.suit);
    try { sessionStorage.setItem(storageKey, JSON.stringify([...found])); } catch { /* Storage is optional. */ }
    paint();
    if (found.size === discoveries.length) {
      live.textContent = 'All four card discoveries found. A royal flush is waiting in the footer.';
      collections.filter(collection => collection.details.open).forEach(deal);
    }
  }, { signal });

  root.addEventListener('chapterwillchange', () => {
    collections.forEach(collection => { collection.details.open = false; });
    motions.forEach(animation => animation.cancel());
  }, { signal });

  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) motions.forEach(animation => animation.cancel());
  }, { signal });

  paint();
  return () => {
    controller.abort();
    motions.forEach(animation => animation.cancel());
    collections.forEach(collection => collection.details.remove());
    live.remove();
  };
}
