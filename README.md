# Oleg Shokin — portfolio & Digital Development Simulator

Static portfolio at `/` and runner game at `/play/`. Author TypeScript in `src/{site,play,shared}/js`; `npm run build` strictly checks it and generates browser JavaScript in matching `dist/` directories. Deploy only `dist/`: hosting requires no Node.js, backend, or runtime dependencies. HTML, CSS and assets remain in `dist/`, with isolated site/game ownership. Language and theme preferences are saved in the browser.

## Local development

Use Node.js 22+ for the local server and checks:

```bash
npm ci --include=dev
npm run check
npm run dev
```

Open `http://127.0.0.1:8080/` or `http://127.0.0.1:8080/play/`. Use HTTP, not `file://`: asset paths are absolute.

With [Task](https://taskfile.dev/docs/installation):

```bash
task             # List commands
task dev         # Start the local server
task install     # Reinstall dependencies
task lint        # Check JS types, syntax and asset references
task test        # Run tests
task check       # Run lint and tests
task build       # Check and package dist/ as release/site.tar.gz
task standalone  # Install dependencies if needed, check, build offline HTML
```

Install development dependencies before building. `npm run check` compiles strict TypeScript for both applications and shared code, validates assets, and runs runtime regressions against generated modules. Domain contracts live in `src/play/js/types.ts`; compile-negative contracts live in `types/strict-regressions.ts`. Never edit generated `dist/**/*.js`. `npm run dev` builds initially and watches TypeScript changes; `npm run format` formats sources. `task build` verifies and packages generated output; `npm run build:offline` compiles before producing standalone HTML. `strict` is enabled; `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are not.

The portfolio lists a distributed object store, two NDA projects (property valuation and CRM), xk6-kv, and Cursor Chat Transit. Private client details stay omitted.

## Deployment

See [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) for VPS setup, GitHub secrets, deployment, and rollback. `Check` validates changes; `Deploy` runs manually with a server selection. Each VPS has separate environment secrets.

## Source files

- `dist/index.html`, `dist/site/css/site.css`, `dist/site/js/site.js`: portfolio and EN/RU/ES translations.
- `dist/play/index.html`, `dist/play/css/game.css`, `dist/play/js/game.js`: game screen, controls, movement, rendering.
- `dist/play/js/game-data.js`, `dist/play/js/game-world.js`, `dist/play/js/game-flow.js`: stages, dialogue, obstacles, endings, transitions.
- `dist/play/js/game-geometry.js`: obstacle drawing and collision geometry.
- `dist/play/js/animation.js`, `dist/play/js/game-pace.js`: character poses and acceleration.
- `dist/play/js/hazard-animation.js`, `dist/play/js/hazard-effects.js`: obstacle animation and effects.
- `dist/play/js/game-audio.js`: music, effects, and sound preferences.
- `dist/shared/js/preferences.js`, `dist/shared/css/tokens.css`: shared language and theme settings.
- `dist/assets/game/`: game audio, backgrounds, and sprites.
- `dist/assets/site/images/`: portrait and site-owned game preview.
- `dist/assets/shared/`: favicon shared by both pages.

## Gameplay

The campaign has five stages lasting 76–84 seconds each, checkpoints, a route choice after stage three, and two endings. After defeat, restart the stage or campaign. Endless mode restarts from zero and has no stage transitions.

Controls: Space / Up / W to jump, Down / S to duck, P to pause. On touchscreens, tap the upper half to jump; tap or hold the lower half to duck.

Jump to collect coffee or shields. Coffee appears when a life is missing; shields appear when no shield is active. Pickups alternate, with at least two obstacles between them. Consecutive obstacles differ, and no more than three appear at the same height in a row.

Each of the six scenes has separate EN/RU/ES artwork. Reduced-motion preferences disable decorative movement. Music and effects have separate controls, saved in the browser. The site makes no external requests during play; GitHub and Telegram links open external pages.

## Assets

Backgrounds use lossy WebP at quality 85; sprites and obstacle atlases use lossless WebP. Only the current scene and selected language load initially. A neutral background remains visible while loading.

To optimize new PNG artwork, run `python3 scripts/optimize-assets.py`. It requires Pillow with WebP support and replaces a PNG only when the result is smaller. Update references for renamed files. Pillow is not a site or offline-build dependency.

Final animation WebP assets are maintained directly in `dist/assets/game/sprites/`. See the [game reference](docs/GAME.md) for gameplay rules, animation, and asset layout.

Music and `player-jump.mp3`, `player-duck.mp3`, and `player-death.mp3` were supplied by the project owner. Collision, shield pickup, shield break, and coffee pickup effects are generated. Replace `dist/assets/game/audio/coffee-pickup.mp3` to use another coffee sound. Regenerate effects with `python3 scripts/generate-effects.py`; Python 3 and ffmpeg are required.
