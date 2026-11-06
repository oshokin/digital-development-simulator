import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, cp, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

test('build mirrors source modules and removes only stale generated JavaScript', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'dds-build-'));
  try {
    await cp('src', join(temporary, 'src'), { recursive: true });
    await mkdir(join(temporary, 'scripts'));
    await cp('scripts/build.mjs', join(temporary, 'scripts/build.mjs'));
    await symlink(resolve('node_modules'), join(temporary, 'node_modules'));
    await mkdir(join(temporary, 'dist/site/js'), { recursive: true });
    await writeFile(join(temporary, 'dist/site/js/stale.js'), '// Generated from src/ by npm run build. Do not edit.\n');
    await writeFile(join(temporary, 'dist/site/js/manual.js'), '// unrelated file\n');
    await mkdir(join(temporary, 'dist/play/js'), { recursive: true });
    await writeFile(join(temporary, 'dist/play/js/types.js'), '// Generated from src/ by npm run build. Do not edit.\n');
    await writeFile(join(temporary, 'src/shared/js/ambient.d.ts'), 'export interface Ambient { value: string }\n');
    execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: temporary });
    const output = await readdir(join(temporary, 'dist/site/js'));
    assert.ok(!output.includes('stale.js'));
    assert.ok(output.includes('manual.js'));
    for (const owner of ['site', 'play', 'shared']) {
      const sources = await readdir(join(temporary, `src/${owner}/js`));
      for (const source of sources) {
        if (source.endsWith('.d.ts') || (owner === 'play' && source === 'types.ts')) {
          assert.ok(!(await readdir(join(temporary, `dist/${owner}/js`))).includes(source.replace(/\.ts$/, '.js')));
          continue;
        }
        const generated = await readFile(join(temporary, `dist/${owner}/js/${source.replace(/\.ts$/, '.js')}`), 'utf8');
        assert.ok(generated.startsWith('// Generated from src/'));
        assert.doesNotMatch(generated, /(?:from\s*|import\s*\()\s*["']\.\/types\.js["']/);
      }
    }
    const game = await readFile(join(temporary, 'dist/play/js/game.js'), 'utf8');
    assert.match(game, /background-loader\.js\?v=decoded-scenes-2/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
