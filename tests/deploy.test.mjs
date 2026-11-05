import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readlinkSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = join(process.cwd(), 'deploy/activate-release.sh');
const ids = ['a'.repeat(40) + '-1-1', 'b'.repeat(40) + '-1-1'];

function run(root, id, ...args) {
  return spawnSync('bash', [script, id, ...args], {
    env: { ...process.env, DDS_RELEASE_ROOT: root }, encoding: 'utf8',
  });
}

function archive(root, id, valid = true) {
  const source = join(root, `source-${id}`);
  mkdirSync(join(source, 'play'), { recursive: true });
  writeFileSync(join(source, 'index.html'), 'home');
  if (valid) writeFileSync(join(source, 'play/index.html'), 'game');
  writeFileSync(join(source, 'deploy-id.txt'), id);
  mkdirSync(join(root, 'incoming'), { recursive: true });
  const result = spawnSync('tar', ['-czf', join(root, 'incoming', `${id}.tar.gz`), '-C', source, '.'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

test('release activation is atomic on invalid content and previous remains restorable', () => {
  const root = mkdtempSync(join(tmpdir(), 'dds-deploy-'));
  try {
    archive(root, ids[0]);
    assert.equal(run(root, ids[0]).status, 0);
    assert.equal(readlinkSync(join(root, 'current')), `releases/${ids[0]}`);
    archive(root, ids[1], false);
    assert.notEqual(run(root, ids[1]).status, 0);
    assert.equal(readlinkSync(join(root, 'current')), `releases/${ids[0]}`);
    archive(root, ids[1]);
    assert.equal(run(root, ids[1]).status, 0);
    assert.equal(readlinkSync(join(root, 'current')), `releases/${ids[1]}`);
    assert.equal(readlinkSync(join(root, 'previous')), `releases/${ids[0]}`);
    assert.equal(run(root, ids[1], '--rollback').status, 0);
    assert.equal(readlinkSync(join(root, 'current')), `releases/${ids[0]}`);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
