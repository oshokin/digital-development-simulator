import { imageDimensions } from './image-dimensions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { RUN_CYCLE, FOOT_ANCHOR, runFrameAt, newMotion, startMotion, advanceMotion, poseFor } from '../dist/play/js/animation.js';

test('run cycle uses one coherent sheet with contact, passing and flight at both halves', async () => {
  assert.equal(RUN_CYCLE.length, 6);
  assert.deepEqual(RUN_CYCLE.filter(frame => frame.plant).map(frame => frame.plant), ['left','right']);
  const duration = RUN_CYCLE.reduce((sum, frame) => sum + frame.duration, 0);
  assert.equal(runFrameAt(0).sprite, runFrameAt(duration).sprite);
  assert.ok(duration >= .4 && duration <= .55);
  for (const [index, frame] of RUN_CYCLE.entries()) {
    assert.equal(frame.sprite, `max-run-${index}`);
    assert.ok(FOOT_ANCHOR[frame.sprite] > 0);
    const png = await readFile(new URL(`../dist/assets/game/sprites/character/${frame.sprite}.webp`, import.meta.url));
    imageDimensions(png);
    assert.equal(imageDimensions(png)[0], 362);
    assert.equal(imageDimensions(png)[1], 362);
  }
  assert.ok(Math.abs(advanceMotion(newMotion(), .1, { jumpHeight: 0, duck: false, cadence: 1.5 }).runClock - .15) < 1e-10);
});

test('jump has a stable air pose independent of velocity sign and returns to run', async () => {
  const jump = startMotion(newMotion(), 'takeoff');
  assert.equal(poseFor(jump).sprite, 'max-jump-takeoff');
  const air = advanceMotion(jump, .1, { jumpHeight: 45, duck: false });
  assert.equal(air.phase, 'air');
  assert.equal(poseFor(air, 300).sprite, poseFor(air, -300).sprite);
  const land = advanceMotion(air, .2, { jumpHeight: 0, duck: false });
  assert.equal(poseFor(land).sprite, 'max-jump-land');
  assert.equal(advanceMotion(land, .13, { jumpHeight: 0, duck: false }).phase, 'run');
  const code = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  assert.ok(!code.includes('state.motion.fromPose'), 'sprite cross-fade would cause ghosting');
});
