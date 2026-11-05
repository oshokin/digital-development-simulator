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
    join(dist, 'js/game.js'),
    [
      ['`/assets/sprites/${name}.webp`', 'assetUrl(`/assets/sprites/${name}.webp`)'],
      ["'/assets/hazards/satirical-atlas.webp'", "assetUrl('/assets/hazards/satirical-atlas.webp')"],
      ["'/assets/hazards/animal-atlas.webp'", "assetUrl('/assets/hazards/animal-atlas.webp')"],
      ["'/assets/hazards/wildlife-atlas.webp'", "assetUrl('/assets/hazards/wildlife-atlas.webp')"],
      ['`/assets/hazards/${filename}.webp`', 'assetUrl(`/assets/hazards/${filename}.webp`)'],
      ['`/assets/backgrounds/${name}${language === \'ru\' ? \'\' : `-${language}`}.webp`', 'assetUrl(`/assets/backgrounds/${name}${language === \'ru\' ? \'\' : `-${language}`}.webp`)'],
      ["'/assets/backgrounds/cybercity-night.webp'", "assetUrl('/assets/backgrounds/cybercity-night.webp')"]
    ]
  ],
  [
    join(dist, 'js/game-audio.js'),
    [
      ["'/assets/audio/dj-perekryt-bum-bum-bam-bam.m4a'", "assetUrl('/assets/audio/dj-perekryt-bum-bum-bam-bam.m4a')"],
      ['`/assets/audio/${name}.mp3`', 'assetUrl(`/assets/audio/${name}.mp3`)']
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
        if (!contents.includes(from)) throw new Error(`Offline substitution not found in ${path}: ${from}`);
        contents = contents.replaceAll(from, to);
      }
      return { contents, loader: 'js' };
    });
  }
};

const gameBundle = await build({
  entryPoints: [join(dist, 'js/game.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  plugins: [offlinePlugin]
});

let tokens = await readFile(join(dist, 'css/tokens.css'), 'utf8');
let gameCss = await readFile(join(dist, 'css/game.css'), 'utf8');
gameCss = gameCss.replace("@import url('/css/tokens.css');", tokens);

let gameHtml = await readFile(join(dist, 'play/index.html'), 'utf8');
gameHtml = gameHtml
  .replace('<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/css/game.css">', `<style>${gameCss}</style>`)
  .replaceAll('src="/assets/sprites/prop-9.webp"', `src="${assets['/assets/sprites/prop-9.webp']}"`)
  .replaceAll('src="/assets/sprites/prop-10.webp"', `src="${assets['/assets/sprites/prop-10.webp']}"`)
  .replaceAll('href="/"', 'href="#"')
  .replace(
    '<script type="module" src="/js/game.js"></script>',
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

if (/(?:src|href)=["']\/(?:assets|css|js)\//.test(gameHtml)) {
  throw new Error('Absolute HTML resource URLs remain in offline game');
}

const siteBundle = await build({
  entryPoints: [join(dist, 'js/site.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false
});
let siteCss = await readFile(join(dist, 'css/site.css'), 'utf8');
siteCss = siteCss.replace("@import url('/css/tokens.css');", tokens);
const yearScript = await readFile(join(dist, 'js/year.js'), 'utf8');
const serializedGame = JSON.stringify(gameHtml).replaceAll('</script', '<\\/script');

let html = await readFile(join(dist, 'index.html'), 'utf8');
html = html
  .replace('<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">', '')
  .replace('<link rel="stylesheet" href="/css/site.css">', `<style>${siteCss}</style>`)
  .replace('src="/assets/images/oleg-shokin.webp"', `src="${assets['/assets/images/oleg-shokin.webp']}"`)
  .replace('src="/assets/sprites/max-v2-run-2.webp"', `src="${assets['/assets/sprites/max-v2-run-2.webp']}"`)
  .replace('href="/play/"', 'href="#play" id="offline-play"')
  .replace(
    '<script type="module" src="/js/site.js"></script>',
    `<script>
{
const localStorage=(()=>{try{const storage=globalThis.localStorage;storage.getItem('__dds_test__');return storage}catch{return{getItem(){return null},setItem(){},removeItem(){}}}})();
${siteBundle.outputFiles[0].text}
const offlineGameHtml=${serializedGame};
document.getElementById('offline-play').addEventListener('click',event=>{event.preventDefault();document.open();document.write(offlineGameHtml);document.close()});
}
</script>`
  )
  .replace('<script src="/js/year.js" defer></script>', `<script>${yearScript}</script>`);

if (/(?:src|href)=["']\/(?:assets|css|js|play)\//.test(html)) {
  throw new Error('Absolute HTML resource URLs remain in offline site');
}

await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, html);
console.log(`Built ${outputFile} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB)`);
