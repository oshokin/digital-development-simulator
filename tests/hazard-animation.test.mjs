import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hazardPose } from '../dist/js/hazard-animation.js';

test('walking, swimming, hovering and flying hazards cycle through real poses', async () => {
  for (const kind of ['bear', 'polarBear', 'orca', 'tiger', 'crane']) {
    const cycle = new Set();
    for (let time = 0; time < 1; time += .03) cycle.add(hazardPose(kind, time).frame);
    assert.deepEqual([...cycle].sort(), [0, 1, 2, 3], kind);
    assert.ok(hazardPose(kind, 0).sheet, kind);
  }
  assert.notEqual(hazardPose('glider', .1).tilt, hazardPose('glider', .3).tilt);
  assert.notEqual(hazardPose('slowdown', .1).tilt, hazardPose('slowdown', .3).tilt);
  assert.notEqual(hazardPose('drone', .1).bob, hazardPose('drone', .3).bob);
  for (const file of ['bear-run', 'creatures-motion']) {
    const png = await readFile(new URL(`../dist/assets/hazards/${file}.png`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
  }
});

test('coffee steam and the exposed cable each have four timed poses', async () => {
  for (const kind of ['coffee', 'camera']) {
    const frames = new Set();
    for (let time = 0; time < 1; time += .03) frames.add(hazardPose(kind, time).frame);
    assert.deepEqual([...frames].sort(), [0, 1, 2, 3], kind);
    const name = hazardPose(kind, 0).sheet === 'coffee' ? 'coffee-motion' : 'exposed-cable-motion';
    const png = await readFile(new URL(`../dist/assets/hazards/${name}.png`, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16) % 4, 0);
  }
});
