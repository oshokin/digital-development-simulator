// Generated from src/ by npm run build. Do not edit.
const BASE_SPEED = 350;
const STAGE_SPEED_STEP = 15;
const RAMP_TIME_SECONDS = 5.5;
const RAMP_SPEED = 350;
const ENDLESS_SECONDS_PER_SPEED = 4;
const ENDLESS_SPEED_CAP = 90;
const MULTIPLIER_CAP = 1.55;
const MULTIPLIER_SPEED_SCALE = 620;
const SPAWN_DELAY_SECONDS = 1.8;
const SPAWN_DELAY_REDUCTION_SECONDS = 0.3;
const SPAWN_JITTER_SECONDS = 0.6;
const SPAWN_JITTER_REDUCTION_SECONDS = 0.15;
function paceFor(elapsed, duration, stage = 0, endlessTotal = 0) {
  const time = Math.max(0, elapsed);
  const base = BASE_SPEED + stage * STAGE_SPEED_STEP;
  const ramp = 1 - Math.exp(-time / RAMP_TIME_SECONDS);
  const speed = base + RAMP_SPEED * ramp + Math.min(endlessTotal / ENDLESS_SECONDS_PER_SPEED, ENDLESS_SPEED_CAP);
  return {
    speed,
    multiplier: Math.min(
      MULTIPLIER_CAP,
      1 + (speed - base) / MULTIPLIER_SPEED_SCALE
    ),
    spawnDelay: SPAWN_DELAY_SECONDS - SPAWN_DELAY_REDUCTION_SECONDS * ramp,
    spawnJitter: SPAWN_JITTER_SECONDS - SPAWN_JITTER_REDUCTION_SECONDS * ramp
  };
}
export {
  paceFor
};
