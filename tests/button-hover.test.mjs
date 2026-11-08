import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('button hover feedback does not move or resize the pointer target', async () => {
  for (const [file, selector] of [
    ['site/css/site.css', '.button:hover'],
    ['play/css/game.css', '.overlay-actions button:hover']
  ]) {
    const css = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
    const declarations = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .filter(([, selectors]) => selectors.split(',').some(value => value.trim() === selector))
      .map(([, , body]) => body);
    assert.ok(declarations.length, `${selector}: hover feedback exists`);
    for (const body of declarations) {
      assert.match(body, /box-shadow\s*:/);
      assert.doesNotMatch(body, /(?:^|;)\s*(?:transform|translate|scale|rotate|position|inset(?:-[\w]+)?|top|right|bottom|left|margin(?:-[\w]+)?|padding(?:-[\w]+)?|width|height|border-width)\s*:/);
    }
  }
});
