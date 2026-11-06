# Game reference

## Gameplay

The campaign has five levels, 400 seconds of running, and two endings. Endless mode has no checkpoints or stage changes.

- Jump over ground obstacles; duck under flying obstacles.
- Never spawn the same obstacle type consecutively.
- Alternate coffee and shields, with at least two obstacles between pickups.
- Switch height after three consecutive obstacles at one height. Pickups do not reset the counter.
- Preserve spawn history across levels; reset it for a new run.
- Mark coffee and shields with a contrasting outline and plus sign.

Animation does not change hitboxes. Enemies do not shoot: overlapping projectile and obstacle requirements could leave no safe move.

## Animation

`dist/play/js/animation.js` defines Max's pose timing and floor offsets. Running uses six opaque frames without crossfading and speeds up with the road. Jumping uses takeoff, airborne, and landing poses. `FOOT_ANCHOR` defines foot alignment.

`hazard-animation.js` selects obstacle frames using each object's age, so pausing freezes animation. `hazard-effects.js` draws local effects and collectible cues.

The plane uses rigid rotation and a moving exhaust trail, without bending its wings. Its runtime kind is `cone`. The calendar stays static. Barrier lamps blink without changing the housing.

Reduced-motion preferences disable camera movement and decorative effects and freeze collectible and barrier poses.

## Assets

All game assets live in `dist/assets/game/`:

- `audio/`: music and sound effects.
- `backgrounds/`: six scenes, each with separate EN/RU/ES artwork.
- `sprites/character/`: Max's running, jumping, ducking, hit, and defeat frames.
- `sprites/hazards/`: individual obstacle images and animation strips.
- `sprites/perks/`: coffee and shield strips; `*-legend.webp` files are icons below the playfield.

Animation strips contain four horizontal frames. Final WebP files are maintained directly; no source-art generator is required. Scene readiness waits for sprite decoding.

`tests/asset-inventory.test.mjs` checks shipped assets. Asset and code ownership tests enforce the site/game boundary.
