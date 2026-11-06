import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { drawItemCue } from '../dist/play/js/hazard-effects.js';
import { hazardPose } from '../dist/play/js/hazard-animation.js';

test('both collectible cues stay opaque and outside sprite bounds without loaded art', () => {
  for (const kind of ['coffee', 'shield']) {
    const calls = [];
    const ctx = new Proxy({ globalAlpha: .1 }, {
      get(target, key) { return key in target ? target[key] : (...args) => calls.push([key, ...args]); },
      set(target, key, value) { target[key] = value; calls.push([key, value]); return true; }
    });
    drawItemCue(ctx, kind, { x: 0, y: 0, w: 60, h: 60 });
    assert.ok(calls.some(([key, value]) => key === 'globalAlpha' && value === 1));
    assert.equal(calls.filter(([key]) => key === 'ellipse').length, 2);
    assert.ok(calls.find(([key]) => key === 'ellipse')[3] > 30);
    assert.equal(calls.filter(([key]) => key === 'lineTo').length, 2);
    assert.equal(calls.at(-1)[0], 'restore');
    assert.equal(hazardPose(kind, 0).sheet, kind);
    assert.notEqual(hazardPose(kind, .3).frame, 0);
  }
});

test('collectible cue is rendered after sprite transforms and uses no eligibility state', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  assert.match(source, /ctx\.restore\(\);\s+drawItemCue\(ctx, item\.kind, \{ x, y, w, h \}\)/);
  assert.match(source, /hazardPose\(item\.kind, reducedMotion\.matches \? 0 : item\.age\)/);
  const effects = drawItemCue.toString();
  assert.doesNotMatch(effects, /canCollect|lives|shieldActive|drawImage|age/);
});
