# Vishnu’s portfolio

A TypeScript portfolio built with Vite and deployed to GitHub Pages. This is the first foundation of the redesign: selected work on the front, personal interests in a bonus chapter, and a playing card connecting the two.

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

- `index.html`: copy, project links, playlist archive, and page metadata. The content is in HTML so the introduction and project links render before JavaScript loads.
- `src/styles.css`: responsive layout, light and dark palettes, and card artwork.
- `src/interactions.ts`: chapter navigation, card deal, theme preference, card shuffle, and race lights.
- `src/main.ts`: entry point.
- `public/`: files copied directly into the build, including the favicon.

The anime and manhwa covers are intentional placeholders until the favourites are chosen. Playlists are a small saved archive; they do not require a monthly update or Spotify credentials.

Theme preference is saved only in the visitor’s browser. There is no backend, database, analytics, admin screen, or API key. Do not commit local `.env` files.

## Interaction checks

Before pushing UI changes, run the type check and production build, then verify:

1. Open the card and return, using mouse and keyboard. Try Escape during a transition.
2. Open `/#bonus` directly, and use the browser Back and Forward buttons.
3. Change themes, reload, and confirm the choice persists.
4. Shuffle the smaller card and start the race lights. Navigate away while an effect is running.
5. Check narrow screens, visible keyboard focus, and the OS reduced-motion setting.

The card deal uses a quiet transition on narrow screens or when its destination would be outside the viewport. Reduced motion opens the chapter without animation.

## Deploy

`.github/workflows/deploy.yml` builds `dist/` and publishes it with GitHub Pages when `main` changes. Pull requests run the same build without publishing. In repository **Settings → Pages**, the build source must be **GitHub Actions**.

The current hosting address is <https://vishnudevp.github.io/>. The `vishnudev.me` domain is shown in the design but is not configured by this code. Connect it in Pages and update its DNS using [GitHub’s custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) when ready.

Earlier `CSS/`, `JS/`, `Images/`, and résumé files remain in the repository for reference; Vite does not include them in this build. The earlier local `loft/` experiment is ignored.
