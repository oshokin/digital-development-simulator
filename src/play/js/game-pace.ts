// Initial runner speed in canvas pixels per second.
const BASE_SPEED = 350;
// Additional pixels per second for each campaign stage.
const STAGE_SPEED_STEP = 15;
// Seconds controlling the exponential approach to full speed.
const RAMP_TIME_SECONDS = 5.5;
// Maximum ramp contribution in canvas pixels per second.
const RAMP_SPEED = 350;
// Endless seconds required for one additional pixel per second.
const ENDLESS_SECONDS_PER_SPEED = 4;
// Maximum endless contribution in canvas pixels per second.
const ENDLESS_SPEED_CAP = 90;
// Upper bound for the displayed dimensionless pace multiplier.
const MULTIPLIER_CAP = 1.55;
// Speed increase in pixels per second corresponding to one multiplier unit.
const MULTIPLIER_SPEED_SCALE = 620;
// Initial spawn interval and its full-ramp reduction, in seconds.
const SPAWN_DELAY_SECONDS = 1.8;
// Seconds removed from the spawn interval at full ramp.
const SPAWN_DELAY_REDUCTION_SECONDS = 0.3;
// Initial random spawn interval range, in seconds.
const SPAWN_JITTER_SECONDS = 0.6;
// Seconds removed from the jitter range at full ramp.
const SPAWN_JITTER_REDUCTION_SECONDS = 0.15;

// Fast approach to a capped speed, like a compact endless runner.

export function paceFor(
  elapsed: number,
  duration: number,
  stage: number = 0,
  endlessTotal: number = 0
) {
  const time = Math.max(0, elapsed);
  const base = BASE_SPEED + stage * STAGE_SPEED_STEP;
  const ramp = 1 - Math.exp(-time / RAMP_TIME_SECONDS);
  const speed =
    base +
    RAMP_SPEED * ramp +
    Math.min(endlessTotal / ENDLESS_SECONDS_PER_SPEED, ENDLESS_SPEED_CAP);
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
