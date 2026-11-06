import { build } from 'esbuild';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const outputDir = join(root, 'release');
const outputFile = join(outputDir, 'digital-development-simulator-offline.html');

const mimeTypes = {
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

async function assetMap() {
  const assetsRoot = join(dist, 'assets');
  const result = {};
  for (const path of await filesUnder(assetsRoot)) {
    const extension = extname(path).toLowerCase();
    const mime = mimeTypes[extension];
    if (!mime) continue;
    const url = '/' + path.slice(dist.length + 1).split('\\').join('/');
    const contents = await readFile(path);
    result[url] = `data:${mime};base64,${contents.toString('base64')}`;
  }
  return result;
}

const assets = await assetMap();
const substitutions = new Map([
  [
    join(dist, 'play/js/game.js'),
    [
      ['`/assets/game/sprites/${category}/${name}.webp`', 'assetUrl(`/assets/game/sprites/${category}/${name}.webp`)'],
      ['`/assets/game/sprites/${category}/${filename}.webp`', 'assetUrl(`/assets/game/sprites/${category}/${filename}.webp`)'],
      ['`/assets/game/backgrounds/${name}${language === \'ru\' ? \'\' : `-${language}`}.webp`', 'assetUrl(`/assets/game/backgrounds/${name}${language === \'ru\' ? \'\' : `-${language}`}.webp`)']
    ]
  ],
  [
    join(dist, 'play/js/game-audio.js'),
    [
      ["'/assets/game/audio/background-music.m4a'", "assetUrl('/assets/game/audio/background-music.m4a')"],
      ['`/assets/game/audio/${effectFiles[name]}.mp3`', 'assetUrl(`/assets/game/audio/${effectFiles[name]}.mp3`)']
    ]
  ]
]);

const offlinePlugin = {
  name: 'offline-assets',
  setup(esbuild) {
    esbuild.onLoad({ filter: /\.js$/ }, async ({ path }) => {
      if (!substitutions.has(path)) return;
      let contents = await readFile(path, 'utf8');
      for (const [from, to] of substitutions.get(path)) {
        const generatedFrom = from.replaceAll("'", '"');
        const generatedTo = to.replaceAll("'", '"');
        if (!contents.includes(generatedFrom)) throw new Error(`Offline substitution not found in ${path}: ${generatedFrom}`);
        contents = contents.replaceAll(generatedFrom, generatedTo);
      }
      return { contents, loader: 'js' };
    });
  }
};

const gameBundle = await build({
  entryPoints: [join(dist, 'play/js/game.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  plugins: [offlinePlugin]
});

let tokens = await readFile(join(dist, 'shared/css/tokens.css'), 'utf8');
let gameCss = await readFile(join(dist, 'play/css/game.css'), 'utf8');
gameCss = gameCss.replace("@import url('/shared/css/tokens.css');", tokens);

let gameHtml = await readFile(join(dist, 'play/index.html'), 'utf8');
gameHtml = gameHtml
  .replace('<link rel="icon" type="image/svg+xml" href="/assets/shared/favicon.svg"><link rel="stylesheet" href="/play/css/game.css">', `<style>${gameCss}</style>`)
  .replaceAll('src="/assets/game/sprites/perks/shield-legend.webp"', `src="${assets['/assets/game/sprites/perks/shield-legend.webp']}"`)
  .replaceAll('src="/assets/game/sprites/perks/coffee-legend.webp"', `src="${assets['/assets/game/sprites/perks/coffee-legend.webp']}"`)
  .replaceAll('href="/"', 'href="#"')
  .replace(
    /<script type="module" src="\/play\/js\/game\.js(?:\?[^"]*)?"><\/script>/,
    `<script>
{
const __DDS_ASSETS__=${JSON.stringify(assets)};
function assetUrl(path){return __DDS_ASSETS__[path]||path}
const localStorage=(()=>{try{const storage=globalThis.localStorage;storage.getItem('__dds_test__');return storage}catch{return{getItem(){return null},setItem(){},removeItem(){}}}})();
${gameBundle.outputFiles[0].text}
document.querySelectorAll('.back, footer a').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();location.reload()}));
}
</script>`
  );

if (/(?:src|href)=["']\/(?:assets|site|shared|play)\//.test(gameHtml)) {
  throw new Error('Absolute HTML resource URLs remain in offline game');
}

const siteBundle = await build({
  entryPoints: [join(dist, 'site/js/site.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false
});
let siteCss = await readFile(join(dist, 'site/css/site.css'), 'utf8');
siteCss = siteCss.replace("@import url('/shared/css/tokens.css');", tokens);
const yearScript = await readFile(join(dist, 'shared/js/year.js'), 'utf8');
const serializedGame = JSON.stringify(gameHtml).replaceAll('</script', '<\\/script');

let html = await readFile(join(dist, 'index.html'), 'utf8');
html = html
  .replace('<link rel="icon" type="image/svg+xml" href="/assets/shared/favicon.svg">', '')
  .replace('<link rel="stylesheet" href="/site/css/site.css">', `<style>${siteCss}</style>`)
  .replace('src="/assets/site/images/oleg-shokin.webp"', `src="${assets['/assets/site/images/oleg-shokin.webp']}"`)
  .replace('src="/assets/site/images/digital-development-simulator-preview.webp"', `src="${assets['/assets/site/images/digital-development-simulator-preview.webp']}"`)
  .replace('href="/play/"', 'href="#play" id="offline-play"')
  .replace(
    '<script type="module" src="/site/js/site.js"></script>',
    `<script>
{
const localStorage=(()=>{try{const storage=globalThis.localStorage;storage.getItem('__dds_test__');return storage}catch{return{getItem(){return null},setItem(){},removeItem(){}}}})();
${siteBundle.outputFiles[0].text}
const offlineGameHtml=${serializedGame};
document.getElementById('offline-play').addEventListener('click',event=>{event.preventDefault();document.open();document.write(offlineGameHtml);document.close()});
}
</script>`
  )
  .replace('<script src="/shared/js/year.js" defer></script>', `<script>${yearScript}</script>`);

if (/(?:src|href)=["']\/(?:assets|site|shared|play)\//.test(html)) {
  throw new Error('Absolute HTML resource URLs remain in offline site');
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, html);
console.log(`Built ${outputFile} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB)`);
