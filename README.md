# View Time Plots

A static web application that visualizes video analysis data as time plots. Each "case" represents an analyst's viewing session of a video, rendered alongside the embedded video so you can correlate analyst behavior (play, pause, rewind, fast-forward) with what was on screen.

Built with Svelte 5 + Vite + TypeScript + Tailwind/daisyUI, with d3 for scales.

## Development

```sh
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173/view-time-plots/`).

## Build

```sh
npm run build
npm run preview
```

The production build is emitted to `dist/`.

## Deployment

This repo deploys to GitHub Pages automatically on push to `main` via `.github/workflows/deploy.yml`. The live site is at `https://<owner>.github.io/view-time-plots/`.

To deploy:
1. In the repo's GitHub settings → Pages, set **Source** to **GitHub Actions**.
2. Push to `main`. The workflow builds and publishes `dist/`.

The Vite `base` is set to `/view-time-plots/` in `vite.config.ts` — if you rename the repo, update that.

## Data

Example datasets live in `public/data/example-N/units.csv`. CSV columns: `Analysts, Units, Method, TStartVid, TEndVid, TStartAnalyst, TEndAnalyst`. Timecodes are `H:MM:SS`. Add new examples in `src/lib/constants.ts`.

## Controls

- Click the plot to seek the video to that analyst time
- Click the "Normal View" / "Scaled View" toggle (or press **S**) to switch view modes
- Drag the divider between plot and video to resize panes
