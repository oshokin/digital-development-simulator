// Shared campaign/endless pace, measured only in active running seconds.
const PACE = Object.freeze({
  initialSpeed: 450,
  acceleration: 4.5,
  maximumSpeed: 975,
  spawnDelay: 1.8,
  spawnJitter: 0.6
});

export function paceFor(activeRunSeconds: number) {
  const speed = Math.min(
    PACE.maximumSpeed,
    PACE.initialSpeed + PACE.acceleration * Math.max(0, activeRunSeconds)
  );
  return {
    speed,
    multiplier: speed / PACE.initialSpeed,
    // Keep a stable recovery interval as speed rises: a jump lasts roughly
    // 2 * 790 / 1880 = 0.84 seconds, leaving 0.96 seconds between jumps.
    spawnDelay: PACE.spawnDelay,
    spawnJitter: PACE.spawnJitter
  };
}
