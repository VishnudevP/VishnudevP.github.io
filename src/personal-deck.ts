import { mountRecordCrate } from './record-crate';
import { mountStartingGrid } from './starting-grid';

interface PersonalCard {
  id: string;
  rank: string;
  suit: string;
  topic: string;
  title: string;
  copy: string;
  action?: 'race' | 'camera' | 'music';
}

const cards: readonly PersonalCard[] = [
  { id: 'music', rank: 'Q', suit: '♥', topic: 'MUSIC', title: 'A month, saved.', copy: 'I used to make a playlist for each month, with a photo I took that month as its cover.', action: 'music' },
  { id: 'f1', rank: 'A', suit: '♦', topic: 'FORMULA 1', title: 'Race weekends.', copy: 'F1 is on the watch list. You know what comes after five red lights.', action: 'race' },
  { id: 'poker', rank: 'K', suit: '♠', topic: 'POKER', title: 'At the table.', copy: 'Away from the keyboard, a different kind of game.' },
  { id: 'chapters', rank: 'J', suit: '♣', topic: 'ANIME & MANHWA', title: 'One more chapter.', copy: 'Sometimes an episode. Sometimes a chapter. Both belong here.' },
  { id: 'photography', rank: '9', suit: '♦', topic: 'PHOTOGRAPHY', title: 'Through the lens.', copy: 'The photos on my old monthly playlist covers were little pieces of that month.', action: 'camera' },
  { id: 'ufc', rank: '10', suit: '♠', topic: 'UFC', title: 'Fight nights.', copy: 'Another part of life away from code: UFC.' },
  { id: 'valorant', rank: '7', suit: '♣', topic: 'VALORANT', title: 'Reaver. Prelude.', copy: 'Reaver and Prelude to Chaos. My picks for dark, dramatic skin designs.' },
];

