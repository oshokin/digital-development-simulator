import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const pages = ['index.html', 'play/index.html'];
let count = 0;
for (const page of pages) {
  const html = await readFile(resolve(root, page), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|css|js)\/[^"?#]+)"/g)) {
    await access(resolve(root, '.' + match[1]));
    count++;
  }
}
for (const i of [9, 10, 11]) await access(resolve(root, `assets/sprites/max-${i}.png`));
for (const i of [1, 2, 3, 4, 7, 8, 9, 10]) await access(resolve(root, `assets/sprites/prop-${i}.png`));
for (let i = 0; i < 6; i++) await access(resolve(root, `assets/sprites/max-v2-run-${i}.png`));
for (let i = 0; i < 3; i++) await access(resolve(root, `assets/sprites/max-v2-jump-${i}.png`));
await access(resolve(root, 'assets/backgrounds/cybercity-night.png'));
for (const scene of ['paperwork', 'infrastructure', 'cloud', 'whitelist', 'rkn9000', 'endless']) {
  for (const language of ['en', 'es']) await access(resolve(root, `assets/backgrounds/scene-${scene}-${language}.png`));
}
await access(resolve(root, 'assets/hazards/satirical-atlas.png'));
await access(resolve(root, 'assets/hazards/animal-atlas.png'));
await access(resolve(root, 'assets/hazards/wildlife-atlas.png'));
for (const atlas of ['bear-run', 'creatures-motion']) await access(resolve(root, `assets/hazards/${atlas}.png`));
for (const kind of ['hourglass', 'permit', 'server', 'cable', 'exposed-cable', 'coffee']) await access(resolve(root, `assets/hazards/${kind}-motion.png`));
await access(resolve(root, 'assets/audio/dj-perekryt-bum-bum-bam-bam.m4a'));
for (const effect of ['jump', 'duck', 'death', 'hit-gong', 'shield-pickup', 'shield-break', 'coffee-pickup']) await access(resolve(root, `assets/audio/${effect}.mp3`));
const gamePage = await readFile(resolve(root, 'play/index.html'), 'utf8');
for (const id of ['music-toggle', 'effects-toggle']) {
  if (!gamePage.includes(`id="${id}"`)) throw new Error(`Missing ${id}`);
}
if (gamePage.includes('id="touch-jump"') || gamePage.includes('id="touch-duck"')) throw new Error('Redundant touch buttons remain');
for (const obsolete of ['prop-0.png', 'max-run-1.png', 'bg-long-cityline.png']) {
  try { await access(resolve(root, `assets/${obsolete === 'bg-long-cityline.png' ? 'backgrounds' : 'sprites'}/${obsolete}`)); throw new Error(`Obsolete asset remains: ${obsolete}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
console.log(`Checked ${pages.length} pages, ${count} local HTML references, 12 localized scenes, 11 hazard atlases and audio files.`);
