import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const scenes = ['scene-paperwork', 'scene-infrastructure', 'scene-cloud', 'scene-whitelist', 'scene-rkn9000'];

test('five levels use five different full-size scenes from the archive', async () => {
  const code = await readFile(new URL('../dist/js/game.js', import.meta.url), 'utf8');
  const digests = [];
  for (const scene of scenes) {
    assert.ok(code.includes(`'${scene}'`), `stage does not load ${scene}`);
    const bytes = await readFile(new URL(`../dist/assets/backgrounds/${scene}.png`, import.meta.url));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.ok(bytes.length > 100_000);
    digests.push(createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(new Set(digests).size, 5);
});
