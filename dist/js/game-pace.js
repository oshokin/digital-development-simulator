// Fast approach to a capped speed, like a compact endless runner.
export function paceFor(elapsed, duration, stage = 0, endlessTotal = 0) {
  const time = Math.max(0, elapsed);
  const base = 350 + stage * 15;
  const ramp = 1 - Math.exp(-time / 5.5);
  const speed = base + 350 * ramp + Math.min(endlessTotal / 4, 90);
  return {
    speed,
    multiplier: Math.min(1.55, 1 + (speed - base) / 620),
    spawnDelay: 1.8 - .3 * ramp,
    spawnJitter: .6 - .15 * ramp
  };
}
