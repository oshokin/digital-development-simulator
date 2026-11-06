import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../dist');
const pages = ['index.html', 'play/index.html'];
let count = 0;
for (const page of pages) {
  const html = await readFile(resolve(root, page), 'utf8');
  for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|site|shared|play)\/[^"?#]+)(?:\?[^"#]*)?"/g)) {
    await access(resolve(root, '.' + match[1]));
    count++;
  }
}
for (const name of ['duck', 'hit', 'defeat']) await access(resolve(root, `assets/game/sprites/character/max-${name}.webp`));
for (const name of ['calendar', 'glider']) await access(resolve(root, `assets/game/sprites/hazards/${name}.webp`));
for (let i = 0; i < 6; i++) await access(resolve(root, `assets/game/sprites/character/max-run-${i}.webp`));
for (const phase of ['takeoff', 'air', 'land']) await access(resolve(root, `assets/game/sprites/character/max-jump-${phase}.webp`));
await access(resolve(root, 'assets/game/backgrounds/cybercity-night.webp'));
for (const scene of ['paperwork', 'infrastructure', 'cloud', 'whitelist', 'rkn9000', 'endless']) {
  for (const language of ['', '-en', '-es']) await access(resolve(root, `assets/game/backgrounds/scene-${scene}${language}.webp`));
}
for (const name of ['stamp', 'lock', 'drone', 'gate', 'archive', 'slowdown', 'sovereign']) await access(resolve(root, `assets/game/sprites/hazards/${name}.webp`));
for (const atlas of ['bear', 'polar-bear', 'orca', 'tiger', 'crane', 'glider']) await access(resolve(root, `assets/game/sprites/hazards/${atlas}.webp`));
for (const kind of ['hourglass', 'permit', 'server', 'cable', 'exposed-cable', 'barrier', 'cone', 'paper', 'fan', 'crate']) await access(resolve(root, `assets/game/sprites/hazards/${kind}.webp`));
for (const name of ['coffee', 'shield', 'coffee-legend', 'shield-legend']) await access(resolve(root, `assets/game/sprites/perks/${name}.webp`));
await access(resolve(root, 'assets/game/audio/background-music.m4a'));
for (const effect of ['player-jump', 'player-duck', 'player-death', 'player-hit', 'shield-pickup', 'shield-break', 'coffee-pickup']) await access(resolve(root, `assets/game/audio/${effect}.mp3`));
const gamePage = await readFile(resolve(root, 'play/index.html'), 'utf8');
for (const id of ['music-toggle', 'effects-toggle']) {
  if (!gamePage.includes(`id="${id}"`)) throw new Error(`Missing ${id}`);
}
if (gamePage.includes('id="touch-jump"') || gamePage.includes('id="touch-duck"')) throw new Error('Redundant touch buttons remain');
for (const obsolete of ['prop-0.png', 'max-run-1.png', 'bg-long-cityline.png']) {
  try { await access(resolve(root, `assets/game/${obsolete === 'bg-long-cityline.png' ? 'backgrounds' : 'sprites'}/${obsolete}`)); throw new Error(`Obsolete asset remains: ${obsolete}`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
console.log(`Checked ${pages.length} pages, ${count} local HTML references, 18 scenes, 11 hazard atlases and audio files.`);
