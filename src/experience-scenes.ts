interface SceneSpec {
  label: string;
  description: string;
  artwork: string;
}

const floor = '<path class="bc-scene-floor" d="M13 91 110 37 207 91 110 123Z M45 73 143 108 M77 55 175 109 M45 109 143 55 M77 109 175 73"/>';

function windowFrame(x: number, y: number, content: string, width = 72): string {
  return `<g transform="translate(${x} ${y}) skewY(24)"><rect class="bc-scene-surface" width="${width}" height="48" rx="2"/><path d="M0 10h${width}"/><path class="bc-scene-quiet" d="M5 5h1m4 0h1m4 0h1"/>${content}</g>`;
}

function check(x: number, y: number, stage: number): string {
  return `<g class="bc-scene-step" data-stage="${stage}" transform="translate(${x} ${y})"><path class="bc-scene-surface" d="m0-11 10 6v11l-10 6-10-6V-5Z"/><path class="bc-scene-accent" d="m-5 0 4 4 7-9"/></g>`;
}

const scenes: Record<string, SceneSpec> = {
  amazon: {
    label: 'UI validation',
    description: 'Browser states are checked before a release can move forward.',
    artwork: `${floor}
      <path class="bc-scene-flow" data-stage="0" d="M40 87v12l60 25 76-41"/>
      ${windowFrame(80, 8, '<path class="bc-scene-quiet" d="M8 18h27m-27 6h16"/><rect class="bc-scene-accent bc-scene-step" data-stage="0" x="43" y="18" width="20" height="22" rx="1"/>')}
      ${windowFrame(55, 22, '<path class="bc-scene-quiet" d="M8 18h32m-32 6h17"/><path class="bc-scene-step" data-stage="1" d="M8 39V32h10v7m7 0V27h10v12m7 0V22h10v17"/>')}
      ${windowFrame(30, 36, '<rect class="bc-scene-accent bc-scene-step" data-stage="2" x="8" y="18" width="56" height="21" rx="1"/><path class="bc-scene-quiet" d="M14 24h26m-26 8h16"/>')}
      ${check(176, 83, 3)}`,
  },
  opentext: {
    label: 'Log pipeline',
    description: 'Separate log sources become a consistent stream for reporting.',
    artwork: `${floor}
      <path class="bc-scene-flow" data-stage="0" d="m35 41 45 22m-45 0 45 0m-45 22 45-22"/>
      <path class="bc-scene-flow" data-stage="2" d="m114 78 32 14 27-15"/>
      <g class="bc-scene-step" data-stage="0"><path class="bc-scene-surface" d="m17 25 31 14v14L17 39Zm0 22 31 14v14L17 61Zm0 22 31 14v14L17 83Z"/><path class="bc-scene-quiet" d="m23 34 15 7m-15 15 15 7m-15 15 15 7"/></g>
      <g class="bc-scene-step" data-stage="1"><path class="bc-scene-surface" d="m80 57 22-12 24 13v29l-22 12-24-13Z"/><path d="m80 57 24 13 22-12m-22 12v29"/><path class="bc-scene-accent" d="m85 67 13 7m-13 1 13 7m-13 1 13 7"/></g>
      ${windowFrame(146, 20, '<path class="bc-scene-quiet" d="M7 18h20m-20 7h28m-28 7h18"/><path class="bc-scene-step bc-scene-accent" data-stage="3" d="M7 40h8m5 0h8m5 0h8"/>', 54)}`,
  },
  'ground-news': {
    label: 'Retrieval & ranking',
    description: 'Retrieved articles pass through a ranking step into ordered search results.',
    artwork: `${floor}
      <path class="bc-scene-flow" data-stage="1" d="M47 88 89 107 151 73"/>
      <g class="bc-scene-step" data-stage="0">${windowFrame(31, 19, '<circle cx="16" cy="22" r="6"/><path d="m20 27 6 6"/><path class="bc-scene-quiet" d="M34 20h17m-17 7h24"/>', 64)}</g>
      <g class="bc-scene-step" data-stage="2"><path class="bc-scene-surface" d="m85 93 17-9 17 9-17 9Z"/><path class="bc-scene-accent" d="m95 93 7-4 7 4-7 4Z"/></g>
      <g transform="translate(124 19) skewY(24)"><rect class="bc-scene-surface" width="64" height="66" rx="2"/><g class="bc-scene-step" data-stage="3"><rect class="bc-scene-accent" x="6" y="7" width="52" height="14" rx="1"/><path d="M12 12h24m-24 4h34"/></g><path class="bc-scene-quiet" d="M6 29h52v13H6Zm0 21h52v9H6Z M12 34h34m-34 21h27"/></g>`,
  },
  magnify: {
    label: 'Campaign reporting',
    description: 'Campaign events move through an ingestion pipeline into a reporting view.',
    artwork: '',
  },
  shyftlabs: {
    label: 'Retail media analytics',
    description: 'Backend services connect campaign activity with the reporting dashboard.',
    artwork: '',
  },
  wenu: {
    label: 'Payment flow',
    description: 'A checkout request passes through payment processing and returns a confirmation.',
    artwork: `${floor}
      <path class="bc-scene-flow" data-stage="1" d="m50 89 55 27 67-36"/>
      ${windowFrame(35, 21, '<path class="bc-scene-quiet" d="M9 18h25m-25 6h17"/><rect class="bc-scene-accent bc-scene-step" data-stage="0" x="9" y="31" width="38" height="10" rx="2"/>', 60)}
      <g class="bc-scene-step" data-stage="2" transform="translate(117 44) skewY(-24)"><rect class="bc-scene-surface" width="40" height="28" rx="3"/><path d="M0 8h40"/><path class="bc-scene-accent" d="M6 21h8m4 0h6"/></g>
      ${check(181, 79, 3)}`,
  },
  sashido: {
    label: 'Developer examples',
    description: 'Developer documentation connects a sample application to the platform.',
    artwork: `${floor}
      <path class="bc-scene-flow" data-stage="1" d="m46 85 54 30 64-35"/>
      <g class="bc-scene-step" data-stage="0"><path class="bc-scene-surface" d="M28 24 58 37 88 24v51L58 89 28 75Z"/><path d="M58 37v52"/><path class="bc-scene-quiet" d="m34 39 18 8m-18 0 18 8m-18 0 18 8m11-16 17-8m-17 16 17-8m-17 16 17-8"/></g>
      ${windowFrame(132, 23, '<g class="bc-scene-step bc-scene-accent" data-stage="2"><path d="m17 22-7 6 7 6m25-12 7 6-7 6m-10-15-7 25"/></g>', 60)}
      ${check(113, 94, 3)}`,
  },
};

