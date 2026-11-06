import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('CI and packaging verify isolated nginx before archiving', async () => {
  for (const workflow of ['ci', 'deploy']) {
    const source = await read(`.github/workflows/${workflow}.yml`);
    assert.match(source, /uses: \.\/\.github\/actions\/check-http/);
    if (workflow === 'deploy') {
      assert.ok(source.indexOf('uses: ./.github/actions/check-http') < source.indexOf('tar -czf'));
    }
  }
  const action = await read('.github/actions/check-http/action.yml');
  assert.match(action, /up -d --wait --wait-timeout 120/);
  assert.match(action, /exec -T nginx nginx -t/);
  assert.match(action, /node scripts\/check-http\.mjs http:\/\/127\.0\.0\.1:18088\//);
  assert.match(action, /if: failure\(\)/);
  assert.match(action, /logs --no-color/);
  assert.match(action, /if: always\(\)/);
  assert.match(action, /down --remove-orphans/);
  assert.doesNotMatch(await read('deploy/compose.local.yml'), /container_name:/);
});

test('check builds once while standalone tests retain their build', async () => {
  const { scripts } = JSON.parse(await read('package.json'));
  assert.equal(scripts.check, 'npm run build && node scripts/check.mjs && npm run test:unit');
  assert.equal(scripts.test, 'npm run build && npm run test:unit');
  assert.equal(scripts['test:unit'], 'node --test tests/*.test.mjs');
});
