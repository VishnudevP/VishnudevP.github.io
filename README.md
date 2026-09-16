# Vishnu — coming soon

A small holding page for the personal website, with a black-and-gold playing card. The full portfolio is being developed separately on the local `codex/portfolio-rebuild` branch and must not be published until explicitly requested.

## Local preview

Use Node 24 and npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

`index.html` contains the holding page, styles, and subtle card motion. `public/` contains the favicon and robots file. The page supports narrow screens, system light/dark mode, and reduced motion.

## Publishing

Pushing code does not deploy the site. The GitHub Actions workflow **Publish site (manual)** publishes only when explicitly run from `main`. Pull requests only build the site.

Publish this holding page only after approval. Keep the full portfolio local until separately approved. The custom domain has not been connected.
