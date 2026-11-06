import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../Taskfile.yml', import.meta.url), 'utf8');
const tasks = Object.fromEntries(
  [...source.matchAll(/^  ([\w:]+):\n([\s\S]*?)(?=^  [\w:]+:\n|$(?![\s\S]))/gm)]
    .map(([, name, body]) => [name, body]),
);
const calls = name => [...tasks[name].matchAll(/- task: ([\w:]+)/g)].map(match => match[1]);

test('public commands omit redundant wrappers and internal validation tasks', () => {
  assert.equal(tasks.install, undefined);
  assert.equal(tasks.lint, undefined);
  for (const name of ['deps', 'validate', 'test:unit', 'format:check']) {
    assert.match(tasks[name], /^    internal: true$/m);
  }
});

test('task validation and packaging compile once, sequentially', () => {
  assert.doesNotMatch(source, /^    deps:/m);
  assert.deepEqual(calls('build'), ['deps']);
  assert.match(tasks.build, /- npm run build$/m);
  assert.deepEqual(calls('check'), ['build', 'format:check', 'validate', 'test:unit']);
  assert.deepEqual(calls('package'), ['check']);
  assert.match(tasks.package, /tar -czf release\/site\.tar\.gz -C dist \./);
  assert.deepEqual(calls('standalone'), ['check']);
  assert.match(tasks.standalone, /node scripts\/build-offline\.mjs/);
  assert.doesNotMatch(tasks.standalone, /npm run build:offline/);
  assert.match(tasks['test:unit'], /npm run test:unit/);
  assert.doesNotMatch(tasks['test:unit'], /npm (?:test|run build)/);
});

test('direct npm entry points retain dependency readiness and nginx uses actual port', () => {
  for (const name of ['dev', 'test', 'build', 'test:unit', 'format', 'format:check']) {
    assert.deepEqual(calls(name), ['deps'], name);
  }
  assert.match(tasks.deps, /npm ci --include=dev/);
  assert.match(tasks.deps, /node_modules\/prettier\/bin\/prettier\.cjs/);
  assert.match(tasks.format, /npm run format/);
  assert.match(tasks['format:check'], /prettier --check src/);
  assert.deepEqual(calls('nginx:up'), ['build']);
  assert.match(tasks['nginx:up'], /up -d --wait/);
  assert.match(tasks['nginx:check'], /exec -T nginx nginx -t/);
  assert.match(tasks['nginx:check'], /check-http\.mjs "http:\/\/127\.0\.0\.1:\$\{DDS_PORT:-8088\}\/"/);
  for (const name of ['nginx:up', 'nginx:check', 'nginx:logs', 'nginx:down']) {
    assert.match(tasks[name], /docker compose -f deploy\/compose\.local\.yml/);
  }
});
