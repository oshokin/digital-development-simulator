import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { hazardPose } from '../dist/play/js/hazard-animation.js';
import { hazardLayouts } from '../dist/play/js/hazard-layout.js';
import { obstacleArtRect, obstacleBox } from '../dist/play/js/game-geometry.js';
import { imageDimensions } from './image-dimensions.mjs';

test('gate WebP contains four distinct lossless RGBA frames with identical alpha anchors', async () => {
  const asset = new URL('../dist/assets/game/sprites/hazards/gate.webp', import.meta.url);
  const bytes = await readFile(asset);
  assert.deepEqual(imageDimensions(bytes), [1728, 405]);
  assert.equal(bytes.subarray(12, 16).toString(), 'VP8L');
  const fixture = JSON.parse(await readFile(new URL('./hazard-assets.json', import.meta.url))).gate;
  // Independently decoded RGBA measurements are pinned to the complete asset,
  // like the hazard alpha fixtures; CI needs only Node, not a WebP decoder.
  assert.equal(createHash('sha256').update(bytes).digest('hex'), fixture.sha256);
  assert.equal(fixture.sha256, 'f969a74e9e278f40af53376e040fc9b0e43202a1795759ff0011056cd96b32fb');
  assert.deepEqual(fixture.framePixelHashes, [
    '2daff8c4de124428affbff82627237f0d1a2af807d6637959d222ae3737db0c0',
    '1b74f577284a6d2b08a77f1650816a1f07bc2cd7f22ed705d9a4206689834ac7',
    'ca0edc6e783a55fd5a0b15286b828a443e4390f3414a4ea6221ac8ffde511617',
    'eed2699f7107636dee743ef798bfbf1910573322ab911d7727910b4af3962e24',
  ]);
  assert.equal(new Set(fixture.framePixelHashes).size, 4);
  assert.deepEqual(hazardLayouts.gate.ground, [405, 405, 405, 405]);
});

test('gate uses normal age-driven sheet rendering without changing scale or collisions', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  assert.match(source, /\["gate", "gate"\]/);
  const draw = source.slice(source.indexOf('function drawObstacle('), source.indexOf('\nfunction draw()', source.indexOf('function drawObstacle(')));
  const sheet = { complete: true, naturalWidth: 1728, naturalHeight: 405 };
  const prop = { w: 82, h: 69 };
  const calls = [];
  const ctx = Object.fromEntries(['save', 'restore', 'translate', 'rotate', 'scale'].map(name => [name, () => {}]));
  ctx.drawImage = (...args) => calls.push(args);
  const reducedMotion = { matches: false };
  const context = vm.createContext({ ctx, props: { gate: prop }, floor: 400, obstacleArtRect, hazardLayouts, hazardPose, reducedMotion, animationSheets: { gate: sheet }, images: {}, drawHazardEffects() {}, drawItemCue() {} });
  vm.runInContext(draw, context);
  const collision = obstacleBox({ kind: 'gate', x: 100 }, prop, 400);
  let anchor;
  for (const reduced of [false, true]) {
    reducedMotion.matches = reduced;
    for (let frame = 0; frame < 4; frame++) {
      context.item = { kind: 'gate', x: 100, age: (frame + .1) / 4 };
      vm.runInContext('drawObstacle(item)', context);
      const call = calls.pop();
      assert.deepEqual(call.slice(1, 5), [reduced ? 0 : frame * 432, 0, 432, 405]);
      anchor ??= call.slice(5);
      assert.deepEqual(call.slice(5), anchor, 'shared destination and original single-frame scale');
      assert.deepEqual(obstacleBox(context.item, prop, 400), collision);
      vm.runInContext('drawObstacle(item)', context);
      assert.deepEqual(calls.pop(), call, 'unchanged age freezes the frame');
    }
  }
});
