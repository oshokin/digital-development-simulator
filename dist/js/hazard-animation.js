const animated = {
  bear: { sheet: 'bears', row: 0, fps: 7 },
  polarBear: { sheet: 'bears', row: 1, fps: 7 },
  orca: { sheet: 'creatures', row: 0, fps: 5 },
  tiger: { sheet: 'creatures', row: 1, fps: 8 },
  crane: { sheet: 'creatures', row: 2, fps: 6 },
  hourglass: { sheet: 'hourglass', row: 0, fps: 4 },
  permit: { sheet: 'permit', row: 0, fps: 4 },
  server: { sheet: 'server', row: 0, fps: 5 },
  cable: { sheet: 'cable', row: 0, fps: 7 },
  camera: { sheet: 'exposed-cable', row: 0, fps: 6 },
  coffee: { sheet: 'coffee', row: 0, fps: 4 }
};

// The clock belongs to the obstacle, so pause and retry never change its pose.
export function hazardPose(kind, age) {
  const cycle = animated[kind];
  const frame = cycle ? Math.floor(age * cycle.fps) % 4 : 0;
  const wave = Math.sin(age * (kind === 'slowdown' ? 3 : 9));
  return {
    sheet: cycle?.sheet || null,
    row: cycle?.row || 0,
    frame,
    bob: ['drone', 'glider', 'tiger', 'crane'].includes(kind) ? wave * 2 : 0,
    tilt: kind === 'glider' ? wave * .025 : kind === 'slowdown' ? wave * .035 : 0,
    squash: kind === 'slowdown' ? 1 + wave * .035 : 1
  };
}
