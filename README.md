# My Portfolio & Digital Development Simulator

Static portfolio at `/` and runner game at `/play/`. Author TypeScript in `src/{site,play,shared}/js`; `npm run build` strictly checks it and generates browser JavaScript in matching `dist/` directories. Deploy only `dist/`: hosting requires no Node.js, backend, or runtime dependencies. HTML, CSS and assets remain in `dist/`, with isolated site/game ownership. Language and theme preferences are saved in the browser.

## Local development

Hazard asset contract: `src/play/js/hazard-layout.ts` records original coordinate
spaces, vertical union crops and ground/flight anchors. Crop the same rows from
every frame, never individual-frame bounds; rendering keeps original scale and
position independently of collision geometry. Current crops remove only fully
transparent rows (including all smoke/sparks and nonzero-alpha fringe). Assets
whose fringe reaches both edges remain unchanged. Re-encode losslessly with
exact RGBA preservation; `tests/hazard-assets.json` pins measured dimensions,
visible bounds and asset/retained-RGBA SHA-256 hashes. Remeasure before updating.

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
task test        # Run tests
task check       # Build once, check formatting, validate and test
task build       # Compile and generate dist/
task package     # Check and package dist/ as release/site.tar.gz
task format      # Format sources
task nginx:up    # Build and start local nginx
task nginx:check # Check nginx configuration and HTTP delivery
task nginx:logs  # Follow local nginx logs
task nginx:down  # Stop local nginx
task standalone  # Install dependencies if needed, check, build offline HTML
```

Tasks install locked development dependencies when needed. `task check` builds once, checks formatting, syntax and asset references, and runs tests. Direct npm commands require dependency installation first. The development server builds initially and watches TypeScript changes.

## Build outputs

- `task build`: generates browser JavaScript in `dist/`.
- `task package`: runs checks and creates `release/site.tar.gz` for hosting.
- `task standalone`: runs checks and creates `release/digital-development-simulator-offline.html`, containing the portfolio, game and assets. Open this file without a server; external links still require internet.

For local Nginx, run `task nginx:up` and open `http://127.0.0.1:8088/`. Use `DDS_PORT=18089 task nginx:up` to select another port; use the same environment setting for subsequent Nginx commands. Docker Compose is required only for these tasks, not for the site itself.

## Deployment

See [deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md) for VPS setup, GitHub secrets, deployment, and rollback. `Check` validates changes; `Deploy` runs manually with a server selection. Each VPS has separate environment secrets.

## Source files

- `src/site/js/`: portfolio logic and EN/RU/ES translations.
- `src/play/js/`: game logic, rendering, input, audio and scene loading.
- `src/shared/js/`: shared browser preferences and year.
- `dist/index.html`, `dist/play/index.html`: page markup.
- `dist/{site,play,shared}/css/`: page styles and shared tokens.
- `dist/assets/game/`: game audio, backgrounds, and sprites.
- `dist/assets/site/images/`: portrait and site-owned game preview.
- `dist/assets/shared/`: favicon shared by both pages.
- `tests/`, `types/strict-regressions.ts`: runtime and compile-time regression checks.
- `deploy/`: Nginx configuration, local Compose and VPS deployment scripts.

Edit TypeScript in `src/`, not generated `dist/**/*.js`.

## Gameplay

Five campaign stages, checkpoints, a route choice and two endings, plus an endless mode. See the [game reference](docs/GAME.md) for detailed rules and animation.

Controls: Space / Up / W to jump, Down / S to duck, P to pause. On touchscreens, tap the upper half to jump; tap or hold the lower half to duck.

Campaign and endless pace share `min(975, 450 + 4.5 × active running seconds)` canvas pixels/second; the displayed multiplier is speed / 450, reaching 13/6 at 116.6667 active seconds. Stage changes preserve pace; pauses, scene loading and interludes do not advance it. Retrying a campaign level restores its starting time and score; starting either mode again resets time. Spawn intervals remain 1.8–2.4 seconds instead of shrinking with speed (the white route keeps its longer interval). The mobile logical viewport is 640×650 with runner X=80 (desktop remains 960×540, X=150); existing CSS and touch scaling remain unchanged. At maximum speed, conservative art-edge-to-collision warning minus ascent above the tallest 88-pixel hazard and a 35 ms update step leaves at least 0.3 seconds to react on both viewports.

Scenes have separate EN/RU/ES artwork. Music and effects have independent controls; language, theme and audio preferences are saved in the browser.

## Assets

Backgrounds use lossy WebP at quality 85; sprites use lossless WebP. Scene changes wait for image loading and decoding instead of displaying an unrelated fallback.

Final animation WebP assets are maintained directly in `dist/assets/game/sprites/`.

Music and `player-jump.mp3`, `player-duck.mp3`, and `player-death.mp3` were supplied by the project owner. Collision, shield pickup, shield break, and coffee pickup effects were synthesized and are stored as ready-to-use MP3 files. No Python or ffmpeg is required to build or run the project.
