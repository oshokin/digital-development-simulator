import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hazardPose } from '../dist/play/js/hazard-animation.js';
import { imageDimensions } from './image-dimensions.mjs';

test('barrier lamp strip cycles without moving its art or collision geometry', async () => {
  const frames = new Set(Array.from({ length: 40 }, (_, i) => hazardPose('barrier', i / 10).frame));
  assert.deepEqual([...frames].sort(), [0, 1, 2, 3]);
  for (let i = 0; i < 4; i++) {
    const pose = hazardPose('barrier', i / 3);
    assert.equal(pose.sheet, 'barrier');
    assert.equal(pose.bob, 0);
    assert.equal(pose.tilt, 0);
    assert.equal(pose.squash, 1);
  }
  const strip = await readFile(new URL('../dist/assets/game/sprites/hazards/barrier.webp', import.meta.url));
  assert.deepEqual(imageDimensions(strip), [1448, 362]);
});
