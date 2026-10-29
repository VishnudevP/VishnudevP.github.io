import { life, lifeTracks } from './life';
import { FIRST_MONTH, FIRST_YEAR, monthIndex, roles, terms, tracks, type Role, type Track } from './roles';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const required = <T extends Element>(selector: string, root: ParentNode = document): T => {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
};

const escape = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// Column i is i months after the timeline's first month.
const calendar = (i: number): [month: number, year: number] => [(i + FIRST_MONTH - 1) % 12, FIRST_YEAR + Math.floor((i + FIRST_MONTH - 1) / 12)];
const label = (i: number): string => { const [m, y] = calendar(i); return `${MONTHS[m]} ${y}`; };
const labelLong = (i: number): string => { const [m, y] = calendar(i); return `${MONTHS_LONG[m]} ${y}`; };
const hueOf = (role: Role): string => String(role.hue ?? 0);
const swatch = (role: Role): string => (role.term ? 'var(--ink-3)' : role.hue == null ? 'var(--ink)' : `oklch(var(--L) var(--C) ${role.hue})`);
/** School terms use neutral ink; everything else wears its own colour. */
const inked = (role: Role): boolean => !!role.now || !!role.term;
/** The short line shown after the name in the readout and tooltip. */
const kind = (role: Role): string =>
  role.now ? 'Now' : role.term === 'study' ? 'Study term' : role.term === 'coop' ? 'Co-op term' : role.title.replace(', Amazon Ads', '');
const duration = (role: Role): string => {
  if (role.now) return '';
  const months = role.end - role.start + 1;
  return months > 1 ? `${months} months` : '';
};

const icons = {
  prev: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
  next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 4 8 8M12 4l-8 8"/></svg>',
  chevron: '<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
};

/** One side of the timeline card: a grid of months with its own rows and entries. */
interface Grid {
  /** Every entry on this side, newest first, for stepping through the details. */
  list: Role[];
  focusRole(role: Role): void;
  highlight(role: Role | null): void;
  focusCurrent(): void;
  unhover(): void;
  size(): void;
}

