import { monthIndex, type Role, type Track } from './roles';

/**
 * The life side of the timeline: trips, things I do, and music.
 *
 * To add something, add one line to `life` below with `trip`, `moment` or `playlist`.
 * Months are 1–12. A one-month entry can leave out the end month.
 *
 *   trip('lisbon-2026', 'Lisbon', 'Portugal', [2026, 3], [2026, 4], 'Ten days of tiles and pastéis.',
 *     { photo: ['/photos/lisbon.jpg', 'Trams on a hill in Lisbon'] }),
 *   moment('montreal-gp-2025', 'Canadian Grand Prix', [2025, 6], undefined, 'First F1 race in person.'),
 *
 * Photos go in public/photos/ and are referenced as '/photos/name.jpg'.
 */
export const lifeTracks: readonly Track[] = [
  { id: 'trips', name: 'Trips' },
  { id: 'life', name: 'Life' },
  { id: 'music', name: 'Music' },
];

/** Each row keeps one colour. */
const HUES = { trips: 190, life: 85, music: 330 } as const;

type Month = [year: number, month: number];
interface Extra {
  photo?: [src: string, alt: string];
  link?: [label: string, href: string];
  points?: string[];
  /** A shorter label for under the grid. */
  short?: string;
}

function entry(track: keyof typeof HUES, id: string, name: string, kind: string, from: Month, to: Month | undefined, summary: string, extra: Extra = {}): Role {
  const end = to ?? from;
  return {
    id, track, company: name, short: extra.short ?? name, title: kind, dates: span(from, end),
    start: monthIndex(...from), end: monthIndex(...end), hue: HUES[track],
    summary, points: extra.points ?? [], photo: extra.photo, link: extra.link,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function span([y1, m1]: Month, [y2, m2]: Month): string {
  if (y1 === y2 && m1 === m2) return `${MONTHS[m1 - 1]} ${y1}`;
  return y1 === y2 ? `${MONTHS[m1 - 1]} – ${MONTHS[m2 - 1]} ${y1}` : `${MONTHS[m1 - 1]} ${y1} – ${MONTHS[m2 - 1]} ${y2}`;
}

/** A trip: `place` is the subtitle, e.g. the country. */
export const trip = (id: string, name: string, place: string, from: Month, to: Month | undefined, summary: string, extra?: Extra): Role =>
  entry('trips', id, name, `Trip · ${place}`, from, to, summary, extra);
/** Something I did: a race, a tournament, a show, a milestone. */
export const moment = (id: string, name: string, from: Month, to: Month | undefined, summary: string, extra?: Extra): Role =>
  entry('life', id, name, 'Life', from, to, summary, extra);
/** One of the monthly playlists. */
export const playlist = (id: string, name: string, month: Month, spotify: string, photo: [src: string, alt: string]): Role =>
  entry('music', id, name, 'Monthly playlist', month, undefined, 'One of my monthly playlists. I shot the cover photo.', { photo, link: ['Open in Spotify', spotify], short: MONTHS[month[1] - 1] });

/** Newest first. */
export const life: Role[] = [
  playlist('playlist-nov-2025', 'November 2025', [2025, 11], 'https://open.spotify.com/playlist/5n2epHpOtFEQMm9WbuegXs', ['/covers/nov-2025.jpg', 'A snowy night outside a building']),
  playlist('playlist-sep-2025', 'September 2025', [2025, 9], 'https://open.spotify.com/playlist/2wEa8YBXmogelz0fnEEbVk', ['/covers/sep-2025.jpg', 'The Shanghai skyline at night']),
  playlist('playlist-jul-2025', 'July 2025', [2025, 7], 'https://open.spotify.com/playlist/6zuuYvkXprO83aHJPNDQVU', ['/covers/jul-2025.jpg', 'A sunset over the water']),
];
