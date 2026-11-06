import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';

test('shipped assets match dynamic runtime families, without generator inputs', async () => {
  const expected = [
    'shared/favicon.svg', 'site/images/oleg-shokin.webp', 'site/images/digital-development-simulator-preview.webp',
    ...['background-music.m4a', ...['player-jump', 'player-duck', 'player-death', 'player-hit', 'shield-pickup', 'shield-break', 'coffee-pickup'].map(n => `${n}.mp3`)].map(n => `audio/${n}`),
    ...['cybercity-night', ...['paperwork', 'infrastructure', 'cloud', 'whitelist', 'rkn9000', 'endless'].flatMap(n => ['', '-en', '-es'].map(l => `scene-${n}${l}`))].map(n => `backgrounds/${n}.webp`),
    ...['stamp', 'lock', 'drone', 'gate', 'archive', 'slowdown', 'sovereign', 'glider', 'bear', 'polar-bear', 'orca', 'tiger', 'crane', ...['hourglass', 'permit', 'server', 'cable', 'exposed-cable', 'barrier', 'cone', 'paper', 'fan', 'crate']].map(n => `sprites/hazards/${n}.webp`),
    ...['max-duck', 'max-hit', 'max-defeat', ...Array.from({ length: 6 }, (_, n) => `max-run-${n}`), 'max-jump-takeoff', 'max-jump-air', 'max-jump-land'].map(n => `sprites/character/${n}.webp`),
    ...['calendar'].map(n => `sprites/hazards/${n}.webp`),
    ...['coffee', 'shield', 'coffee-legend', 'shield-legend'].map(n => `sprites/perks/${n}.webp`)
  ];
  const root = new URL('../dist/assets/', import.meta.url);
  const actual = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      for (const name of await readdir(new URL(`${entry.name}/`, root), { recursive: true, withFileTypes: true })) {
        if (name.isFile()) {
          const parent = name.parentPath ?? name.path;
          actual.push(`${parent.slice(new URL(root).pathname.length).replace(/\/$/, '')}/${name.name}`.replace(/^\//, ''));
        }
      }
    } else actual.push(entry.name);
  }
  assert.deepEqual(actual.sort(), expected.map(path => /^(audio|backgrounds|sprites)\//.test(path) ? `game/${path}` : path).sort());
});