export function initTimeline(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sheet = window.matchMedia('(max-width: 720px)');
  const today = new Date();
  // The grid runs to the current month, and never stops before the month after Amazon ends,
  // so the "now" marker always has a month of its own.
  const count = Math.max(monthIndex(today.getFullYear(), today.getMonth() + 1), monthIndex(2026, 9)) + 1;
  const last = count - 1;
  // The current month reads as "Present" rather than a date.
  const when = (i: number): string => (i === last ? 'Present' : label(i));
  for (const role of roles) if (role.now) role.end = last;
  const onGrid = (role: Role): boolean => role.end >= 0 && role.start <= last;

  const tip = required<HTMLElement>('#tip');
  const dwrap = required<HTMLElement>('#dwrap');
  const detail = required<HTMLElement>('#detail');
  const scrim = required<HTMLElement>('#scrim');

  // ---------- Details, shared by both sides ----------
  let selected: Role | null = null;
  let owner: Grid | null = null;
  let returnFocus: HTMLElement | null = null;

  function renderDetail(role: Role, list: Role[]): void {
    const index = list.indexOf(role);
    const mark = role.term
      ? role.short.replace('Work term ', 'W').replace('Co-op term', 'Co')
      : role.short.length <= 3 ? role.short : role.company.split(' ').map(word => word[0]).join('').slice(0, 2);
    const when = [role.dates, duration(role), role.location].filter(Boolean).join(' · ');
    const noun = role.term ? 'term' : roles.includes(role) ? 'role' : 'entry';
    detail.style.setProperty('--h', hueOf(role));
    detail.innerHTML =
      '<div class="grab" aria-hidden="true"></div>' +
      `<div class="dh"><div class="who"><div class="mk${inked(role) ? ' ink' : ''}" aria-hidden="true">${escape(mark)}</div>` +
      `<div><h3 id="detail-title">${escape(role.company)}</h3><p>${escape(role.title)}<span class="when">${escape(when)}</span></p></div></div>` +
      '<div class="dctl">' +
      `<button type="button" class="ib" data-step="-1" aria-label="Newer ${noun}"${index <= 0 ? ' disabled' : ''}>${icons.prev}</button>` +
      `<button type="button" class="ib" data-step="1" aria-label="Earlier ${noun}"${index >= list.length - 1 ? ' disabled' : ''}>${icons.next}</button>` +
      `<button type="button" class="ib" data-close aria-label="Close details">${icons.close}</button></div></div>` +
      `<div class="dbody"><div><p class="dsum">${escape(role.summary)}</p>` +
      (role.link ? `<a class="btn pri" href="${escape(role.link[1])}" target="_blank" rel="noopener noreferrer">${escape(role.link[0])} ↗</a>` : '') +
      (role.stack ? `<div class="stack">${role.stack.map(item => `<span>${escape(item)}</span>`).join('')}</div>` : '') +
      (role.note ? `<p class="dnote">${escape(role.note)}</p>` : '') +
      '</div><div>' +
      (role.photo ? `<img class="dphoto" src="${escape(role.photo[0])}" alt="${escape(role.photo[1])}" loading="lazy">` : '') +
      (role.metrics
        ? `<div class="mets" style="--k:${Math.min(3, role.metrics.length)}">${role.metrics.map(([value, text]) => `<div class="met"><b>${escape(value)}</b><span>${escape(text)}</span></div>`).join('')}</div>`
        : '') +
      (role.points.length ? `<ul class="pts${role.now ? ' ink' : ''}">${role.points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>` : '') +
      (role.courses?.length
        ? `<h4 class="courses-h">Courses</h4><ul class="courses">${role.courses.map(([code, name]) => `<li><span>${escape(code)}</span>${escape(name)}</li>`).join('')}</ul>`
        : '') +
      '</div></div>';
    dwrap.setAttribute('aria-labelledby', 'detail-title');
  }

  function open(role: Role, grid: Grid, { scroll = true } = {}): void {
    const wasOpen = dwrap.classList.contains('open');
    if (owner && owner !== grid) owner.highlight(null);
    if (selected !== role) renderDetail(role, grid.list);
    selected = role;
    owner = grid;
    grid.highlight(role);
    dwrap.classList.add('open');
    if (sheet.matches) {
      scrim.classList.add('on');
      if (!wasOpen) {
        returnFocus = document.activeElement as HTMLElement | null;
        window.setTimeout(() => detail.focus({ preventScroll: true }), 50);
      }
    } else if (!wasOpen && scroll) {
      // Bring the opened details into view without jumping past the grid.
      window.setTimeout(() => {
        const top = dwrap.getBoundingClientRect().top;
        const overflow = Math.min(top + 360, top + detail.offsetHeight + 24) - window.innerHeight;
        if (overflow > 0) window.scrollBy({ top: overflow, behavior: reduced ? 'auto' : 'smooth' });
      }, 120);
    }
  }

  function close(refocus = false): void {
    dwrap.classList.remove('open');
    scrim.classList.remove('on');
    owner?.highlight(null);
    if (refocus) {
      if (returnFocus) returnFocus.focus({ preventScroll: true });
      else owner?.focusCurrent();
    }
    selected = null;
    owner = null;
    returnFocus = null;
  }

  detail.addEventListener('click', event => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button');
    if (!button || !selected || !owner) return;
    if (button.hasAttribute('data-close')) { close(true); return; }
    const role = owner.list[owner.list.indexOf(selected) + Number(button.dataset.step)];
    if (!role) return;
    if (onGrid(role)) owner.focusRole(role);
    open(role, owner);
  });
  scrim.addEventListener('click', () => close(true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dwrap.classList.contains('open')) close(true);
  });

  // ---------- One grid of months ----------
  function mountGrid(face: HTMLElement, rows: readonly Track[], list: Role[], laneFor: (role: Role) => boolean): Grid {
    const items = list.filter(onGrid);
    const grid = required<HTMLElement>('.grid', face);
    const lane = required<HTMLElement>('.lane', face);
    const scroller = required<HTMLElement>('.scroller', face);
    const range = required<HTMLInputElement>('.range', face);
    const readMonth = required<HTMLElement>('.read-month', face);
    const readRole = required<HTMLElement>('.read-role', face);
    grid.style.setProperty('--n', String(count));
    grid.style.setProperty('--rows', String(rows.length));
    range.max = String(last);

    // Which entry (if any) fills each month of each row.
    const at = new Map<string, (Role | null)[]>();
    for (const track of rows) at.set(track.id, new Array<Role | null>(count).fill(null));
    for (const role of items) for (let i = Math.max(0, role.start); i <= Math.min(last, role.end); i++) at.get(role.track)![i] = role;
    const trackRow = (role: Role): number => rows.findIndex(track => track.id === role.track);
    const roleAt = (row: number, col: number): Role | null => at.get(rows[row].id)![col];
    const anyRoleAt = (col: number): Role | null => rows.map(track => at.get(track.id)![col]).find(Boolean) ?? null;

    // Year labels along the top.
    for (let year = FIRST_YEAR; year <= calendar(last)[1]; year++) {
      const tick = document.createElement('div');
      tick.className = 'yr' + (year === today.getFullYear() ? ' cur' : '');
      tick.setAttribute('aria-hidden', 'true');
      tick.style.gridColumn = `${Math.max(0, monthIndex(year, 1)) + 2} / ${Math.min(monthIndex(year, 12), last) + 3}`;
      tick.textContent = String(year);
      grid.append(tick);
    }
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    grid.append(cursor);

    const cells: HTMLElement[][] = [];
    rows.forEach((track, row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      rowEl.setAttribute('role', 'row');
      const header = document.createElement('div');
      header.className = 'rh';
      header.setAttribute('role', 'rowheader');
      header.textContent = track.name;
      header.style.gridRow = String(row + 2);
      header.style.gridColumn = '1';
      rowEl.append(header);
      cells[row] = [];
      for (let col = 0; col < count; col++) {
        const cell = document.createElement('div');
        const role = at.get(track.id)![col];
        cell.className = 'cell' + (role ? (role.now ? (col === last ? ' ring' : ' f current') : role.term ? ` f ${role.term}` : ' f') : '');
        cell.setAttribute('role', 'gridcell');
        cell.tabIndex = -1;
        cell.style.gridRow = String(row + 2);
        cell.style.gridColumn = String(col + 2);
        if (role?.hue != null) cell.style.setProperty('--h', hueOf(role));
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        cell.setAttribute('aria-label', `${col === last ? 'Present' : labelLong(col)}, ${track.name}: ${role ? `${role.company}, ${kind(role)}` : 'nothing listed'}`);
        rowEl.append(cell);
        cells[row][col] = cell;
      }
      grid.append(rowEl);
    });

    // Labels under the grid, staggered onto a second line when they would collide.
    function buildLane(): void {
      lane.replaceChildren();
      const style = getComputedStyle(grid);
      const lab = parseFloat(style.getPropertyValue('--lab'));
      const size = parseFloat(style.getPropertyValue('--c'));
      const gap = parseFloat(style.getPropertyValue('--g'));
      const ends = [-Infinity, -Infinity];
      for (const role of items.filter(laneFor).sort((a, b) => a.start - b.start)) {
        const x = lab + gap + Math.max(0, role.start) * (size + gap);
        const width = (Math.min(last, role.end) - Math.max(0, role.start) + 1) * (size + gap) - gap;
        const textWidth = role.short.length * 6.7 + 4;
        const line = ends[0] <= x ? 0 : ends[1] <= x ? 1 : 0;
        ends[line] = x + Math.max(width, textWidth) + 8;
        const tag = document.createElement('div');
        tag.className = 'tag' + (line ? ' l2' : '') + (role.now ? ' ink' : '');
        tag.style.left = `${x}px`;
        tag.style.setProperty('--w', `${width}px`);
        tag.style.setProperty('--h', hueOf(role));
        tag.textContent = role.short;
        tag.dataset.id = role.id;
        tag.addEventListener('click', () => { focusRole(role); open(role, api); });
        lane.append(tag);
      }
      lane.style.setProperty('--lh', `${ends[1] > -Infinity ? 46 : ends[0] > -Infinity ? 22 : 0}px`);
      lane.style.width = `${lab + count * (size + gap)}px`;
    }

    // Fit the whole range on wide screens; on narrow ones keep cells tappable and let the grid scroll.
    function size(): void {
      const width = scroller.clientWidth;
      let lab = width < 560 ? 66 : 76;
      const gap = 3;
      let cell = Math.floor((width - lab - gap * count) / count);
      if (cell < 10) cell = 16;
      cell = Math.min(cell, 20);
      if (cell < 16) lab = Math.max(lab, width - count * (cell + gap));
      grid.style.setProperty('--ch', `${Math.max(cell, Math.round(cell * 1.75))}px`);
      grid.style.setProperty('--lab', `${lab}px`);
      grid.style.setProperty('--c', `${cell}px`);
      buildLane();
    }

    let current = { row: 0, col: last };
    let hovered: HTMLElement | null = null;

    function setReadout(row: number, col: number): void {
      const role = roleAt(row, col) ?? anyRoleAt(col);
      readMonth.textContent = when(col);
      if (!role) { readRole.innerHTML = '<em>Nothing listed</em>'; return; }
      readRole.style.setProperty('--swatch', swatch(role));
      readRole.innerHTML = `<i></i><span><b>${escape(role.company)}</b> <em>· ${escape(kind(role))}</em></span>`;
    }

    function showTip(cell: HTMLElement): void {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const role = roleAt(row, col);
      const courses = role?.courses?.length ? ` · ${role.courses.length} course${role.courses.length > 1 ? 's' : ''}` : '';
      tip.innerHTML = role
        ? `<b>${escape(role.company)}</b>${role.term ? '' : ` · ${escape(kind(role))}`}<span>${when(col)}${courses}</span>`
        : `<b>${when(col)}</b><span>${rows[row].name} · nothing listed</span>`;
      const box = cell.getBoundingClientRect();
      const x = box.left + box.width / 2 + window.scrollX;
      tip.style.left = `${x}px`;
      tip.style.top = `${box.bottom + window.scrollY}px`;
      tip.classList.add('on');
      // Keep the tooltip on screen; the arrow stays over the cell.
      const tipBox = tip.getBoundingClientRect();
      const shift = tipBox.left < 8 ? 8 - tipBox.left : tipBox.right > window.innerWidth - 8 ? window.innerWidth - 8 - tipBox.right : 0;
      if (shift) tip.style.left = `${x + shift}px`;
      tip.style.setProperty('--ax', `${-shift}px`);
    }
    const hideTip = (): void => tip.classList.remove('on');

    function hover(row: number, col: number, withTip = true): void {
      const cell = cells[row][col];
      if (hovered && hovered !== cell) hovered.classList.remove('hov');
      hovered = cell;
      cell.classList.add('hov');
      cursor.style.gridColumn = `${col + 2} / ${col + 3}`;
      cursor.classList.add('on');
      setReadout(row, col);
      if (withTip) showTip(cell); else hideTip();
    }
    function unhover(): void {
      hovered?.classList.remove('hov');
      hovered = null;
      hideTip();
      cursor.classList.remove('on');
      setReadout(current.row, current.col);
    }

    // One cell at a time is in the tab order (a roving tabindex).
    function focusCell(row: number, col: number, scroll = false): HTMLElement {
      row = Math.max(0, Math.min(rows.length - 1, row));
      col = Math.max(0, Math.min(last, col));
      cells[current.row][current.col].tabIndex = -1;
      current = { row, col };
      const cell = cells[row][col];
      cell.tabIndex = 0;
      range.value = String(col);
      if (scroll) ensureVisible(col);
      return cell;
    }
    function ensureVisible(col: number): void {
      const cell = cells[0][col];
      const lab = parseFloat(getComputedStyle(grid).getPropertyValue('--lab'));
      const left = scroller.scrollLeft + lab + 8;
      const right = scroller.scrollLeft + scroller.clientWidth - 12;
      if (cell.offsetLeft < left) scroller.scrollLeft = cell.offsetLeft - lab - 24;
      else if (cell.offsetLeft + cell.offsetWidth > right) scroller.scrollLeft = cell.offsetLeft + cell.offsetWidth - scroller.clientWidth + 24;
    }
    function focusRole(role: Role): void {
      focusCell(trackRow(role), Math.max(0, role.start), true);
    }

    function highlight(role: Role | null): void {
      grid.classList.toggle('dim', !!role);
      lane.classList.toggle('dim', !!role);
      grid.querySelectorAll('.cell.on').forEach(cell => cell.classList.remove('on'));
      lane.querySelectorAll('.tag.on').forEach(tag => tag.classList.remove('on'));
      if (!role || !onGrid(role) || !items.includes(role)) return;
      const row = trackRow(role);
      for (let i = Math.max(0, role.start); i <= Math.min(last, role.end); i++) cells[row][i].classList.add('on');
      lane.querySelector(`[data-id="${role.id}"]`)?.classList.add('on');
    }

    const api: Grid = {
      list,
      focusRole,
      highlight,
      focusCurrent: () => cells[current.row][current.col].focus({ preventScroll: true }),
      unhover,
      size,
    };

    // Keyboard on the grid.
    grid.addEventListener('keydown', event => {
      if (!(event.target as Element).closest('.cell')) return;
      let { row, col } = current;
      const track = rows[row].id;
      switch (event.key) {
        case 'ArrowRight': col++; break;
        case 'ArrowLeft': col--; break;
        case 'ArrowDown': row++; break;
        case 'ArrowUp': row--; break;
        case 'Home': col = 0; break;
        case 'End': col = last; break;
        case ']':
        case 'PageDown': {
          const next = items.filter(role => role.track === track && role.start > col).sort((a, b) => a.start - b.start)[0];
          if (next) col = next.start;
          break;
        }
        case '[':
        case 'PageUp': {
          const here = at.get(track)![col];
          const previous = items.filter(role => role.track === track && role.end < (here ? here.start : col + 1)).sort((a, b) => b.start - a.start)[0];
          if (previous) col = Math.max(0, previous.start);
          break;
        }
        case 'Enter':
        case ' ': {
          event.preventDefault();
          const role = at.get(track)![col];
          if (role) open(role, api);
          return;
        }
        default: return;
      }
      event.preventDefault();
      focusCell(row, col, true).focus({ preventScroll: true });
      hover(current.row, current.col);
      if (selected && owner === api) {
        const role = roleAt(current.row, current.col);
        if (role && role !== selected) open(role, api, { scroll: false });
      }
    });
    grid.addEventListener('focusin', event => {
      const cell = (event.target as Element).closest<HTMLElement>('.cell');
      if (cell) hover(Number(cell.dataset.row), Number(cell.dataset.col));
    });
    grid.addEventListener('focusout', () => { if (!grid.contains(document.activeElement)) unhover(); });

    // Pointer: hover shows a month; pressing and dragging scrubs through months.
    let drag: { row: number; col: number; moved: boolean } | null = null;
    function cellAt(x: number, y: number): [number, number] {
      const style = getComputedStyle(grid);
      const cell = parseFloat(style.getPropertyValue('--c'));
      const gap = parseFloat(style.getPropertyValue('--g'));
      const first = cells[0][0].getBoundingClientRect();
      const col = Math.floor((x - first.left + gap / 2) / (cell + gap));
      const row = Math.floor((y - first.top + gap / 2) / (cells[0][0].offsetHeight + gap));
      return [Math.max(0, Math.min(rows.length - 1, row)), Math.max(0, Math.min(last, col))];
    }
    grid.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      if (drag) {
        const [row, col] = cellAt(event.clientX, event.clientY);
        if (row !== drag.row || col !== drag.col) Object.assign(drag, { row, col, moved: true });
        focusCell(row, col, true);
        hover(row, col);
        const role = roleAt(row, col) ?? anyRoleAt(col);
        if (role && selected !== role) open(role, api, { scroll: false });
        return;
      }
      const cell = (event.target as Element).closest<HTMLElement>('.cell');
      if (cell) hover(Number(cell.dataset.row), Number(cell.dataset.col));
      else if (hovered) unhover();
    });
    grid.addEventListener('pointerleave', event => { if (!drag && event.pointerType !== 'touch') unhover(); });
    grid.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      const [row, col] = cellAt(event.clientX, event.clientY);
      drag = { row, col, moved: false };
      grid.setPointerCapture(event.pointerId);
      grid.style.cursor = 'ew-resize';
      focusCell(row, col).focus({ preventScroll: true });
      hover(row, col);
      event.preventDefault();
    });
    grid.addEventListener('pointerup', () => {
      if (!drag) return;
      const { row, col, moved } = drag;
      drag = null;
      grid.style.cursor = '';
      const role = roleAt(row, col);
      if (!role) return;
      // A plain click toggles that entry's details; the end of a drag leaves them open.
      if (!moved && selected === role && dwrap.classList.contains('open')) close();
      else open(role, api, { scroll: !moved });
    });
    grid.addEventListener('pointercancel', () => { drag = null; grid.style.cursor = ''; });
    // Touch: a tap opens the entry under the finger.
    grid.addEventListener('click', event => {
      if (!window.matchMedia('(hover: none)').matches) return;
      const cell = (event.target as Element).closest<HTMLElement>('.cell');
      if (!cell) return;
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      focusCell(row, col);
      hover(row, col, false);
      const role = roleAt(row, col);
      if (role) open(role, api);
    });

    // Phones: a slider scrubs through months.
    range.addEventListener('input', () => {
      const col = Number(range.value);
      const row = Math.max(0, rows.findIndex(track => at.get(track.id)![col]));
      focusCell(row, col, true);
      hover(row, col, false);
    });
    range.addEventListener('change', () => {
      const role = roleAt(current.row, current.col);
      if (role) open(role, api);
    });

    size();
    focusCell(0, last);
    setReadout(0, last);
    requestAnimationFrame(() => { scroller.scrollLeft = scroller.scrollWidth; });
    return api;
  }

  // ---------- The two sides ----------
  const workFace = required<HTMLElement>('.face[data-side="work"]');
  const lifeFace = required<HTMLElement>('.face[data-side="life"]');
  required<HTMLElement>('.sub', workFace).textContent = `Each square is a month, from ${label(0)}, when I started at Waterloo, to the present.`;
  const work = mountGrid(workFace, tracks, [...roles, ...terms], role => role.track === 'work');
  const lifeSide = mountGrid(lifeFace, lifeTracks, life, () => true);

  // Flip the card between work and life.
  const card = required<HTMLElement>('#card');
  const switches = [...document.querySelectorAll<HTMLButtonElement>('[data-show]')];
  function show(side: 'work' | 'life', moveFocus = false): void {
    const flipped = side === 'life';
    if (card.classList.contains('flipped') === flipped) return;
    close();
    work.unhover();
    lifeSide.unhover();
    card.classList.toggle('flipped', flipped);
    workFace.inert = flipped;
    lifeFace.inert = !flipped;
    workFace.setAttribute('aria-hidden', String(flipped));
    lifeFace.setAttribute('aria-hidden', String(!flipped));
    switches.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.show === side)));
    if (moveFocus) {
      const target = (flipped ? lifeFace : workFace).querySelector<HTMLButtonElement>(`[data-show="${side}"]`);
      window.setTimeout(() => target?.focus({ preventScroll: true }), reduced ? 0 : 300);
    }
  }
  switches.forEach(button => button.addEventListener('click', () => show(button.dataset.show === 'life' ? 'life' : 'work', true)));
  lifeFace.inert = true;
  lifeFace.setAttribute('aria-hidden', 'true');

  // ---------- The roles list below the timeline ----------
  const list = required<HTMLElement>('#acc');
  for (const role of roles) {
    const item = document.createElement('div');
    item.className = 'ai';
    const panelId = `role-${role.id}`;
    const points = role.points.filter(point => point !== role.summary);
    item.innerHTML =
      `<button type="button" aria-expanded="false" aria-controls="${panelId}" style="--h:${hueOf(role)}">` +
      `<i class="${role.now ? 'ink' : ''}" aria-hidden="true"></i>` +
      `<span class="co">${escape(role.company)}</span><span class="ro">${escape(role.title)}</span><time>${escape(role.dates)}</time>${icons.chevron}</button>` +
      `<div class="ap" id="${panelId}" role="region" aria-label="${escape(role.company)}"><div><div class="in"><p>${escape(role.summary)}</p><div class="meta">` +
      (role.metrics ? `<div class="stats">${role.metrics.map(([value, text]) => `${escape(value)} ${escape(text)}`).join('<br>')}</div>` : '') +
      (points.length ? `<ul class="pts${role.now ? ' ink' : ''}" style="--h:${hueOf(role)}">${points.map(point => `<li>${escape(point)}</li>`).join('')}</ul>` : '') +
      (onGrid(role) ? `<a class="show" href="#timeline" data-id="${role.id}">Show on timeline →</a>` : `<span class="before">Before university · not on the timeline</span>`) +
      '</div></div></div></div>';
    list.append(item);
  }
  const setOpen = (button: HTMLButtonElement, on: boolean): void => {
    button.setAttribute('aria-expanded', String(on));
    const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
    if (!panel) return;
    panel.classList.toggle('open', on);
    panel.inert = !on;
  };
  const toggles = [...list.querySelectorAll<HTMLButtonElement>('.ai > button')];
  toggles.forEach(button => {
    setOpen(button, false);
    button.addEventListener('click', () => setOpen(button, button.getAttribute('aria-expanded') !== 'true'));
  });
  list.addEventListener('click', event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a.show');
    if (!link) return;
    event.preventDefault();
    const role = roles.find(item => item.id === link.dataset.id);
    if (!role) return;
    show('work');
    required<HTMLElement>('#timeline').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    work.focusRole(role);
    work.focusCurrent();
    open(role, work, { scroll: false });
  });
  const expandAll = required<HTMLButtonElement>('#expand-all');
  expandAll.addEventListener('click', () => {
    const on = expandAll.getAttribute('aria-pressed') !== 'true';
    expandAll.setAttribute('aria-pressed', String(on));
    expandAll.textContent = on ? 'Collapse all' : 'Expand all';
    toggles.forEach(button => setOpen(button, on));
  });

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      work.size();
      lifeSide.size();
      if (selected && !sheet.matches) scrim.classList.remove('on');
    });
  });
}
