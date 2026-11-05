import { imageDimensions } from './image-dimensions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { paceFor } from '../dist/js/game-pace.js';
import { STAGES, NEW_HAZARDS, ANIMAL_HAZARDS, WILDLIFE_HAZARDS } from '../dist/js/game-world.js';

test('each run reaches most of its capped pace quickly', () => {
  for (const [index, stage] of STAGES.entries()) {
    const start = paceFor(0, stage.duration, index);
    const ten = paceFor(10, stage.duration, index);
    const late = paceFor(stage.duration, stage.duration, index);
    assert.ok(ten.speed - start.speed > 280);
    assert.ok(late.speed > ten.speed && late.speed - ten.speed < 70);
    assert.ok(late.speed / start.speed > 1.8);
    assert.ok(start.spawnDelay > ten.spawnDelay);
  }
});

test('nine satirical hazards use a shared pixel-art atlas and appear in stage pools', async () => {
  assert.equal(NEW_HAZARDS.length, 9);
  for (const name of NEW_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }
  const art = await readFile(new URL('../dist/assets/hazards/satirical-atlas.webp', import.meta.url));
  imageDimensions(art);
  assert.equal(imageDimensions(art)[0], 1295);
  assert.equal(imageDimensions(art)[1], 1214);
});

test('bear, orca and tiger have their own pixel-art atlas and stage entries', async () => {
  assert.deepEqual(ANIMAL_HAZARDS, ['bear', 'orca', 'tiger']);
  for (const name of ANIMAL_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }
  const art = await readFile(new URL('../dist/assets/hazards/animal-atlas.webp', import.meta.url));
  imageDimensions(art);
  assert.equal(imageDimensions(art)[0], 2172);
  assert.equal(imageDimensions(art)[1], 724);
});

test('polar bear, hang glider and crane have an atlas and campaign entries', async () => {
  assert.deepEqual(WILDLIFE_HAZARDS, ['polarBear', 'glider', 'crane']);
  for (const name of WILDLIFE_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }
  const art = await readFile(new URL('../dist/assets/hazards/wildlife-atlas.webp', import.meta.url));
  imageDimensions(art);
  assert.equal(imageDimensions(art)[0], 2172);
  assert.equal(imageDimensions(art)[1], 724);
});