const reporting = `${floor}
  <path class="bc-scene-flow" data-stage="1" d="m31 63 39 21 34-18 41 23"/>
  <g class="bc-scene-step" data-stage="0"><path class="bc-scene-surface" d="m21 41 18 10v25L21 66Zm24 12 18 10v25L45 78Z"/><path class="bc-scene-quiet" d="m25 49 9 5m-9 4 9 5m15-2 9 5m-9 4 9 5"/></g>
  <g class="bc-scene-step" data-stage="2"><path class="bc-scene-surface" d="m87 52 16-9 17 9v18l-16 9-17-9Z"/><path d="m87 52 17 9 16-9m-16 9v18"/></g>
  ${windowFrame(138, 16, '<path class="bc-scene-quiet" d="M7 18h24"/><path class="bc-scene-step bc-scene-accent" data-stage="3" d="M8 39V32h8v7m7 0V26h8v13m7 0V20h8v19"/>', 56)}`;
scenes.magnify.artwork = reporting;
scenes.shyftlabs.artwork = reporting;

export interface ExperienceScene {
  setActive(active: boolean): void;
  destroy(): void;
}

/** Small conceptual illustrations; the résumé remains the source of every work claim. */
export function createExperienceScene(panel: HTMLElement, role: string, root: HTMLElement): ExperienceScene {
  const spec = scenes[role];
  const intro = panel.querySelector<HTMLElement>('.bc-job-intro');
  if (!spec || !intro) return { setActive() {}, destroy() {} };

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const context = document.createElement('div');
  context.className = 'bc-job-context';
  intro.before(context);
  context.append(intro);

  const figure = document.createElement('figure');
  figure.className = 'bc-experience-scene';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'bc-scene-trigger';
  button.setAttribute('aria-label', `${spec.label} illustration. ${spec.description} Activate to trace the flow.`);
  button.innerHTML = `<svg class="bc-scene-art" viewBox="0 0 220 130" aria-hidden="true" focusable="false">${spec.artwork}</svg><span class="bc-scene-caption">${spec.label}</span>`;
  figure.append(button);
  context.append(figure);

  let active = false;
  let destroyed = false;
  let animations: Animation[] = [];
  function stop(): void {
    animations.forEach(animation => animation.cancel());
    animations = [];
    delete figure.dataset.traced;
  }

  function trace(): void {
    if (destroyed || !active || document.hidden || panel.closest('[hidden]')) return;
    stop();
    if (reduced.matches || typeof button.animate !== 'function') {
      figure.dataset.traced = 'true';
      return;
    }
    figure.querySelectorAll<SVGElement>('.bc-scene-step, .bc-scene-flow').forEach(element => {
      const stage = Number(element.dataset.stage ?? 0);
      const isFlow = element.classList.contains('bc-scene-flow');
      const frames: Keyframe[] = isFlow
        ? [{ strokeDasharray: '3 5', strokeDashoffset: '32', opacity: .2 }, { strokeDasharray: '3 5', strokeDashoffset: '0', opacity: 1 }, { strokeDasharray: '3 5', strokeDashoffset: '-16', opacity: .3 }]
        : [{ opacity: .35 }, { opacity: 1, filter: 'drop-shadow(0 0 2px var(--bc-accent))' }, { opacity: .65 }];
      animations.push(element.animate(frames, { duration: 800, delay: stage * 160, easing: 'ease-in-out' }));
    });
  }

  button.addEventListener('click', trace, options);
  button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') trace(); }, options);
  button.addEventListener('focus', trace, options);
  root.addEventListener('chapterwillchange', stop, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); }, options);
  reduced.addEventListener('change', () => { if (reduced.matches) stop(); }, options);

  return {
    setActive(value) {
      active = value;
      if (!active) stop();
    },
    destroy() {
      destroyed = true;
      controller.abort();
      stop();
      context.before(intro);
      context.remove();
    },
  };
}
