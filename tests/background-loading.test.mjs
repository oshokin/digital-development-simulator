import test from 'node:test';
import assert from 'node:assert/strict';
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
