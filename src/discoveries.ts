type Suit = 'clubs' | 'diamonds' | 'spades' | 'hearts';

const discoveries: ReadonlyArray<{ suit: Suit; mark: string; clue: string; found: string }> = [
  { suit: 'clubs', mark: '♣', clue: 'Browse all four cards at the top.', found: 'All four cards viewed.' },
  { suit: 'diamonds', mark: '♦', clue: 'View three roles in Experience.', found: 'Three roles viewed.' },
  { suit: 'spades', mark: '♠', clue: 'Open Crowdsupply’s project details.', found: 'Project details opened.' },
  { suit: 'hearts', mark: '♥', clue: 'Draw a card in Beyond work.', found: 'Personal card drawn.' },
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
  cards: HTMLButtonElement[];
  hand: HTMLElement;
  instruction: HTMLElement;
  reader: HTMLElement;
  action: HTMLButtonElement;
  phase: 'ready' | 'mixing' | 'choosing' | 'result';
  order: number[];
  selected: number | null;
  epoch: number;
  motions: Set<Animation>;
}

const trickCards = [
  { rank: 'A', suit: '♠', label: 'Ace of spades' },
  { rank: 'K', suit: '♦', label: 'King of diamonds' },
  { rank: 'Q', suit: '♣', label: 'Queen of clubs' },
] as const;
const positions = ['left', 'middle', 'right'] as const;

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
  const live = document.createElement('span');
  live.className = 'bc-discoveries-live';
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  root.append(live);

  async function motion(collection: Collection, animation: Animation): Promise<void> {
    collection.motions.add(animation);
    try { await animation.finished; } catch { /* A closed panel cancels its current round. */ }
    finally { collection.motions.delete(animation); animation.cancel(); }
  }

  function stop(collection: Collection): void {
    collection.epoch++;
    collection.motions.forEach(animation => animation.cancel());
    collection.motions.clear();
  }

  function paintTrick(collection: Collection): void {
    const { phase } = collection;
    collection.reward.dataset.phase = phase;
    const faceDown = phase === 'mixing' || phase === 'choosing';
    collection.order.forEach((identity, slot) => {
      const card = collection.cards[identity]!;
      card.style.left = `${(slot + .5) * 100 / 3}%`;
      card.dataset.faceDown = String(faceDown);
      card.dataset.correct = String(phase === 'result' && identity === 0);
      card.dataset.selected = String(phase === 'result' && identity === collection.selected);
      card.tabIndex = phase === 'choosing' ? 0 : -1;
      card.setAttribute('aria-disabled', String(phase !== 'choosing'));
      card.setAttribute('aria-label', faceDown
        ? `${phase === 'choosing' ? 'Choose the' : 'Face down,'} ${positions[slot]} card`
        : `${trickCards[identity]!.label}, ${positions[slot]} card${phase === 'result' && identity === collection.selected ? ', your pick' : ''}`);
      card.querySelector<HTMLElement>('.bc-trick-card-result')!.textContent = phase === 'result'
        ? identity === 0 ? 'The ace' : identity === collection.selected ? 'Your pick' : ''
        : '';
      // Keep keyboard navigation in the same left-to-right order as the cards.
      if (collection.hand.children[slot] !== card) collection.hand.insertBefore(card, collection.hand.children[slot] ?? null);
    });
    collection.action.setAttribute('aria-disabled', String(phase === 'mixing'));
    collection.action.textContent = phase === 'mixing' ? 'Shuffling…'
      : phase === 'result' ? 'Try again'
      : phase === 'choosing' ? 'Start over'
      : reducedMotion.matches ? 'Hide the cards' : 'Mix the cards';
  }

  function reset(collection: Collection, rearrange = false): void {
    stop(collection);
    collection.phase = 'ready';
    collection.selected = null;
    if (rearrange) {
      for (let index = collection.order.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [collection.order[index], collection.order[other]] = [collection.order[other]!, collection.order[index]!];
      }
    }
    collection.instruction.textContent = reducedMotion.matches
      ? 'Remember where the ace is, then hide the cards.'
      : 'Follow the ace as the cards move.';
    collection.reader.textContent = '';
    paintTrick(collection);
  }

  async function mix(collection: Collection): Promise<void> {
    if (collection.phase !== 'ready' || !collection.details.open) return;
    stop(collection);
    const token = collection.epoch;
    const active = () => token === collection.epoch && collection.details.open && !signal.aborted;
    const restoreFocus = document.activeElement === collection.action;
    collection.phase = 'mixing';
    collection.instruction.textContent = reducedMotion.matches ? 'Remember the ace’s position.' : 'Watch closely…';
    paintTrick(collection);
    const swaps: string[] = [];

    if (!reducedMotion.matches) {
      await Promise.all(collection.cards.map(card => motion(collection,
        card.querySelector<HTMLElement>('.bc-trick-flipper')!.animate([
          { transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' },
        ], { duration: 240, easing: 'ease-in-out' }))));
      if (!active()) return;
      const pairs: ReadonlyArray<readonly [number, number]> = [[0, 1], [1, 2], [0, 2]];
      let previous = -1;
      for (let step = 0; step < 3; step++) {
        const choices = pairs.map((_, index) => index).filter(index => index !== previous);
        const choice = choices[Math.floor(Math.random() * choices.length)]!;
        previous = choice;
        const [firstSlot, secondSlot] = pairs[choice]!;
        const first = collection.cards[collection.order[firstSlot]!]!;
        const second = collection.cards[collection.order[secondSlot]!]!;
        const distance = (secondSlot - firstSlot) * collection.hand.clientWidth / 3;
        swaps.push(`${positions[firstSlot]} and ${positions[secondSlot]}`);
        await Promise.all([first, second].map((card, index) => {
          const direction = index === 0 ? 1 : -1;
          return motion(collection, card.animate([
            { transform: 'translateX(-50%)', offset: 0 },
            { transform: `translate(calc(-50% + ${distance * direction / 2}px), ${direction * -13}px) rotate(${direction * 4}deg)`, offset: .5 },
            { transform: `translateX(calc(-50% + ${distance * direction}px))`, offset: 1 },
          ], { duration: 420, easing: 'cubic-bezier(.45,0,.25,1)' }));
        }));
        if (!active()) return;
        [collection.order[firstSlot], collection.order[secondSlot]] = [collection.order[secondSlot]!, collection.order[firstSlot]!];
        paintTrick(collection);
      }
    }
    if (!active()) return;
    collection.phase = 'choosing';
    collection.instruction.textContent = 'Where’s the ace? Pick a card.';
    collection.reader.textContent = swaps.length ? `The swaps were: ${swaps.join('; then ')}.` : 'The cards stayed in their original positions.';
    paintTrick(collection);
    if (restoreFocus && document.activeElement === collection.action) collection.cards[collection.order[0]!]!.focus({ preventScroll: true });
  }

  function choose(collection: Collection, identity: number): void {
    if (collection.phase !== 'choosing') return;
    collection.selected = identity;
    collection.phase = 'result';
    collection.instruction.textContent = identity === 0
      ? 'You found the ace.'
      : `The ace was ${collection.order.indexOf(0) === 1 ? 'in the middle' : `on the ${positions[collection.order.indexOf(0)]}`}.`;
    collection.reader.textContent = '';
    paintTrick(collection);
    if (!reducedMotion.matches) {
      collection.cards.forEach(card => {
        void motion(collection, card.querySelector<HTMLElement>('.bc-trick-flipper')!.animate([
          { transform: 'rotateY(180deg)' }, { transform: 'rotateY(0deg)' },
        ], { duration: 280, easing: 'ease-in-out' }));
      });
    }
  }

  const collections = footers.map(footer => {
    const details = document.createElement('details');
    details.className = 'bc-discoveries';
    details.innerHTML = `
      <summary class="bc-discoveries-summary" title="Find four suits">
        ${discoveries.map(item => `<span class="bc-discovery-mark" aria-hidden="true">${item.mark}</span>`).join('')}
      </summary>
      <div class="bc-discoveries-panel">
        <p class="bc-discoveries-heading">Find four suits</p>
        <ul class="bc-discoveries-clues">
          ${discoveries.map(item => `<li><span aria-hidden="true">${item.mark}</span><span class="bc-discovery-clue"></span></li>`).join('')}
        </ul>
        <div class="bc-discoveries-reward" hidden>
          <div class="bc-trick-table" role="group" aria-label="Find the ace">
            ${trickCards.map(card => `
              <button class="bc-trick-card" type="button" tabindex="-1" aria-disabled="true">
                <span class="bc-trick-flipper" aria-hidden="true">
                  <span class="bc-trick-face">
                    <span class="bc-trick-rank">${card.rank}<small>${card.suit}</small></span>
                    <span class="bc-trick-pip">${card.suit}</span>
                    <span class="bc-trick-rank bc-trick-rank-bottom">${card.rank}<small>${card.suit}</small></span>
                  </span>
                  <span class="bc-trick-back"><span>V</span></span>
                </span>
                <span class="bc-trick-card-result" aria-hidden="true"></span>
              </button>`).join('')}
          </div>
          <p class="bc-trick-instruction" role="status" aria-live="polite"></p>
          <span class="bc-trick-reader bc-discoveries-live" role="status" aria-live="polite"></span>
          <button class="bc-trick-action" type="button">Mix the cards</button>
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
      cards: Array.from(details.querySelectorAll<HTMLButtonElement>('.bc-trick-card')),
      hand: details.querySelector<HTMLElement>('.bc-trick-table')!,
      instruction: details.querySelector<HTMLElement>('.bc-trick-instruction')!,
      reader: details.querySelector<HTMLElement>('.bc-trick-reader')!,
      action: details.querySelector<HTMLButtonElement>('.bc-trick-action')!,
      phase: 'ready',
      order: [0, 1, 2],
      selected: null,
      epoch: 0,
      motions: new Set(),
    };
    collection.cards.forEach((card, identity) => {
      card.addEventListener('click', () => choose(collection, identity), { signal });
      card.addEventListener('keydown', event => {
        if (collection.phase !== 'choosing' || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const index = collection.order.indexOf(identity);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
        collection.cards[collection.order[next]!]!.focus({ preventScroll: true });
      }, { signal });
    });
    details.addEventListener('toggle', () => {
      if (!details.open) reset(collection);
    }, { signal });
    collection.action.addEventListener('click', () => {
      if (collection.phase === 'ready') void mix(collection);
      else if (collection.phase !== 'mixing') reset(collection, true);
    }, { signal });
    details.addEventListener('keydown', event => {
      if (event.key === 'Escape' && details.open) {
        event.preventDefault();
        event.stopPropagation();
        details.open = false;
        collection.summary.focus({ preventScroll: true });
      }
    }, { signal });
    reset(collection);
    return collection;
  });

  function paint(): void {
    const complete = found.size === discoveries.length;
    collections.forEach(collection => {
      collection.summary.setAttribute('aria-label', `Card discoveries, ${found.size} of ${discoveries.length}${complete ? '. Find the ace unlocked' : ''}`);
      collection.summary.title = complete ? 'All four suits found. Play Find the ace.' : 'Find four suits';
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
        ? 'Find the ace'
        : 'Find four suits';
    });
  }

  root.addEventListener('carddiscovered', event => {
    const detail: unknown = (event as CustomEvent<unknown>).detail;
    if (!detail || typeof detail !== 'object' || !('suit' in detail) || !isSuit(detail.suit) || found.has(detail.suit)) return;
    found.add(detail.suit);
    try { sessionStorage.setItem(storageKey, JSON.stringify([...found])); } catch { /* Storage is optional. */ }
    paint();
    if (found.size === discoveries.length) {
      live.textContent = 'All four suits found. Find the ace is unlocked in the footer.';
    }
  }, { signal });

  root.addEventListener('chapterwillchange', () => {
    collections.forEach(collection => { collection.details.open = false; reset(collection); });
  }, { signal });

  root.addEventListener('deckchange', () => collections.forEach(collection => reset(collection)), { signal });
  reducedMotion.addEventListener('change', () => {
    collections.forEach(collection => reset(collection));
  }, { signal });

  paint();
  return () => {
    controller.abort();
    collections.forEach(collection => { stop(collection); collection.details.remove(); });
    live.remove();
  };
}
