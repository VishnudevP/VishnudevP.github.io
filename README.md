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
- `src/interactions.ts` and `src/transitions.css`: Beyond Work navigation, shared-card transition, and personal card deals.
- `src/decks.ts` and `src/decks.css`: the deck picker, saved choice, and four coordinated card/page themes.
- `src/cards.ts` and `src/cards.css`: the chapter deck with its destination button, Next card control, swiping, and the flipping card inside Crowdsupply’s story disclosure.
- `src/work-controls.css`: work-page navigation, startup link, project disclosure, and footer buttons.
- `src/discoveries.ts` and `src/discoveries.css`: four optional suit discoveries and the footer’s Find the ace game. Progress stays in session storage.
- `src/personal-deck.ts` and `src/personal-deck.css`: seven personal interest cards in a shuffled bag, an exploration count, direct music/F1 picks, and a shutter animation.
- `src/record-crate.ts` and `src/record-crate.css`: a small illustrated record crate that browses the saved playlist archive by click, arrow keys, horizontal swipe, or month selection.
- `src/starting-grid.ts` and `src/starting-grid.css`: a five-light reaction game with a randomized start, false starts, measured reaction times, and replay. Leaving or interrupting a round cancels its timers.
- `src/experience.ts`: company selection, keyboard navigation, and role transitions. Without JavaScript, every role stays visible.
- `src/experience-controls.css`: employer tabs, selected states, and the phone layout with visible dates.
- `src/experience-scenes.ts` and `src/experience-scenes.css`: conceptual work illustrations with a brief trace on hover, keyboard focus, or tap.
- `src/main.ts`: entry point.
- `public/`: files copied directly into the build, including the favicon.

The anime and manhwa covers are intentional placeholders until the favourites are chosen. Playlists are a small saved archive; they do not require a monthly update or Spotify credentials.

Choose a deck from the header: Noir (black and gold), Ivory (cream and oxblood), Midnight (navy and silver), or Bordeaux (wine and rose gold). The choice changes the site palette and card details, and is saved only in the visitor’s browser. Existing light/dark preferences carry over to Ivory/Noir. There is no backend, database, analytics, admin screen, or API key. Do not commit local `.env` files.

## Interaction checks

Before pushing UI changes, run the type check and production build, then verify:

1. Open the card and return, using mouse and keyboard. Try Escape during a transition.
2. Open `/#beyond-work` directly, and use the browser Back and Forward buttons. The older `/#bonus` address still works.
3. Open Choose deck, try all four cards, close with Done or Escape, reload, and confirm the choice persists. Escape in the picker should keep the current page open.
4. Use the Music / Browse playlists and Formula 1 / Test your reflexes tiles, or the full-width Draw a card button. Random draws exhaust all seven before refilling; the two tiles revisit either card at any time. Check the unique exploration count, miniature deal animation, and camera shutter. Browse playlist months using the crate, arrow keys, a horizontal swipe, and the month buttons; confirm Open in Spotify follows the selection. In Starting grid, try an early start, wait for lights out for a measured result, and replay. Close a card using Close card or Escape, then navigate away while an effect or countdown is running. Check keyboard focus enters a newly drawn card and returns to the draw button on close.
5. Check narrow screens, visible keyboard focus, and the OS reduced-motion setting.
6. Select each employer. Use Up/Down on desktop or Left/Right on mobile, plus Home/End, to move through the roles. Hover, focus, or use Play animation on its work illustration, and switch roles during the trace. Check that the illustration stacks cleanly on a phone and all employer dates remain visible.
7. Browse the hero deck using Next card, Left/Right keys, and horizontal swipes. Check that vertical touch scrolling works and releasing a swipe does not open a page. Check each destination button, then open and close Crowdsupply’s Read project story disclosure with mouse and keyboard; the card inside it should flip with the open state.
8. Find all four suits: cycle through the deck, view three companies, open the project story, and draw a card in Beyond Work. Play Find the ace, check winning and missed picks, retry, and close mid-mix. Reload to confirm session progress. Escape in either card interaction should close it without leaving the page.

Chapter navigation fades the outgoing page before revealing the next. When the source card is visible, it settles into a small card beside the Beyond Work heading; footer navigation uses the same page fade. Reduced motion changes chapters without animation.

## Publishing is manual

Do not push or publish the full rebuild until explicitly requested. Local development and commits do not publish anything.

`.github/workflows/deploy.yml` has no push trigger. Pull requests only check the build. Publication requires manually running **Publish site (manual)** from `main`; other branches cannot deploy. The workflow publishes only `dist/` through GitHub Pages.

The current hosting address is <https://vishnudevp.github.io/>. The `vishnudev.me` domain is shown in the design but is not configured by this code. Connect it in Pages and update its DNS using [GitHub’s custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) when ready.

Unused legacy CSS, scripts, images, résumé PDFs, Next build files, and editor metadata have been removed. The old untracked loft experiment was moved outside the repository. The root now contains only the current site source, build configuration, and documentation; local dependencies and `.env` files stay ignored.
