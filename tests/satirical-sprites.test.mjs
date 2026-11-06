import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { STAGES, NEW_HAZARDS } from '../dist/play/js/game-world.js';
import { hazardPose } from '../dist/play/js/hazard-animation.js';
import { imageDimensions } from './image-dimensions.mjs';
import { hazardLayouts } from '../dist/play/js/hazard-layout.js';

test('all campaign and endless satirical kinds own exactly one sprite source', async () => {
  const directory = new URL('../dist/assets/game/sprites/hazards/', import.meta.url);
  const files = await readdir(directory);
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const endless = new Set(STAGES.flatMap(stage => stage.obstacles));
  assert.deepEqual(NEW_HAZARDS, ['stamp', 'lock', 'drone', 'hourglass', 'gate', 'permit', 'archive', 'slowdown', 'sovereign']);
  assert.ok(!files.includes('satirical-atlas.webp'));
  assert.doesNotMatch(source, /hazardAtlas|satirical-atlas|NEW_HAZARDS/);
  assert.match(source, /if \(!pose\.sheet && images\[item\.kind\]\)/);
  assert.match(source, /Object\.values\(images\), \.\.\.Object\.values\(animationSheets\)/);
  for (const [index, kind] of NEW_HAZARDS.entries()) {
    assert.ok(endless.has(kind), kind);
    const sheet = hazardPose(kind, 0).sheet;
    assert.ok(files.includes(`${kind}.webp`), kind);
    if (sheet) {
      assert.ok(files.includes(`${sheet}.webp`), kind);
    } else {
      assert.ok(source.includes(`"${kind}"`), kind);
      const art = await readFile(new URL(`${kind}.webp`, directory));
      const col = index % 3, row = Math.floor(index / 3);
      assert.deepEqual(imageDimensions(art), [
        Math.floor((col + 1) * 1295 / 3) - Math.floor(col * 1295 / 3),
        hazardLayouts[kind].bottom - hazardLayouts[kind].top
      ]);
    }
  }
});
