import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createBackgroundLoader, createSceneGate } from '../dist/play/js/background-loader.js';

test('backgrounds load on demand only for selected language and reuse visited images', () => {
  const requests = [];
  const load = createBackgroundLoader(
    () => ({ set src(value) { requests.push(value); } }),
    (name, language) => `/assets/game/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`
  );
  assert.deepEqual(requests, []);
  const english = load('scene-paperwork', 'en');
  assert.equal(load('scene-paperwork', 'en'), english);
  assert.deepEqual(requests, ['/assets/game/backgrounds/scene-paperwork-en.webp']);
  const russian = load('scene-paperwork', 'ru');
  assert.notEqual(russian, english);
  load('scene-cloud', 'ru');
  assert.equal(load('scene-paperwork', 'en'), english);
  assert.deepEqual(requests, [
    '/assets/game/backgrounds/scene-paperwork-en.webp',
    '/assets/game/backgrounds/scene-paperwork.webp',
    '/assets/game/backgrounds/scene-cloud.webp'
  ]);
  assert.ok(requests.every(url => !url.endsWith('-es.webp')));
});

test('failed localized backgrounds retry explicitly while switching languages preserves successful images', () => {
  let clock = 0;
  const requests = [];
  const load = createBackgroundLoader(
    () => ({ set src(url) { this.url = url; requests.push(url); } }),
    (name, language) => `/assets/game/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`,
    { now: () => clock }
  );
  const english = load('scene-paperwork', 'en');
  english.image.naturalWidth = english.image.naturalHeight = 10;
  english.image.onload();
  for (const language of ['ru', 'es']) {
    const failed = load('scene-paperwork', language);
    failed.image.onerror();
    for (let frame = 0; frame < 120; frame++) assert.equal(load('scene-paperwork', language), failed);
    assert.equal(load('scene-paperwork', 'en'), english);
    clock += 1000;
    const retry = load('scene-paperwork', language, true);
    assert.notEqual(retry, failed);
    assert.match(retry.image.url, /\.webp\?background-retry=1$/);
    retry.image.onerror();
    clock += 1999;
    assert.equal(load('scene-paperwork', language), retry);
    clock++;
    const recovered = load('scene-paperwork', language, true);
    recovered.image.naturalWidth = recovered.image.naturalHeight = 10;
    recovered.image.onload();
    clock += 60000;
    assert.equal(load('scene-paperwork', language), recovered);
  }
  assert.equal(requests.length, 7);
});

test('offline data URLs remain intact when retrying synchronous errors', () => {
  let clock = 0;
  const url = 'data:image/webp;base64,UklGRg==';
  const load = createBackgroundLoader(
    () => ({ set src(value) { this.url = value; this.onerror(); } }),
    () => url,
    { now: () => clock }
  );
  const failed = load('scene-paperwork', 'es');
  clock = 1000;
  const retry = load('scene-paperwork', 'es', true);
  assert.notEqual(retry, failed);
  assert.equal(retry.image.url, url);
});

test('actual game resolver uses existing localized WebP assets and cache-busts changed modules', async () => {
  const game = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../dist/play/index.html', import.meta.url), 'utf8');
  const resolver = game.match(/\(name, language\) =>\s*(`\/assets\/game\/backgrounds\/[^\n]+`)/);
  assert.ok(resolver, 'test must exercise the actual game URL expression');
  const urlFor = new Function('name', 'language', `return ${resolver[1]}`);
  for (const name of ['scene-paperwork', 'scene-infrastructure', 'scene-cloud', 'scene-whitelist', 'scene-rkn9000', 'scene-endless']) {
    for (const language of ['ru', 'en', 'es']) {
      const url = urlFor(name, language);
      assert.equal(url, `/assets/game/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`);
      await access(new URL(`../dist${url}`, import.meta.url));
    }
  }
  assert.match(html, /src="\/play\/js\/game\.js\?v=decoded-scenes-2"/);
  assert.match(game, /from "\.\/background-loader\.js\?v=decoded-scenes-2"/);
});

test('scene gate waits for decode, latest language wins, failures require explicit retry', async () => {
  const images = [];
  const load = createBackgroundLoader(() => {
    let resolve, reject;
    const decoded = new Promise((yes, no) => { resolve = yes; reject = no; });
    const image = { naturalWidth: 100, naturalHeight: 100, decode: () => decoded, resolve, reject };
    images.push(image);
    return image;
  }, (name, language) => `${name}-${language}`);
  let displayed = null;
  const gate = createSceneGate(load, value => { if (!value.pending) displayed = value.current.language; });
  const en = gate.request('first', 'en');
  images[0].onload();
  assert.equal(gate.current, null);
  assert.equal(gate.pending, true);
  images[0].resolve();
  await en;
  assert.equal(displayed, 'en');
  const ru = gate.request('first', 'ru');
  const es = gate.request('first', 'es');
  images[1].onload(); images[2].onload();
  images[2].resolve(); await es;
  images[1].resolve(); await ru;
  assert.equal(displayed, 'es');
  await gate.request('first', 'en');
  assert.equal(displayed, 'en');
  const next = gate.request('next', 'en');
  images[3].onload(); images[3].reject(new Error('decode'));
  await next;
  assert.equal(gate.pending, true);
  assert.equal(gate.failed, true);
  assert.equal(displayed, 'en');
  await gate.request('next', 'en');
  assert.equal(images.length, 4);
  const retry = gate.retry();
  images[4].onload(); images[4].resolve(); await retry;
  assert.equal(gate.pending, false);
  assert.equal(gate.current.name, 'next');
});

test('cached complete images are decoded even without a load event', async () => {
  let decoded = false;
  const load = createBackgroundLoader(() => ({
    complete: true, naturalWidth: 10, naturalHeight: 10,
    decode: async () => { decoded = true; }
  }), () => 'data:image/webp;base64,test');
  await load('first', 'es').ready;
  assert.equal(decoded, true);
});

test('actual game update cannot advance timers, score or motion while a scene is pending', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const updateBody = source.slice(source.indexOf('function update(dt) {'), source.indexOf('\nfunction image('));
  const state = { mode: 'running', elapsed: 5, total: 12, score: 100, ambience: 7, toastTimer: 2, motion: { age: 1 } };
  const before = structuredClone(state);
  const update = new Function('scene', 'state', `${updateBody}; return update;`)({ pending: true }, state);
  for (let frame = 0; frame < 600; frame++) update(.035);
  assert.deepEqual(state, before);
});
