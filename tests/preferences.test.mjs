import test from 'node:test';
import assert from 'node:assert/strict';
import { getLanguage, setLanguage, getTheme, setTheme, effectiveTheme } from '../dist/shared/js/preferences.js';

test('preferences validate stored language and theme and dispatch changes', () => {
  const saved = new Map();
  const events = [];
  const originals = Object.fromEntries(['localStorage', 'document', 'CustomEvent', 'matchMedia'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
    globalThis.document = { documentElement: { dataset: {} }, dispatchEvent: event => events.push(event) };
    globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
    globalThis.matchMedia = () => ({ matches: true });
    assert.equal(getLanguage(), 'en');
    assert.equal(getTheme(), 'system');
    assert.equal(effectiveTheme(), 'dark');
    for (const language of ['en', 'ru', 'es']) {
      setLanguage(language);
      assert.equal(getLanguage(), language);
      assert.equal(document.documentElement.lang, language);
    }
    setLanguage('invalid');
    assert.equal(getLanguage(), 'es');
    for (const theme of ['dark', 'light', 'system']) {
      setTheme(theme);
      assert.equal(getTheme(), theme);
      assert.equal(document.documentElement.dataset.themeChoice, theme);
    }
    setTheme('invalid');
    assert.equal(getTheme(), 'system');
    assert.equal(events.filter(event => event.type === 'app:language').length, 3);
    assert.equal(events.filter(event => event.type === 'app:theme').length, 3);
    saved.set('oshokin-lang', 'invalid');
    saved.set('oshokin-theme', 'invalid');
    assert.equal(getLanguage(), 'en');
    assert.equal(getTheme(), 'system');
  } finally {
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
