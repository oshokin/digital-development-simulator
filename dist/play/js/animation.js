// Generated from src/ by npm run build. Do not edit.
const PHASE_DURATION = Object.freeze({
  takeoff: 0.09,
  land: 0.12,
  duckEnter: 0.09,
  duckExit: 0.1,
  hit: 0.38,
  recover: 0.12
});
const RUN_CYCLE = [
  { sprite: "max-run-0", duration: 0.085, plant: "left", lift: 0 },
  { sprite: "max-run-1", duration: 0.065, lift: 0 },
  { sprite: "max-run-2", duration: 0.09, lift: 7 },
  { sprite: "max-run-3", duration: 0.085, plant: "right", lift: 0 },
  { sprite: "max-run-4", duration: 0.065, lift: 0 },
  { sprite: "max-run-5", duration: 0.09, lift: 7 }
];
const CYCLE_DURATION = RUN_CYCLE.reduce(
  (sum, frame) => sum + frame.duration,
  0
);
function runFrameAt(seconds) {
  let time = (seconds % CYCLE_DURATION + CYCLE_DURATION) % CYCLE_DURATION;
  for (const frame of RUN_CYCLE) {
    if (time < frame.duration) return frame;
    time -= frame.duration;
  }
  return RUN_CYCLE[0];
}
function newMotion() {
  return { phase: "run", age: 0, runClock: 0 };
}
function startMotion(motion, phase) {
  return { phase, age: 0, runClock: phase === "run" ? 0 : motion.runClock };
}
function advanceMotion(motion, dt, {
  jumpHeight,
  duck,
  cadence = 1
}) {
  const next = { ...motion, age: motion.age + dt };
  if (next.phase === "run") next.runClock += dt * cadence;
  if (next.phase === "takeoff" && next.age >= PHASE_DURATION.takeoff)
    return startMotion(next, "air");
  if (next.phase === "air" && jumpHeight <= 0) return startMotion(next, "land");
  if (next.phase === "land" && next.age >= PHASE_DURATION.land)
    return startMotion(next, "run");
  if (next.phase === "duck-enter" && next.age >= PHASE_DURATION.duckEnter)
    return startMotion(next, duck ? "duck" : "duck-exit");
  if (next.phase === "duck-exit" && next.age >= PHASE_DURATION.duckExit)
    return startMotion(next, "run");
  if (next.phase === "hit" && next.age >= PHASE_DURATION.hit)
    return startMotion(next, "recover");
  if (next.phase === "recover" && next.age >= PHASE_DURATION.recover)
    return startMotion(next, jumpHeight > 0 ? "air" : duck ? "duck" : "run");
  return next;
}
function poseFor(motion) {
  switch (motion.phase) {
    case "run":
      return { ...runFrameAt(motion.runClock), scaleX: 1, scaleY: 1 };
    case "takeoff":
      return { sprite: "max-jump-takeoff", lift: 0, scaleX: 1, scaleY: 1 };
    case "air":
      return { sprite: "max-jump-air", lift: 0, scaleX: 1, scaleY: 1 };
    case "land":
      return { sprite: "max-jump-land", lift: 0, scaleX: 1, scaleY: 1 };
    case "duck-enter":
      return { sprite: "max-jump-takeoff", lift: 0, scaleX: 1, scaleY: 1 };
    case "duck":
      return { sprite: "max-duck", lift: 0, scaleX: 1, scaleY: 1 };
    case "duck-exit":
      return { sprite: "max-jump-land", lift: 0, scaleX: 1, scaleY: 1 };
    case "hit":
      return { sprite: "max-hit", lift: 0, scaleX: 1, scaleY: 1 };
    case "recover":
      return { sprite: "max-jump-land", lift: 0, scaleX: 1, scaleY: 1 };
    default:
      return { sprite: "max-run-0", lift: 0, scaleX: 1, scaleY: 1 };
  }
}
const FOOT_ANCHOR = Object.freeze({
  "max-run-0": 334,
  "max-run-1": 334,
  "max-run-2": 303,
  "max-run-3": 332,
  "max-run-4": 329,
  "max-run-5": 301,
  "max-jump-takeoff": 340,
  "max-jump-air": 293,
  "max-jump-land": 340,
  "max-duck": 327,
  "max-hit": 327,
  "max-defeat": 343
});
export {
  FOOT_ANCHOR,
  RUN_CYCLE,
  advanceMotion,
  newMotion,
  poseFor,
  runFrameAt,
  startMotion
};
