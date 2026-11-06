import { build, context } from 'esbuild';
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';

const entryPoints = [];
// Domain contracts have no runtime exports or side effects.
const typeOnlyModules = new Set(['src/play/js/types.ts']);
for (const area of ['play', 'site', 'shared']) {
  for (const name of await readdir(`src/${area}/js`)) {
    const path = `src/${area}/js/${name}`;
    if (name.endsWith('.ts') && !name.endsWith('.d.ts') && !typeOnlyModules.has(path)) entryPoints.push(path);
  }
}
const options = {
  entryPoints,
  outbase: 'src',
  outdir: 'dist',
  format: 'esm',
  target: 'es2022',
  charset: 'utf8',
  minifySyntax: false,
  banner: { js: '// Generated from src/ by npm run build. Do not edit.' },
  plugins: [{
    name: 'generated-output-parity',
    setup(builder) {
      builder.onEnd(async result => {
        if (result.errors.length) return;
        // Both watch and release builds preserve the deployed module cache key.
        const game = 'dist/play/js/game.js';
        await writeFile(game, (await readFile(game, 'utf8')).replace('./background-loader.js"', './background-loader.js?v=decoded-scenes-2"'));
        const expected = new Set(entryPoints.map(path => path.replace(/^src\//, 'dist/').replace(/\.ts$/, '.js')));
        for (const area of ['play', 'site', 'shared']) {
          const directory = `dist/${area}/js`;
          for (const name of await readdir(directory)) {
            const path = `${directory}/${name}`;
            // Never remove manually authored or otherwise unrelated files.
            if (name.endsWith('.js') && !expected.has(path) && (await readFile(path, 'utf8')).startsWith(options.banner.js)) await unlink(path);
          }
        }
      });
    }
  }],
};
if (process.argv.includes('--watch')) {
  const session = await context(options);
  await session.watch();
} else {
  await build(options);
}