/** Draw from a shuffled bag, so every interest appears before any repeats. */
export function initPersonalDeck(root: HTMLElement): () => void {
  const article = root.querySelector<HTMLElement>('.bc-weekends');
  const trigger = root.querySelector<HTMLButtonElement>('.bc-small-card');
  const miniature = root.querySelector<HTMLElement>('.bc-personal-mini');
  const hint = root.querySelector<HTMLElement>('.bc-shuffle-hint');
  const title = root.querySelector<HTMLElement>('.bc-weekend-title');
  const live = root.querySelector<HTMLElement>('.bc-live');
  if (!article || !trigger || !miniature || !hint || !title || !live) return () => {};
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motions = new Set<Animation>();
  let bag: PersonalCard[] = [];
  let previous = '';
  const seen = new Set<string>();
  let disposeScene = (): void => {};
  let effectEpoch = 0;
  let drawing = false;
  const stage = document.createElement('div');
  stage.className = 'bc-personal-stage';
  stage.hidden = true;
  stage.innerHTML = `
    <button type="button" class="bc-personal-close"><span aria-hidden="true">×</span> Close card</button>
    <article class="bc-personal-card" aria-labelledby="personal-card-title" tabindex="-1">
      <div class="bc-personal-card-top"><span class="bc-personal-rank" aria-hidden="true"></span><span class="bc-personal-count"></span></div>
      <span class="bc-personal-topic"></span>
      <h3 id="personal-card-title"></h3>
      <div class="bc-personal-art" aria-hidden="true"></div>
      <p class="bc-personal-copy"></p>
      <div class="bc-personal-action"></div>
    </article>`;
  article.insertBefore(stage, trigger);
  const sheet = stage.querySelector<HTMLElement>('.bc-personal-card')!;
  const art = stage.querySelector<HTMLElement>('.bc-personal-art')!;
  const action = stage.querySelector<HTMLElement>('.bc-personal-action')!;
  const close = stage.querySelector<HTMLButtonElement>('.bc-personal-close')!;
  const picks = document.createElement('div');
  picks.className = 'bc-personal-picks';
  picks.setAttribute('role', 'group');
  picks.setAttribute('aria-label', 'Choose something to explore');
  picks.innerHTML = `
    <button type="button" data-interest="music" aria-pressed="false" aria-controls="personal-card-stage">
      <svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11"/><circle cx="14" cy="14" r="7"/><circle cx="14" cy="14" r="2"/></svg>
      <span><strong>Music</strong><small>Browse playlists</small></span>
    </button>
    <button type="button" data-interest="f1" aria-pressed="false" aria-controls="personal-card-stage">
      <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 23V5h22v12H3M3 5h5v6H3m10-6h6v6h-6m6 0h6v6h-6M8 11h5v6H8"/></svg>
      <span><strong>Formula 1</strong><small>Test your reflexes</small></span>
    </button>`;
  stage.id = 'personal-card-stage';
  trigger.setAttribute('aria-controls', stage.id);
  article.insertBefore(picks, stage);
  picks.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
    button.addEventListener('click', () => {
      root.dispatchEvent(new CustomEvent('personaldeckrequest', { detail: { id: button.dataset.interest } }));
    }, options);
  });

  function clearMotions(): void {
    effectEpoch++;
    motions.forEach(animation => animation.cancel());
    motions.clear();
    drawing = false;
  }

  async function motion(element: HTMLElement, frames: Keyframe[], duration: number, delay = 0): Promise<void> {
    if (reduced.matches) return;
    const animation = element.animate(frames, { duration, delay, easing: 'cubic-bezier(.22,.8,.22,1)', fill: 'both' });
    motions.add(animation);
    await animation.finished.catch(() => {});
    animation.cancel();
    motions.delete(animation);
  }

  function next(requestedId?: string): PersonalCard {
    if (!bag.length) {
      bag = [...cards];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag[bag.length - 1].id === previous) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const requested = cards.find(card => card.id === requestedId);
    const card = requested ?? bag.pop()!;
    if (requested) bag = bag.filter(item => item.id !== requested.id);
    previous = card.id;
    seen.add(card.id);
    return card;
  }

  function render(card: PersonalCard): void {
    disposeScene();
    disposeScene = () => {};
    sheet.dataset.interest = card.id;
    stage.querySelector('.bc-personal-rank')!.textContent = `${card.rank} ${card.suit}`;
    stage.querySelector('.bc-personal-count')!.textContent = `${seen.size} of ${cards.length} explored`;
    stage.querySelector('.bc-personal-topic')!.textContent = card.topic;
    stage.querySelector('h3')!.textContent = card.title;
    stage.querySelector('.bc-personal-copy')!.textContent = card.copy;
    action.replaceChildren();
    art.replaceChildren();
    art.className = 'bc-personal-art';
    action.className = 'bc-personal-action';
    art.setAttribute('aria-hidden', 'true');
    picks.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.interest === card.id));
      button.removeAttribute('aria-disabled');
    });
    if (card.action === 'camera') {
      art.innerHTML = '<span class="bc-personal-aperture">' + '<i></i>'.repeat(6) + '</span>';
    } else if (card.id === 'ufc') {
      art.innerHTML = '<span class="bc-personal-octagon"><i></i></span>';
    } else if (card.id === 'chapters') {
      art.innerHTML = '<span class="bc-personal-pages"><i></i><i></i><i></i></span>';
    } else if (card.id === 'valorant') {
      art.innerHTML = '<span class="bc-personal-rune">' + '<i></i>'.repeat(3) + '</span>';
    } else {
      art.innerHTML = '<span class="bc-personal-hand"><i>A</i><i>K</i><i>Q</i></span>';
    }

    if (card.action === 'music') {
      art.removeAttribute('aria-hidden');
      const playlists = Array.from(root.querySelectorAll<HTMLAnchorElement>('.bc-playlist-list a'), link => ({
        title: link.textContent!.trim().replace(/\s+/g, ' '), href: link.href,
      }));
      disposeScene = mountRecordCrate(art, action, { playlists, announce: message => { live!.textContent = message; } });
    } else if (card.action === 'race') {
      art.removeAttribute('aria-hidden');
      disposeScene = mountStartingGrid(art, action, { announce: message => { live!.textContent = message; } });
    } else if (card.action === 'camera') {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Take a shot';
      button.addEventListener('click', async () => {
        if (drawing) return;
        drawing = true;
        const token = effectEpoch;
        button.setAttribute('aria-disabled', 'true');
        await motion(art, [{ transform: 'scale(1)' }, { transform: 'scale(.25) rotate(60deg)', offset: .45 }, { transform: 'scale(1) rotate(120deg)' }], 450);
        if (token !== effectEpoch) return;
        button.textContent = 'One more shot';
        live!.textContent = 'Click. A little shutter animation.';
        drawing = false;
        button.removeAttribute('aria-disabled');
      }, options);
      action.append(button);
    }

    miniature!.classList.add('bc-mini-drawn');
    miniature!.querySelectorAll('.bc-card-corner').forEach(corner => {
      const suit = document.createElement('small');
      suit.textContent = card.suit;
      corner.replaceChildren(document.createTextNode(card.rank), suit);
    });
    const pip = document.createElement('span');
    pip.textContent = card.suit;
    miniature!.querySelector('.bc-card-letter')!.replaceChildren(pip);
    miniature!.querySelector('.bc-card-imprint')!.textContent = card.topic;
    hint!.textContent = 'Draw another card';
    trigger!.setAttribute('aria-label', 'Draw another card about me');
    live!.textContent = `${card.topic}. ${card.title} ${card.copy} ${seen.size} of ${cards.length} interests explored.`;
  }

  root.addEventListener('personaldeckdraw', event => {
    const focusFromDeck = document.activeElement === trigger;
    clearMotions();
    const prior = !stage.hidden ? sheet.cloneNode(true) as HTMLElement : null;
    if (prior) {
      prior.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
      prior.removeAttribute('aria-labelledby');
      prior.setAttribute('aria-hidden', 'true');
      prior.inert = true;
      prior.classList.add('bc-personal-leaving');
      stage.append(prior);
      void motion(prior, [{ opacity: 1, transform: 'rotate(-2deg)' }, { opacity: 0, transform: 'translate(-30px, 12px) rotate(-10deg)' }], 220).finally(() => prior.remove());
    }
    const requestedId: unknown = (event as CustomEvent<{ id?: unknown }>).detail?.id;
    render(next(typeof requestedId === 'string' ? requestedId : undefined));
    stage.hidden = false;
    article!.dataset.personalOpen = 'true';
    title!.inert = true;
    trigger!.setAttribute('aria-expanded', 'true');
    if (focusFromDeck) sheet.focus({ preventScroll: true });
    if (!prior) stage.scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'instant' : 'smooth' });
    void motion(sheet, [{ opacity: 0, transform: 'translate(45px, 24px) rotate(9deg) scale(.88)' }, { opacity: 1, transform: 'rotate(-2deg) scale(1)' }], 380);
  }, options);

  function reset(): void {
    const restoreFocus = stage.contains(document.activeElement);
    clearMotions();
    disposeScene();
    disposeScene = () => {};
    stage.hidden = true;
    delete article!.dataset.personalOpen;
    title!.inert = false;
    hint!.textContent = 'Draw a card';
    trigger!.setAttribute('aria-label', 'Draw a card about me');
    trigger!.setAttribute('aria-expanded', 'false');
    picks.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', 'false');
      button.removeAttribute('aria-disabled');
    });
    if (restoreFocus && trigger!.getClientRects().length && !trigger!.closest('[inert]')) trigger!.focus({ preventScroll: true });
  }
  close.addEventListener('click', () => {
    root.dispatchEvent(new CustomEvent('personaldeckclose'));
    trigger.focus({ preventScroll: true });
  }, options);
  article.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !stage.hidden) {
      event.preventDefault();
      event.stopPropagation();
      root.dispatchEvent(new CustomEvent('personaldeckclose'));
      trigger.focus({ preventScroll: true });
    }
  }, options);
  root.addEventListener('personaldeckreset', reset, options);
  root.addEventListener('personaldeckdrawing', () => {
    hint!.textContent = 'Dealing…';
    clearMotions();
    const artClasses = art.className;
    const controlClasses = action.className;
    disposeScene();
    disposeScene = () => {};
    art.className = artClasses;
    action.className = controlClasses;
    picks.querySelectorAll('button').forEach(button => button.setAttribute('aria-disabled', 'true'));
  }, options);
  reduced.addEventListener('change', reset, options);
  trigger.setAttribute('aria-expanded', 'false');
  return () => { controller.abort(); reset(); stage.remove(); picks.remove(); trigger.removeAttribute('aria-expanded'); trigger.removeAttribute('aria-controls'); };
}
