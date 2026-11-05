import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { hazardEffectState } from '../dist/js/hazard-effects.js';
import { hazardPose } from '../dist/js/hazard-animation.js';

test('all six scenes have independent redrawn image assets in English and Spanish', async () => {
  for (const name of ['paperwork', 'infrastructure', 'cloud', 'whitelist', 'rkn9000', 'endless']) {
    const original = await readFile(new URL(`../dist/assets/backgrounds/scene-${name}.png`, import.meta.url));
    for (const language of ['en', 'es']) {
      const image = await readFile(new URL(`../dist/assets/backgrounds/scene-${name}-${language}.png`, import.meta.url));
      assert.equal(image.subarray(1, 4).toString(), 'PNG');
      assert.ok(image.readUInt32BE(16) >= 1600 && image.readUInt32BE(20) >= 900);
      assert.notDeepEqual(image, original, `${name} ${language}`);
    }
  }
});

test('sand, 404 beacon, smoke and broken cable use four-frame sprite sheets', async () => {
  for (const kind of ['hourglass', 'permit', 'server', 'cable']) {
    const seen = new Set(Array.from({ length: 32 }, (_, i) => hazardPose(kind, i / 32).frame));
    assert.deepEqual([...seen].sort(), [0, 1, 2, 3], kind);
    const sheet = await readFile(new URL(`../dist/assets/hazards/${kind}-motion.png`, import.meta.url));
    assert.equal(sheet.subarray(1, 4).toString(), 'PNG');
    assert.equal(sheet.readUInt32BE(16), 2172);
  }
});

test('effects advance with obstacle age and freeze in reduced motion', () => {
  assert.notEqual(hazardEffectState('hourglass', .2).sand, hazardEffectState('hourglass', .8).sand);
  assert.notEqual(hazardEffectState('barrier', .2).beacon, hazardEffectState('barrier', .8).beacon);
  assert.notEqual(hazardEffectState('slowdown', .2).crawl, hazardEffectState('slowdown', .8).crawl);
  assert.deepEqual(hazardEffectState('cable', .2, true), hazardEffectState('cable', .8, true));
});
