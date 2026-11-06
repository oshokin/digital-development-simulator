import { imageDimensions } from './image-dimensions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hazardPose } from '../dist/play/js/hazard-animation.js';

test('both pickups visibly float on their obstacle clock', () => {
  for (const kind of ['coffee', 'shield']) {
    assert.equal(hazardPose(kind, 0).bob, 0);
    assert.ok(hazardPose(kind, Math.PI / 8).bob >= 5);
    assert.ok(hazardPose(kind, Math.PI * 3 / 8).bob <= -5);
  }
});

test('fan, plane and disk use animated strips without static render fallbacks', async () => {
  const game = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  for (const kind of ['fan', 'paper', 'cone', 'crate']) {
    const frames = new Set(Array.from({ length: 100 }, (_, i) => hazardPose(kind, i / 100).frame));
    assert.equal(frames.size, 4, kind);
    assert.equal(hazardPose(kind, 0).sheet, kind);
    const strip = await readFile(new URL(`../dist/assets/game/sprites/hazards/${kind}.webp`, import.meta.url));
    assert.equal(imageDimensions(strip)[0] % 4, 0);
    assert.doesNotMatch(game, new RegExp(`${kind}: \\{ image:`));
    assert.deepEqual(hazardPose(kind, .25), hazardPose(kind, .25));
  }
});

test('the plane strip belongs to cone, not paper or calendar', async () => {
  const game = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const strip = await readFile(new URL('../dist/assets/game/sprites/hazards/cone.webp', import.meta.url));
  assert.deepEqual(imageDimensions(strip), [1448, 362]);
  assert.equal(hazardPose('cone', .2).sheet, 'cone');
  assert.equal(hazardPose('calendar', .2).sheet, null);
  assert.equal(hazardPose('calendar', .2).bob, 0);
  assert.equal(hazardPose('calendar', .2).tilt, 0);
  assert.equal(hazardPose('paper', .2).sheet, 'paper');
  assert.notEqual(hazardPose('cone', 0).frame, hazardPose('cone', .2).frame);
});

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
  for (const file of ['bear', 'polar-bear', 'orca', 'tiger', 'crane']) {
    const png = await readFile(new URL(`../dist/assets/game/sprites/hazards/${file}.webp`, import.meta.url));
    imageDimensions(png);
  }
});

test('coffee steam and the exposed cable each have four timed poses', async () => {
  for (const kind of ['coffee', 'camera']) {
    const frames = new Set();
    for (let time = 0; time < 1; time += .03) frames.add(hazardPose(kind, time).frame);
    assert.deepEqual([...frames].sort(), [0, 1, 2, 3], kind);
    const name = hazardPose(kind, 0).sheet === 'coffee' ? 'coffee' : 'exposed-cable';
    const png = await readFile(new URL(`../dist/assets/game/sprites/${kind === 'coffee' ? 'perks' : 'hazards'}/${name}.webp`, import.meta.url));
    imageDimensions(png);
    assert.equal(imageDimensions(png)[0] % 4, 0);
  }
});

test('each animal selects its own single-row four-frame strip', async () => {
  const animals = [
    ['bear', 'bear', [1774, 443]],
    ['polarBear', 'polar-bear', [1774, 444]],
    ['orca', 'orca', [1448, 362]],
    ['tiger', 'tiger', [1448, 362]],
    ['crane', 'crane', [1448, 362]]
  ];
  for (const [kind, sheet, dimensions] of animals) {
    const pose = hazardPose(kind, .2);
    assert.equal(pose.sheet, sheet);
    assert.equal(pose.row, 0);
    assert.deepEqual(imageDimensions(await readFile(new URL(
      `../dist/assets/game/sprites/hazards/${sheet}.webp`, import.meta.url))), dimensions);
  }
});
