// Generated from src/ by npm run build. Do not edit.
const animated = {
  barrier: { sheet: "barrier", row: 0, fps: 3 },
  fan: { sheet: "fan", row: 0, fps: 12 },
  paper: { sheet: "paper", row: 0, fps: 8 },
  cone: { sheet: "cone", row: 0, fps: 8 },
  crate: { sheet: "crate", row: 0, fps: 6 },
  bear: { sheet: "bear", row: 0, fps: 7 },
  polarBear: { sheet: "polar-bear", row: 0, fps: 7 },
  orca: { sheet: "orca", row: 0, fps: 5 },
  tiger: { sheet: "tiger", row: 0, fps: 8 },
  crane: { sheet: "crane", row: 0, fps: 6 },
  hourglass: { sheet: "hourglass", row: 0, fps: 4 },
  permit: { sheet: "permit", row: 0, fps: 4 },
  server: { sheet: "server", row: 0, fps: 5 },
  cable: { sheet: "cable", row: 0, fps: 7 },
  camera: { sheet: "exposed-cable", row: 0, fps: 6 },
  shield: { sheet: "shield", row: 0, fps: 6 },
  coffee: { sheet: "coffee", row: 0, fps: 4 }
};
const STRIP_FRAMES = 4;
const BOB = Object.freeze({
  slowdownRate: 3,
  hazardRate: 9,
  pickupRate: 4,
  pickupPixels: 5,
  hazardPixels: 2
});
const DEFORMATION = Object.freeze({
  gliderTilt: 0.025,
  slowdownTilt: 0.035,
  slowdownSquash: 0.035
});
function hazardPose(kind, age) {
  const cycle = animated[kind];
  const frame = cycle ? Math.floor(age * cycle.fps) % STRIP_FRAMES : 0;
  const wave = Math.sin(
    age * (kind === "slowdown" ? BOB.slowdownRate : BOB.hazardRate)
  );
  const pickup = kind === "coffee" || kind === "shield";
  return {
    sheet: cycle?.sheet || null,
    row: cycle?.row || 0,
    frame,
    bob: pickup ? Math.sin(age * BOB.pickupRate) * BOB.pickupPixels : ["drone", "glider", "tiger", "crane", "cone"].includes(kind) ? wave * BOB.hazardPixels : 0,
    tilt: kind === "glider" ? wave * DEFORMATION.gliderTilt : kind === "slowdown" ? wave * DEFORMATION.slowdownTilt : 0,
    squash: kind === "slowdown" ? 1 + wave * DEFORMATION.slowdownSquash : 1
  };
}
export {
  hazardPose
};
