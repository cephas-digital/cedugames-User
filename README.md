# CeduGames

React 19 and Vite frontend for the CeduGames learning experience.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer

## Local development

```bash
npm ci
npm run dev
```

## Production verification

```bash
npm run check
npm run preview
```

`npm run check` runs linting and creates the optimized `dist` build. The production server must serve `index.html` for unknown routes because the application uses browser-based routing.

## Deploy

Build and run the included production container:

```bash
docker build -t cedugames .
docker run --rm -p 8080:80 cedugames
```

Then open `http://localhost:8080`. The Nginx configuration includes SPA routing, asset caching, compression, and baseline security headers.

For a static hosting provider, publish `dist` after `npm run build` and configure a rewrite from all unmatched paths to `/index.html`.
