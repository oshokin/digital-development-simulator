import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { hazardPose } from '../dist/play/js/hazard-animation.js';
import { hazardLayouts } from '../dist/play/js/hazard-layout.js';
import { obstacleArtRect, obstacleBox } from '../dist/play/js/game-geometry.js';
import { imageDimensions } from './image-dimensions.mjs';

// Independently measured from decoded RGBA pixels: frame-local alpha >= 16/255
// bounding boxes, with exclusive right/bottom edges. Tiny residual alpha is not
// visible content. If either asset changes, decode and remeasure all four frames
// before updating its hash and bounds; never refresh the hash alone.
const assetFixtures = {
  server: {
    sha256: 'afd5f99a0a52f53aa2b2e1a8daac7a45fba38f436eaf0a535d792012bea479dc',
    dimensions: [2172, 724],
    bounds: [[42, 139, 485, 653], [31, 90, 486, 654], [15, 13, 486, 653], [29, 0, 485, 653]]
  },
  cable: {
    sha256: '5ab2838f70671df793e33b1483272781ef6129b11007937780a3109a9c282a29',
    dimensions: [2172, 724],
    bounds: [[16, 236, 529, 530], [16, 174, 530, 530], [16, 206, 528, 530], [16, 242, 528, 530]]
  }
};

test('server and cable draw complete frames above unchanged ground and collision bounds', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const layout = '';
  const draw = source.slice(source.indexOf('function drawObstacle('), source.indexOf('\nfunction draw()', source.indexOf('function drawObstacle(')));
  for (const [kind, prop, collision] of [
    ['server', { w: 65, h: 74, artBottomInset: 3 }, { x: 109, y: 337, w: 49, h: 67 }],
    ['cable', { w: 84, h: 43, artBottomInset: 9 }, { x: 109, y: 368, w: 68, h: 36 }]
  ]) {
    const asset = await readFile(new URL(`../dist/assets/game/sprites/hazards/${kind}.webp`, import.meta.url));
    const { sha256, dimensions, bounds } = assetFixtures[kind];
    assert.equal(createHash('sha256').update(asset).digest('hex'), sha256,
      `${kind}: asset changed; independently decode and remeasure visible bounds before updating fixture`);
    const [naturalWidth, naturalHeight] = imageDimensions(asset);
    assert.deepEqual([naturalWidth, naturalHeight], dimensions, `${kind}: actual WebP dimensions`);
    const sheet = { complete: true, naturalWidth, naturalHeight };
    const calls = [];
    const ctx = Object.fromEntries(['save', 'restore', 'translate', 'rotate', 'scale'].map(name => [name, () => {}]));
    ctx.drawImage = (...args) => calls.push(args);
    const context = vm.createContext({
      ctx, props: { [kind]: prop }, floor: 400, obstacleArtRect, hazardLayouts,
      hazardPose, reducedMotion: { matches: false }, animationSheets: { [kind]: sheet },
      images: {}, drawHazardEffects() {}, drawItemCue() {}
    });
    vm.runInContext(`${layout}\n${draw}`, context);
    for (let frame = 0; frame < 4; frame++) {
      const item = { kind, x: 100, age: (frame + .1) / (kind === 'server' ? 5 : 7) };
      context.item = item;
      vm.runInContext('drawObstacle(item)', context);
      const [image, sx, sy, sw, sh, dx, dy, dw, dh] = calls.pop();
      const rect = obstacleArtRect(item, prop, 400);
      assert.equal(image, sheet);
      assert.equal(sx, hazardPose(kind, item.age).frame * naturalWidth / 4);
      assert.equal(sx, frame * naturalWidth / 4);
      assert.deepEqual([sy, sw, sh], [0, naturalWidth / 4, naturalHeight]);
      assert.deepEqual([dx, dw], [rect.x, rect.w]);
      const [, contentTop, , contentBottom] = bounds[frame];
      const scaleY = dh / naturalHeight;
      assert.ok(Math.abs(dy + contentBottom * scaleY - (rect.y + rect.h)) < 1e-9,
        `${kind} frame ${frame}: visible feet must meet art ground`);
      assert.ok(dy + contentTop * scaleY >= dy, 'visible smoke/sparks remain inside full source');
      assert.ok(contentTop >= sy && contentBottom <= sy + sh, 'no visible content cropped');
      assert.equal(dh, naturalHeight * rect.h / (kind === 'server' ? 560 : 350));
      assert.ok(dy < rect.y, 'smoke and sparks extend upward, not underground');
      for (const [width, height, playerX] of [[640, 650, 80], [960, 540, 150]]) {
        // At the runner, the complete authored frame fits both logical viewports.
        const viewportFloor = height - 98;
        const viewportRect = obstacleArtRect({ kind, x: playerX }, prop, viewportFloor);
        const fullHeight = naturalHeight * viewportRect.h / (kind === 'server' ? 560 : 350);
        const frameTop = viewportRect.y + viewportRect.h - contentBottom * scaleY;
        assert.ok(frameTop >= 0, `${kind}: full smoke/sparks frame above viewport`);
        assert.ok(frameTop + fullHeight <= height, `${kind}: complete frame fits viewport`);
        assert.ok(Math.abs(frameTop + contentBottom * scaleY - (viewportRect.y + viewportRect.h)) < 1e-9);
        assert.ok(viewportRect.x >= 0 && viewportRect.x + viewportRect.w <= width);
      }
      assert.deepEqual(obstacleBox(item, prop, 400), collision);
    }
  }
});
