/**
 * The light/dark toggle in the top bar. The page follows the system until the toggle is used;
 * after that the choice is remembered. The script in index.html applies it before the first paint.
 */
export function initTheme(): void {
  const root = document.documentElement;
  const button = document.getElementById('mode');
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');

  const sync = (): void => {
    const shown = root.dataset.theme ?? (system.matches ? 'dark' : 'light');
    root.dataset.shown = shown;
    button?.setAttribute('aria-label', `Switch to ${shown === 'dark' ? 'light' : 'dark'} mode`);
    // Keep the browser's own chrome in step with the page.
    const bg = getComputedStyle(root).getPropertyValue('--bg').trim();
    metas.forEach(meta => (meta.content = bg));
  };

  button?.addEventListener('click', () => {
    const next = root.dataset.shown === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    sync();
  });
  system.addEventListener('change', sync);
  sync();
}
