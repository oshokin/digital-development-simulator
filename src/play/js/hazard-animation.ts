// Authored sprite-strip rows (zero-based) and playback rates in frames per second.

const animated: Partial<
  Record<
    import('./types.js').ItemKind,
    { sheet: string; row: number; fps: number }
  >
> = {
  barrier: { sheet: 'barrier', row: 0, fps: 3 },
  fan: { sheet: 'fan', row: 0, fps: 12 },
  paper: { sheet: 'paper', row: 0, fps: 8 },
  cone: { sheet: 'cone', row: 0, fps: 8 },
  crate: { sheet: 'crate', row: 0, fps: 6 },
  bear: { sheet: 'bear', row: 0, fps: 7 },
  polarBear: { sheet: 'polar-bear', row: 0, fps: 7 },
  orca: { sheet: 'orca', row: 0, fps: 5 },
  tiger: { sheet: 'tiger', row: 0, fps: 8 },
  crane: { sheet: 'crane', row: 0, fps: 6 },
  hourglass: { sheet: 'hourglass', row: 0, fps: 4 },
  permit: { sheet: 'permit', row: 0, fps: 4 },
  server: { sheet: 'server', row: 0, fps: 5 },
  cable: { sheet: 'cable', row: 0, fps: 7 },
  camera: { sheet: 'exposed-cable', row: 0, fps: 6 },
  shield: { sheet: 'shield', row: 0, fps: 6 },
  coffee: { sheet: 'coffee', row: 0, fps: 4 }
};

// Number of equally sized frames in each hazard strip.
const STRIP_FRAMES = 4;
// Oscillation rates in radians per second and displacement in canvas pixels.
const BOB = Object.freeze({
  slowdownRate: 3,
  hazardRate: 9,
  pickupRate: 4,
  pickupPixels: 5,
  hazardPixels: 2
});
// Angular tilt amplitudes in radians and dimensionless squash amplitude.
const DEFORMATION = Object.freeze({
  gliderTilt: 0.025,
  slowdownTilt: 0.035,
  slowdownSquash: 0.035
});

// The clock belongs to the obstacle, so pause and retry never change its pose.

export function hazardPose(kind: import('./types.js').ItemKind, age: number) {
  const cycle = animated[kind];
  const frame = cycle ? Math.floor(age * cycle.fps) % STRIP_FRAMES : 0;
  const wave = Math.sin(
    age * (kind === 'slowdown' ? BOB.slowdownRate : BOB.hazardRate)
  );
  const pickup = kind === 'coffee' || kind === 'shield';
  return {
    sheet: cycle?.sheet || null,
    row: cycle?.row || 0,
    frame,
    bob: pickup
      ? Math.sin(age * BOB.pickupRate) * BOB.pickupPixels
      : ['drone', 'glider', 'tiger', 'crane', 'cone'].includes(kind)
        ? wave * BOB.hazardPixels
        : 0,
    tilt:
      kind === 'glider'
        ? wave * DEFORMATION.gliderTilt
        : kind === 'slowdown'
          ? wave * DEFORMATION.slowdownTilt
          : 0,
    squash: kind === 'slowdown' ? 1 + wave * DEFORMATION.slowdownSquash : 1
  };
}
