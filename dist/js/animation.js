// Six crisp key poses from one consistently drawn sheet. Contact, passing and
// flight repeat for opposite legs; no transparent frame blending is used.
export const RUN_CYCLE = [
  { sprite: 'max-v2-run-0', duration: .085, plant: 'left', lift: 0 },
  { sprite: 'max-v2-run-1', duration: .065, lift: 0 },
  { sprite: 'max-v2-run-2', duration: .090, lift: 7 },
  { sprite: 'max-v2-run-3', duration: .085, plant: 'right', lift: 0 },
  { sprite: 'max-v2-run-4', duration: .065, lift: 0 },
  { sprite: 'max-v2-run-5', duration: .090, lift: 7 }
];
const CYCLE_DURATION = RUN_CYCLE.reduce((sum, frame) => sum + frame.duration, 0);
export function runFrameAt(seconds) {
  let time = ((seconds % CYCLE_DURATION) + CYCLE_DURATION) % CYCLE_DURATION;
  for (const frame of RUN_CYCLE) {
    if (time < frame.duration) return frame;
    time -= frame.duration;
  }
  return RUN_CYCLE[0];
}
export function newMotion() { return { phase: 'run', age: 0, runClock: 0 }; }
export function startMotion(motion, phase) {
  return { phase, age: 0, runClock: phase === 'run' ? 0 : motion.runClock };
}
export function advanceMotion(motion, dt, { jumpHeight, duck, cadence = 1 }) {
  const next = { ...motion, age: motion.age + dt };
  if (next.phase === 'run') next.runClock += dt * cadence;
  if (next.phase === 'takeoff' && next.age >= .09) return startMotion(next, 'air');
  if (next.phase === 'air' && jumpHeight <= 0) return startMotion(next, 'land');
  if (next.phase === 'land' && next.age >= .12) return startMotion(next, 'run');
  if (next.phase === 'duck-enter' && next.age >= .09) return startMotion(next, duck ? 'duck' : 'duck-exit');
  if (next.phase === 'duck-exit' && next.age >= .10) return startMotion(next, 'run');
  if (next.phase === 'hit' && next.age >= .38) return startMotion(next, 'recover');
  if (next.phase === 'recover' && next.age >= .12) return startMotion(next, jumpHeight > 0 ? 'air' : duck ? 'duck' : 'run');
  return next;
}
export function poseFor(motion) {
  switch (motion.phase) {
    case 'run': return { ...runFrameAt(motion.runClock), scaleX: 1, scaleY: 1 };
    case 'takeoff': return { sprite: 'max-v2-jump-0', lift: 0, scaleX: 1, scaleY: 1 };
    case 'air': return { sprite: 'max-v2-jump-1', lift: 0, scaleX: 1, scaleY: 1 };
    case 'land': return { sprite: 'max-v2-jump-2', lift: 0, scaleX: 1, scaleY: 1 };
    case 'duck-enter': return { sprite: 'max-v2-jump-0', lift: 0, scaleX: 1, scaleY: 1 };
    case 'duck': return { sprite: 'max-9', lift: 0, scaleX: 1, scaleY: 1 };
    case 'duck-exit': return { sprite: 'max-v2-jump-2', lift: 0, scaleX: 1, scaleY: 1 };
    case 'hit': return { sprite: 'max-10', lift: 0, scaleX: 1, scaleY: 1 };
    case 'recover': return { sprite: 'max-v2-jump-2', lift: 0, scaleX: 1, scaleY: 1 };
    default: return { sprite: 'max-v2-run-0', lift: 0, scaleX: 1, scaleY: 1 };
  }
}
export const FOOT_ANCHOR = Object.freeze({
  'max-v2-run-0': 334, 'max-v2-run-1': 334, 'max-v2-run-2': 303,
  'max-v2-run-3': 332, 'max-v2-run-4': 329, 'max-v2-run-5': 301,
  'max-v2-jump-0': 340, 'max-v2-jump-1': 293, 'max-v2-jump-2': 340,
  'max-9': 327, 'max-10': 327, 'max-11': 343
});
