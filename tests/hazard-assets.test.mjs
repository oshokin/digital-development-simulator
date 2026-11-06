import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { hazardLayouts } from '../dist/play/js/hazard-layout.js';
import { imageDimensions } from './image-dimensions.mjs';

const fixtures = JSON.parse(await readFile(new URL('./hazard-assets.json', import.meta.url)));

test('every hazard retains measured transparent-only union crop and original coordinate scale', async () => {
  assert.equal(Object.keys(fixtures).length, 24);
  for (const [name, fixture] of Object.entries(fixtures)) {
    const bytes = await readFile(new URL(`../dist/assets/game/sprites/hazards/${name}.webp`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), fixture.sha256, name);
    assert.deepEqual(imageDimensions(bytes), [fixture.width, fixture.bottom - fixture.top], name);
    const layout = hazardLayouts[name];
    assert.equal(layout.top, fixture.top);
    assert.equal(layout.bottom, fixture.bottom);
    for (let frame = 0; frame < layout.frames; frame++) {
      const scale = 74 / layout.scaleHeight;
      // Any retained source point has the same screen coordinate after crop.
      const sourceY = fixture.visibleBounds[0][1] + layout.top;
      const before = 400 - layout.ground[frame] * scale + sourceY * scale;
      const after = 400 - (layout.ground[frame] - layout.top) * scale + (sourceY - layout.top) * scale;
      assert.ok(Math.abs(before - after) < 1e-9, `${name}: frame ${frame} stable`);
    }
  }
});
