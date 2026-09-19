# Vishnu’s portfolio

A local TypeScript portfolio built with Vite. The main page separates Oversine, internship experience, and past projects. A playing card opens Beyond Work as a separate full-page view for personal interests. The full rebuild stays on the local `codex/portfolio-rebuild` branch until it is explicitly approved for publication.

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
- `src/styles.css`: responsive layout, base palettes, and card artwork.
- `src/interactions.ts` and `src/transitions.css`: Beyond Work navigation, shared-card transition, shuffle reveals, and race lights.
- `src/decks.ts` and `src/decks.css`: the deck picker, saved choice, and four coordinated card/page themes.
- `src/cards.ts` and `src/cards.css`: the cut/swipe chapter deck and Crowdsupply story card.
- `src/discoveries.ts` and `src/discoveries.css`: four optional suit discoveries and the footer’s Find the ace game. Progress stays in session storage.
- `src/personal-deck.ts` and `src/personal-deck.css`: seven personal interest cards drawn without repeats, including saved playlist links, race lights, and a shutter animation.
- `src/experience.ts`: company selection, keyboard navigation, and role transitions. Without JavaScript, every role stays visible.
- `src/main.ts`: entry point.
- `public/`: files copied directly into the build, including the favicon.

The anime and manhwa covers are intentional placeholders until the favourites are chosen. Playlists are a small saved archive; they do not require a monthly update or Spotify credentials.

Choose a deck from the header: Noir (black and gold), Ivory (cream and oxblood), Midnight (navy and silver), or Bordeaux (wine and rose gold). The choice changes the site palette and card details, and is saved only in the visitor’s browser. Existing light/dark preferences carry over to Ivory/Noir. There is no backend, database, analytics, admin screen, or API key. Do not commit local `.env` files.

## Interaction checks

Before pushing UI changes, run the type check and production build, then verify:

1. Open the card and return, using mouse and keyboard. Try Escape during a transition.
2. Open `/#beyond-work` directly, and use the browser Back and Forward buttons. The older `/#bonus` address still works.
3. Open Choose deck, try all four cards, close with Done or Escape, reload, and confirm the choice persists. Escape in the picker should keep the current page open.
4. Draw the smaller card to reveal an interest. Draw all seven before repeating; try the playlist link, race lights, and shutter. Put the card away using its button or Escape, then navigate away while an effect is running.
5. Check narrow screens, visible keyboard focus, and the OS reduced-motion setting.
6. Select each employer. Use Up/Down on desktop or Left/Right on mobile, plus Home/End, to move through the roles.
7. Cut the hero deck using its button, Left/Right keys, and horizontal swipes. Check that vertical touch scrolling works and releasing a swipe does not open a page. Select each chapter card, then open Crowdsupply’s story using either its card or text disclosure.
8. Find all four suits: cycle through the deck, view three companies, open the project story, and draw a card in Beyond Work. Play Find the ace, check winning and missed picks, retry, and close mid-mix. Reload to confirm session progress. Escape in either card interaction should close it without leaving the page.

Chapter navigation fades the outgoing page before revealing the next. When the source card is visible, it settles into a small card beside the Beyond Work heading; footer navigation uses the same page fade. Reduced motion changes chapters without animation.

## Publishing is manual

Do not push or publish the full rebuild until explicitly requested. Local development and commits do not publish anything.

`.github/workflows/deploy.yml` has no push trigger. Pull requests only check the build. Publication requires manually running **Publish site (manual)** from `main`; other branches cannot deploy. The workflow publishes only `dist/` through GitHub Pages.

The current hosting address is <https://vishnudevp.github.io/>. The `vishnudev.me` domain is shown in the design but is not configured by this code. Connect it in Pages and update its DNS using [GitHub’s custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) when ready.

Unused legacy CSS, scripts, images, résumé PDFs, Next build files, and editor metadata have been removed. The old untracked loft experiment was moved outside the repository. The root now contains only the current site source, build configuration, and documentation; local dependencies and `.env` files stay ignored.
