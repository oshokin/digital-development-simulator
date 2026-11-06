import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const base = new URL(process.argv[2] ?? 'http://127.0.0.1:8088/');
const root = resolve(import.meta.dirname, '../dist');
const mime = {
  '.html': 'text/html', '.js': /^(?:application|text)\/javascript/,
  '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/x-m4a',
};
async function request(path, status = 200) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', path);
  assert.equal(response.headers.get('x-frame-options'), 'DENY', path);
  assert.match(response.headers.get('content-security-policy') ?? '', /default-src 'self'/, path);
  return response;
}
let files = 0;
async function walk(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) { await walk(resolve(directory, entry.name), path); continue; }
    const response = await request(path);
    const expected = await readFile(resolve(directory, entry.name));
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, path);
    const expectedMime = mime[extname(path)];
    if (typeof expectedMime === 'string') {
      assert.equal(response.headers.get('content-type')?.split(';')[0], expectedMime, path);
    } else if (expectedMime) {
      assert.match(response.headers.get('content-type') ?? '', expectedMime, path);
    }
    if (extname(path) !== '.html') {
      assert.match(response.headers.get('cache-control') ?? '', /max-age=604800/, path);
    }
    files++;
  }
}
await walk(root);
for (const path of ['/', '/play/']) {
  const response = await request(path);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  await response.arrayBuffer();
}
const redirect = await request('/play', 301);
assert.equal(new URL(redirect.headers.get('location'), base).pathname, '/play/');
for (const path of ['/assets/missing.webp', '/assets/missing.unknown', '/site/missing',
  '/shared/missing', '/play/js/missing.js', '/play/css/missing.css', '/missing.mp3']) {
  await (await request(path, 404)).arrayBuffer();
}
for (const path of ['/.env', '/.git/config', '/assets/.secret.js', '/play/.env']) {
  await (await request(path, 403)).arrayBuffer();
}
const audio = await fetch(new URL('/assets/game/audio/background-music.m4a', base),
  { headers: { Range: 'bytes=0-31' } });
assert.equal(audio.status, 206);
assert.equal((await audio.arrayBuffer()).byteLength, 32);
console.log(`HTTP verified ${files} files byte-for-byte, MIME/cache/security headers, both pages, redirect, missing/hidden files and audio range requests at ${base}`);
