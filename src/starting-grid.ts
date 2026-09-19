type GridState = 'idle' | 'countdown' | 'waiting' | 'go' | 'result' | 'false-start' | 'paused';

let gridInstance = 0;

/** A visual reaction game; every time is measured from this browser's lights-out cue. */
export function mountStartingGrid(
  art: HTMLElement,
  controls: HTMLElement,
  { announce }: { announce: (message: string) => void },
): () => void {
  const controller = new AbortController();
  const listenerOptions = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const suffix = ++gridInstance;
  let state: GridState = 'idle';
  let timer: number | undefined;
  let lightsOutAt = 0;
  let carMotion: Animation | undefined;
  let disposed = false;

  art.classList.add('bc-grid-art');
  art.dataset.gridState = state;
  art.innerHTML = `
    <svg class="bc-grid-scene" viewBox="0 0 256 190" fill="none" aria-hidden="true" focusable="false">
      <g class="bc-grid-faint" stroke="currentColor" stroke-width=".7">
        <path d="m15 153 112 32 118-103M15 146l112 32L245 75" stroke-dasharray="2 4"/>
        <path d="m26 165 9 3m-4-5-1 7m196-99 9 3m-4-5-1 7"/>
      </g>
      <g transform="matrix(.78 .22 .55 -.48 25 153)" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round">
        <path class="bc-grid-road" d="M0 0h128v180H0z"/>
        <path class="bc-grid-curb" d="M0 0h6v180H0zM122 0h6v180h-6z"/>
        <path class="bc-grid-faint" d="M0 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m116-140h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6m-6 20h6"/>
        <path class="bc-grid-faint" d="M64 0v15m0 86v15m0 42v22" stroke-dasharray="4 5"/>
        <path class="bc-grid-faint" d="M24 18v23h29M74 29h29V6M24 109v22h29M74 146h29v-23"/>
        <path d="M6 95h116"/>
        <path class="bc-grid-faint" d="M6 101h116"/>
      </g>
      <g class="bc-grid-car">
        <g transform="matrix(.78 .22 .55 -.48 25 150)" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round">
          <path class="bc-grid-car-tire" d="M47 37h8v13h-8zM73 37h8v13h-8zM47 66h8v11h-8zM73 66h8v11h-8z"/>
          <path class="bc-grid-car-body" d="M56 39h16l-1 13-4 11-1 15h-4l-1-15-4-11z"/>
          <path class="bc-grid-car-body" d="M49 31h30v7H49zM51 77h26v5H51z"/>
          <path class="bc-grid-faint" d="M55 43h18m-18 27h18M55 35h18"/>
          <path class="bc-grid-cockpit" d="M61 47h6v10h-6z"/>
          <path d="M64 62v12"/>
        </g>
      </g>
      <g stroke="currentColor" stroke-width="1" stroke-linejoin="round">
        <path class="bc-grid-post" d="m89 95 5 1V38l-5-1zM189 123l5 1V66l-5-1z"/>
        <path class="bc-grid-faint" d="m84 95 10 3 6-5-10-3zM184 123l10 3 6-5-10-3z"/>
        <path class="bc-grid-beam-top" d="m89 20 5-4 105 30-5 4z"/>
        <path class="bc-grid-beam-side" d="m194 50 5-4v24l-5 4z"/>
      </g>
      <g transform="matrix(.82 .235 0 1 89 20)" stroke="currentColor" stroke-width="1">
        <path class="bc-grid-beam" d="M0 0h128v24H0z"/>
        ${[18, 41, 64, 87, 110].map((x, i) => `<circle class="bc-grid-lamp" data-lamp="${i}" cx="${x}" cy="12" r="6.4"/>`).join('')}
        <path class="bc-grid-faint" d="M5 5h3m112 14h3"/>
      </g>
      <text class="bc-grid-label" x="21" y="38">START / FINISH</text>
      <path class="bc-grid-faint" d="M21 45h29l14 16" stroke="currentColor" stroke-width=".7"/>
      <text class="bc-grid-coordinate" x="190" y="161">01 / GRID</text>
    </svg>`;

  const interfaceElement = document.createElement('div');
  interfaceElement.className = 'bc-grid-controls';
  interfaceElement.innerHTML = `
    <p class="bc-grid-instruction" id="bc-grid-instruction-${suffix}">A visual reaction test. Press again when all five lights go out.</p>
    <button class="bc-grid-trigger" type="button" aria-describedby="bc-grid-instruction-${suffix} bc-grid-status-${suffix}">Start the lights</button>
    <p class="bc-grid-status" id="bc-grid-status-${suffix}">Click, Enter or Space.</p>`;
  controls.append(interfaceElement);

  const button = interfaceElement.querySelector<HTMLButtonElement>('button')!;
  const status = interfaceElement.querySelector<HTMLElement>('.bc-grid-status')!;
  const lamps = [...art.querySelectorAll<SVGCircleElement>('.bc-grid-lamp')];
  const car = art.querySelector<SVGGElement>('.bc-grid-car')!;

  function active(): boolean {
    return state === 'countdown' || state === 'waiting' || state === 'go';
  }

  function stopTimer(): void {
    window.clearTimeout(timer);
    timer = undefined;
  }

  function setLights(count: number): void {
    lamps.forEach((lamp, i) => { lamp.dataset.on = String(i < count); });
  }

  function changeState(next: GridState, label: string, message: string, speak = true): void {
    state = next;
    art.dataset.gridState = next;
    interfaceElement.dataset.gridState = next;
    button.textContent = label;
    status.textContent = message;
    if (speak) announce(message);
  }

  function schedule(callback: () => void, delay: number): void {
    stopTimer();
    timer = window.setTimeout(() => {
      timer = undefined;
      if (!disposed) callback();
    }, delay);
  }

  function interrupt(): void {
    carMotion?.cancel();
    carMotion = undefined;
    if (!active()) return;
    stopTimer();
    setLights(0);
    changeState('paused', 'Start again', 'Round paused. Start again when you’re ready.');
  }

  function illuminate(index: number): void {
    if (disposed || !active()) return;
    setLights(index + 1);
    if (index < 4) {
      schedule(() => illuminate(index + 1), 460);
      return;
    }
    changeState('waiting', 'Wait for lights out', 'Five lights. Wait for them to go out.', false);
    schedule(() => {
      if (document.hidden || !document.hasFocus()) {
        interrupt();
        return;
      }
      setLights(0);
      lightsOutAt = performance.now();
      changeState('go', 'Go!', 'Lights out. Go!');
      schedule(() => {
        changeState('paused', 'Try again', 'Round ended. Try again when you’re ready.');
      }, 8000);
    }, 1000 + Math.random() * 1800);
  }

  function activate(): void {
    if (disposed) return;
    if (state === 'countdown' || state === 'waiting') {
      stopTimer();
      setLights(0);
      changeState('false-start', 'Try again', 'False start. Wait until every light is out.');
      return;
    }
    if (state === 'go') {
      const elapsed = Math.max(0, Math.round(performance.now() - lightsOutAt));
      stopTimer();
      changeState('result', 'Race again', `${elapsed} ms reaction time.`);
      if (!reduced.matches) {
        carMotion = car.animate([
          { transform: 'translate(0, 0)', opacity: 1 },
          { transform: 'translate(58px, -50px)', opacity: 1, offset: .7 },
          { transform: 'translate(99px, -86px)', opacity: 0 },
        ], { duration: 540, easing: 'cubic-bezier(.55,.05,.9,.55)', fill: 'forwards' });
      }
      return;
    }
    carMotion?.cancel();
    carMotion = undefined;
    setLights(0);
    changeState('countdown', 'Wait for lights out', 'Watch the lights. Press again only when they go out.');
    schedule(() => illuminate(0), 380);
  }

  button.addEventListener('click', activate, listenerOptions);
  button.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (!event.repeat) activate();
  }, listenerOptions);
  window.addEventListener('blur', interrupt, listenerOptions);
  window.addEventListener('resize', interrupt, listenerOptions);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) interrupt();
  }, listenerOptions);
  reduced.addEventListener('change', interrupt, listenerOptions);

  return () => {
    disposed = true;
    controller.abort();
    stopTimer();
    carMotion?.cancel();
    // The parent may clone this finished scene for the outgoing card animation.
    // Its next render owns replacing the artwork and controls.
    art.classList.remove('bc-grid-art');
    delete art.dataset.gridState;
  };
}
