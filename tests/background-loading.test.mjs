import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createBackgroundLoader } from '../dist/js/background-loader.js';

test('backgrounds load on demand only for selected language and reuse visited images', () => {
  const requests = [];
  const load = createBackgroundLoader(
    () => ({ set src(value) { requests.push(value); } }),
    (name, language) => `/assets/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`
  );
  assert.deepEqual(requests, []);
  const english = load('scene-paperwork', 'en');
  assert.equal(load('scene-paperwork', 'en'), english);
  assert.deepEqual(requests, ['/assets/backgrounds/scene-paperwork-en.webp']);
  const russian = load('scene-paperwork', 'ru');
  assert.notEqual(russian, english);
  load('scene-cloud', 'ru');
  assert.equal(load('scene-paperwork', 'en'), english);
  assert.deepEqual(requests, [
    '/assets/backgrounds/scene-paperwork-en.webp',
    '/assets/backgrounds/scene-paperwork.webp',
    '/assets/backgrounds/scene-cloud.webp'
  ]);
  assert.ok(requests.every(url => !url.endsWith('-es.webp')));
});

test('failed localized backgrounds retry with backoff while switching languages preserves successful images', () => {
  let clock = 0;
  const requests = [];
  const load = createBackgroundLoader(
    () => ({ set src(url) { this.url = url; requests.push(url); } }),
    (name, language) => `/assets/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`,
    { now: () => clock }
  );
  const english = load('scene-paperwork', 'en');
  english.onload();
  for (const language of ['ru', 'es']) {
    const failed = load('scene-paperwork', language);
    failed.onerror();
    for (let frame = 0; frame < 120; frame++) assert.equal(load('scene-paperwork', language), failed);
    assert.equal(load('scene-paperwork', 'en'), english);
    clock += 1000;
    const retry = load('scene-paperwork', language);
    assert.notEqual(retry, failed);
    assert.match(retry.url, /\.webp\?background-retry=1$/);
    retry.onerror();
    clock += 1999;
    assert.equal(load('scene-paperwork', language), retry);
    clock++;
    const recovered = load('scene-paperwork', language);
    recovered.onload();
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
  const retry = load('scene-paperwork', 'es');
  assert.notEqual(retry, failed);
  assert.equal(retry.url, url);
});

test('actual game resolver uses existing localized WebP assets and cache-busts changed modules', async () => {
  const game = await readFile(new URL('../dist/js/game.js', import.meta.url), 'utf8');
  const html = await readFile(new URL('../dist/play/index.html', import.meta.url), 'utf8');
  const resolver = game.match(/\(name, language\) => (`\/assets\/backgrounds\/[^\n]+`)/);
  assert.ok(resolver, 'test must exercise the actual game URL expression');
  const urlFor = new Function('name', 'language', `return ${resolver[1]}`);
  for (const name of ['scene-paperwork', 'scene-infrastructure', 'scene-cloud', 'scene-whitelist', 'scene-rkn9000', 'scene-endless']) {
    for (const language of ['ru', 'en', 'es']) {
      const url = urlFor(name, language);
      assert.equal(url, `/assets/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.webp`);
      await access(new URL(`../dist${url}`, import.meta.url));
    }
  }
  assert.match(html, /src="\/js\/game\.js\?v=webp-retry-1"/);
  assert.match(game, /from '\.\/background-loader\.js\?v=webp-retry-1'/);
});
