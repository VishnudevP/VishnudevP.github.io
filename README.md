# Vishnu’s portfolio

A one-page portfolio built with Vite and TypeScript. The centrepiece is a contribution-style timeline: every month since September 2022 is a square, with a Work row coloured by role and a School row for each study and co-op term. Hover or drag across it to see what was happening that month, and open any role or term for its details. The card flips to a Life side with trips, things I've done and monthly playlists. Below it are the roles as an expandable list, Education, and a short Beyond Work section.

## Develop

Use Node 24 (or Node 22.12+) and npm:

```sh
npm ci
npm run dev
```

```sh
npm run check   # Strict TypeScript check
npm run build   # Check types and produce dist/
npm run preview # Serve the production build locally
```

## Edit the site

- `src/roles.ts`: every role and school term on the timeline (dates, wording, metrics, stack, colour). Add a role here and it appears in the grid, the labels, the details and the roles list.
- `src/life.ts`: the Life side of the timeline (trips, moments, playlists). Photos go in `public/photos/`.
- `index.html`: the introduction, the Versine card, Beyond Work, links and page metadata. They are plain HTML so they render before JavaScript loads.
- `src/timeline.ts`: the grid, its labels, hover/drag/keyboard behaviour, the details panel (a bottom sheet on phones) and the roles list.
- `src/styles.css`: layout, light and dark palettes (from the system setting), and the phone layout.
- `public/`: copied straight into the build: the favicon, `resume.pdf`, and the playlist cover photos in `covers/`.

The Résumé links serve `public/resume.pdf`; replace that file to update it.

There is no backend, database, analytics or API key. Do not commit local `.env` files.

## Interaction checks

Before pushing UI changes, run the type check and production build, then check:

1. Hover and drag across the timeline; the month readout and tooltip follow. Click a role to open its details and step through roles with the arrows.
2. Keyboard: Tab into the grid, then ←/→ months, ↑/↓ tracks, `[`/`]` roles, Enter to open, Escape to close.
3. A phone width: the grid scrolls inside its panel, the slider scrubs months, and details open as a bottom sheet with no sideways page scroll.
4. Light and dark system settings, and the reduced-motion setting.

## Publishing is manual

Local development and commits do not publish anything. `.github/workflows/deploy.yml` has no push trigger; pull requests only check the build. Publication requires manually running **Publish site (manual)** from `main`, which publishes `dist/` through GitHub Pages.

The site is served at <https://vishnudev.me/> (GoDaddy DNS pointing at GitHub Pages; the custom domain is set in the repository’s Pages settings).

Design explorations from the redesign live in `explorations/`, which is git-ignored and not part of the site or the build.
