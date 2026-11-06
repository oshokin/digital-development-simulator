import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const dist = new URL('../dist/', import.meta.url);
const text = path => readFile(new URL(path, dist), 'utf8');

async function runtimeGraph(entry, visited = new Set()) {
  if (visited.has(entry)) return [];
  visited.add(entry);
  const source = await text(entry);
  const sources = [{ entry, source }];
  const dependencies = [
    ...source.matchAll(/(?:src|href)=["']\/((?:site|play|shared)\/(?:js|css)\/[^"'?]+)(?:\?[^"']*)?["']/g),
    ...source.matchAll(/@import\s+url\(["']\/([^"']+)["']\)/g),
    ...source.matchAll(/(?:import|export)\s+(?:[^;]*?\s+from\s+)?["'](\.[^"']+)["']/g)
  ];
  for (const [, dependency] of dependencies) {
    const path = dependency.startsWith('.') ? new URL(dependency, new URL(entry, dist)).pathname.slice(dist.pathname.length) : dependency;
    sources.push(...await runtimeGraph(path, visited));
  }
  return sources;
}

for (const [owner, entry] of [['site', 'index.html'], ['game', 'play/index.html']]) {
  test(`${owner} code graph only uses owned or explicitly shared modules`, async () => {
    const prefix = owner === 'game' ? 'play/' : 'site/';
    const graph = await runtimeGraph(entry);
    assert.ok(graph.some(({ entry }) => entry === `${prefix}js/${owner === 'game' ? 'game' : 'site'}.js`));
    assert.ok(graph.some(({ entry }) => entry === 'shared/js/preferences.js'));
    assert.ok(graph.some(({ entry }) => entry === 'shared/css/tokens.css'));
    for (const { entry: path, source } of graph) {
      assert.ok(path === entry || path.startsWith(prefix) || path.startsWith('shared/'), path);
      assert.doesNotMatch(source, /(?:src|href)=["']\/(?:js|css)\//);
      if (path.startsWith('shared/')) {
        assert.doesNotMatch(source, /(?:\/|\.\.\/)(?:site|play)\//);
      }
    }
  });
  test(`${owner} runtime graph only uses owned or explicitly shared assets`, async () => {
    for (const { entry: path, source } of await runtimeGraph(entry)) {
      for (const [, asset] of source.matchAll(/\/assets\/([^"'`\s<>)}]+)/g)) {
        assert.ok(asset.startsWith(`${owner}/`) || asset === 'shared/favicon.svg', `${path}: /assets/${asset}`);
      }
    }
  });
}

test('code directories have explicit ownership', async () => {
  const directories = await readdir(dist);
  assert.ok(!directories.includes('js') && !directories.includes('css'));
  assert.deepEqual((await readdir(new URL('shared/js/', dist))).sort(), ['preferences.js', 'year.js']);
  assert.deepEqual(await readdir(new URL('shared/css/', dist)), ['tokens.css']);
  assert.deepEqual(await readdir(new URL('site/js/', dist)), ['site.js']);
  assert.deepEqual(await readdir(new URL('site/css/', dist)), ['site.css']);
});

test('assets have explicit ownership and site preview is an independent unchanged copy', async () => {
  assert.deepEqual((await readdir(new URL('assets/', dist))).sort(), ['game', 'shared', 'site']);
  assert.deepEqual((await readdir(new URL('assets/shared/', dist))).sort(), ['favicon.svg']);
  const preview = await readFile(new URL('assets/site/images/digital-development-simulator-preview.webp', dist));
  const frame = await readFile(new URL('assets/game/sprites/character/max-run-2.webp', dist));
  assert.deepEqual(preview, frame);
});

test('offline build deliberately bundles both owners without changing runtime ownership', async () => {
  const builder = await readFile(new URL('../scripts/build-offline.mjs', import.meta.url), 'utf8');
  assert.match(builder, /const assetsRoot = join\(dist, 'assets'\)/);
  assert.match(builder, /const __DDS_ASSETS__=/);
  assert.match(builder, /assets\/site\/images\/digital-development-simulator-preview\.webp/);
  assert.doesNotMatch(builder, /assets\/(?:audio|backgrounds|sprites|images|favicon\.svg)/);
});
