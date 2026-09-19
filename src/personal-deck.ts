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
  let effectEpoch = 0;
  let drawing = false;
  const stage = document.createElement('div');
  stage.className = 'bc-personal-stage';
  stage.hidden = true;
  stage.innerHTML = `
    <article class="bc-personal-card" aria-labelledby="personal-card-title">
      <div class="bc-personal-card-top"><span class="bc-personal-rank" aria-hidden="true"></span><span class="bc-personal-count"></span></div>
      <div class="bc-personal-art" aria-hidden="true"></div>
      <span class="bc-personal-topic"></span>
      <h3 id="personal-card-title"></h3>
      <p class="bc-personal-copy"></p>
      <div class="bc-personal-action"></div>
    </article>
    <button type="button" class="bc-personal-close">Put away</button>`;
  article.append(stage);
  const sheet = stage.querySelector<HTMLElement>('.bc-personal-card')!;
  const art = stage.querySelector<HTMLElement>('.bc-personal-art')!;
  const action = stage.querySelector<HTMLElement>('.bc-personal-action')!;
  const close = stage.querySelector<HTMLButtonElement>('.bc-personal-close')!;

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

  function next(): PersonalCard {
    if (!bag.length) {
      bag = [...cards];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag[bag.length - 1].id === previous) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const card = bag.pop()!;
    previous = card.id;
    return card;
  }

  function render(card: PersonalCard): void {
    sheet.dataset.interest = card.id;
    stage.querySelector('.bc-personal-rank')!.textContent = `${card.rank} ${card.suit}`;
    stage.querySelector('.bc-personal-count')!.textContent = `${cards.length - bag.length} / ${cards.length}`;
    stage.querySelector('.bc-personal-topic')!.textContent = card.topic;
    stage.querySelector('h3')!.textContent = card.title;
    stage.querySelector('.bc-personal-copy')!.textContent = card.copy;
    action.replaceChildren();
    if (card.action === 'race') {
      art.innerHTML = '<span class="bc-personal-lights">' + '<i></i>'.repeat(5) + '</span>';
    } else if (card.action === 'camera') {
      art.innerHTML = '<span class="bc-personal-aperture">' + '<i></i>'.repeat(6) + '</span>';
    } else if (card.id === 'music') {
      art.innerHTML = '<span class="bc-personal-record"><i></i></span>';
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
      const playlists = Array.from(root.querySelectorAll<HTMLAnchorElement>('.bc-playlist-list a'));
      const playlist = playlists[Math.floor(Math.random() * playlists.length)];
      if (playlist) {
        const link = document.createElement('a');
        link.href = playlist.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `Listen to ${playlist.textContent!.trim().replace(/\s+/g, ' ')}`;
        action.append(link);
      }
    } else if (card.action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = card.action === 'race' ? 'Start the lights' : 'Take a shot';
      button.addEventListener('click', async () => {
        if (drawing) return;
        drawing = true;
        const token = effectEpoch;
        button.setAttribute('aria-disabled', 'true');
        if (card.action === 'race') {
          const lamps = Array.from(art.querySelectorAll<HTMLElement>('i'));
          if (reduced.matches) {
            button.textContent = 'Lights out. Again?';
          } else {
            lamps.forEach(lamp => { lamp.dataset.on = 'false'; });
            for (const lamp of lamps) {
              lamp.dataset.on = 'true';
              await motion(lamp, [{ opacity: .5 }, { opacity: 1 }], 190);
              if (token !== effectEpoch) return;
            }
            await motion(art, [{ opacity: 1 }, { opacity: 1 }], 380);
            if (token !== effectEpoch) return;
            lamps.forEach(lamp => { lamp.dataset.on = 'false'; });
            button.textContent = 'Lights out. Again?';
          }
          live!.textContent = 'Lights out.';
        } else {
          await motion(art, [{ transform: 'scale(1)' }, { transform: 'scale(.25) rotate(60deg)', offset: .45 }, { transform: 'scale(1) rotate(120deg)' }], 450);
          if (token !== effectEpoch) return;
          button.textContent = 'One more shot';
          live!.textContent = 'Click. A little shutter animation.';
        }
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
    hint!.textContent = 'Draw another';
    trigger!.setAttribute('aria-label', 'Draw another card about me');
    live!.textContent = `${card.topic}. ${card.title} ${card.copy} Card ${cards.length - bag.length} of ${cards.length}.`;
  }

  root.addEventListener('personaldeckdraw', () => {
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
    render(next());
    stage.hidden = false;
    article!.dataset.personalOpen = 'true';
    title!.inert = true;
    trigger!.setAttribute('aria-expanded', 'true');
    if (!prior) stage.scrollIntoView({ block: 'nearest', behavior: reduced.matches ? 'instant' : 'smooth' });
    void motion(sheet, [{ opacity: 0, transform: 'translate(45px, 24px) rotate(9deg) scale(.88)' }, { opacity: 1, transform: 'rotate(-2deg) scale(1)' }], 380);
  }, options);

  function reset(): void {
    const restoreFocus = stage.contains(document.activeElement);
    clearMotions();
    stage.hidden = true;
    delete article!.dataset.personalOpen;
    title!.inert = false;
    hint!.textContent = 'Draw a card';
    trigger!.setAttribute('aria-label', 'Draw a card about me');
    trigger!.setAttribute('aria-expanded', 'false');
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
  reduced.addEventListener('change', reset, options);
  trigger.setAttribute('aria-expanded', 'false');
  return () => { controller.abort(); reset(); stage.remove(); trigger.removeAttribute('aria-expanded'); };
}
