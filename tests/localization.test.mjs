import test from 'node:test';
import assert from 'node:assert/strict';

test('portfolio renders each language, unknown keys and missing optional controls safely', async () => {
  const keys = ['hero1', 'gameNote', 'skip', 'unknown'];
  const elements = keys.map(i18n => ({ dataset: { i18n }, textContent: '' }));
  const saved = new Map();
  const listeners = new Map();
  const names = ['document', 'localStorage', 'matchMedia', 'CustomEvent'];
  const originals = names.map(key => Object.getOwnPropertyDescriptor(globalThis, key));
  try {
    globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
    globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
    globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
    globalThis.document = {
      documentElement: { dataset: {} },
      querySelectorAll: selector => selector === '[data-i18n]' ? elements : [],
      getElementById: () => null,
      addEventListener: (type, listener) => listeners.set(type, listener),
      dispatchEvent: event => listeners.get(event.type)?.()
    };
    const { translations, translate } = await import('../dist/site/js/site.js');
    for (const language of ['en', 'ru', 'es']) {
      saved.set('oshokin-lang', language);
      translate();
      for (let i = 0; i < 3; i++) assert.equal(elements[i].textContent, translations[language][keys[i]]);
      assert.equal(elements[3].textContent, '');
      assert.deepEqual(Object.keys(translations[language]).sort(), Object.keys(translations.en).sort());
      assert.ok(Object.values(translations[language]).every(value => typeof value === 'string' && value.length > 0));
    }
    assert.match(document.title, /Oleg Shokin/);
  } finally {
    names.forEach((key, index) => {
      if (originals[index]) Object.defineProperty(globalThis, key, originals[index]);
      else delete globalThis[key];
    });
  }
});
