/** Add keyboard-accessible company tabs while keeping every role readable without JavaScript. */
export function initExperience(root: HTMLElement): () => void {
  const browser = root.querySelector<HTMLElement>('.bc-experience-browser');
  const list = browser?.querySelector<HTMLElement>('.bc-employer-list');
  if (!browser || !list) return () => {};

  const buttons = [...list.querySelectorAll<HTMLButtonElement>('.bc-employer')];
  const panels = [...browser.querySelectorAll<HTMLElement>('.bc-job')];
  const roles = new Set(buttons.map(button => button.dataset.role));
  const entries = buttons.flatMap(button => {
    const role = button.dataset.role;
    const panel = panels.find(candidate => candidate.dataset.role === role);
    return role && panel ? [{ role, button, panel }] : [];
  });

  // A partially rendered section should retain its plain, fully readable fallback.
  if (!entries.length || entries.length !== buttons.length
    || entries.length !== panels.length || roles.size !== entries.length) {
    return () => {};
  }

  const controller = new AbortController();
  const options = { signal: controller.signal };
  const horizontal = window.matchMedia('(max-width: 600px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originalAttributes: Array<{
    element: HTMLElement;
    name: string;
    value: string | null;
  }> = [];

  function remember(element: HTMLElement, names: string[]): void {
    names.forEach(name => originalAttributes.push({
      element,
      name,
      value: element.getAttribute(name),
    }));
  }

  remember(browser, ['data-enhanced']);
  remember(list, ['hidden', 'role', 'aria-label', 'aria-orientation']);
  entries.forEach(({ button, panel }) => {
    remember(button, ['id', 'role', 'aria-controls', 'aria-selected', 'tabindex']);
    remember(panel, ['id', 'role', 'aria-labelledby', 'hidden', 'tabindex']);
  });

  let selected = 0;
  let activeAnimation: Animation | null = null;
  let destroyed = false;

  function stopAnimation(): void {
    activeAnimation?.cancel();
    activeAnimation = null;
  }

  function select(index: number, focus = false, animate = true): void {
    if (destroyed || index < 0 || index >= entries.length) return;
    const changed = index !== selected;
    selected = index;
    stopAnimation();

    entries.forEach(({ button, panel }, entryIndex) => {
      const current = entryIndex === selected;
      button.setAttribute('aria-selected', String(current));
      button.tabIndex = current ? 0 : -1;
      panel.hidden = !current;
    });

    const { button, panel } = entries[selected];
    if (focus) button.focus();
    if (animate && changed && !reduced.matches && typeof panel.animate === 'function') {
      const animation = panel.animate([
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 230,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
      activeAnimation = animation;
      animation.onfinish = () => {
        if (activeAnimation === animation) activeAnimation = null;
      };
    }
  }

  const updateOrientation = (): void => {
    list.setAttribute('aria-orientation', horizontal.matches ? 'horizontal' : 'vertical');
  };

  entries.forEach(({ role, button, panel }, index) => {
    button.id = `employer-${role}`;
    panel.id = `job-${role}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', button.id);
    panel.tabIndex = 0;

    button.addEventListener('click', () => select(index), options);
    button.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const previous = horizontal.matches ? 'ArrowLeft' : 'ArrowUp';
      const next = horizontal.matches ? 'ArrowRight' : 'ArrowDown';
      let target: number;
      if (event.key === previous) target = (index - 1 + entries.length) % entries.length;
      else if (event.key === next) target = (index + 1) % entries.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = entries.length - 1;
      else return;

      event.preventDefault();
      select(target, true);
    }, options);
  });

  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', 'Internships');
  updateOrientation();
  select(selected, false, false);
  browser.dataset.enhanced = 'true';
  list.hidden = false;

  horizontal.addEventListener('change', updateOrientation, options);
  reduced.addEventListener('change', () => {
    if (reduced.matches) stopAnimation();
  }, options);

  return () => {
    if (destroyed) return;
    destroyed = true;
    controller.abort();
    stopAnimation();
    originalAttributes.forEach(({ element, name, value }) => {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    });
  };
}
