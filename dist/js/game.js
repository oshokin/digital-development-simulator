import { getLanguage, getTheme, effectiveTheme, setTheme, initPreferences } from './preferences.js';
import { STAGES, TEXT, NEW_HAZARDS, ANIMAL_HAZARDS, WILDLIFE_HAZARDS } from './game-world.js';
import { intersects, chooseEnding, scoreForRoute } from './game-logic.js';
import { newMotion, startMotion, advanceMotion, poseFor, FOOT_ANCHOR } from './animation.js';
import { paceFor } from './game-pace.js';
import { checkpointTransition, elapsedLabel, recoveryOptions, chooseSpawn, canCollectBonus } from './game-flow.js';
import { obstacleArtRect, obstacleBox, playerBox as runnerBox, shieldHeadPoint, ROAD_OFFSET } from './game-geometry.js';
import { bindAudioControls, setAudioRunning, restartMusic, playEffect } from './game-audio.js';
import { hazardPose } from './hazard-animation.js';
import { drawHazardEffects } from './hazard-effects.js';
import { touchAction, keyboardAction, duckActive } from './game-input.js';

initPreferences();
const $ = id => document.getElementById(id);
const refreshAudioLabels = bindAudioControls($('music-toggle'), $('effects-toggle'), getLanguage);
const canvas = $('game-canvas');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const images = {};
const spriteNames = [
  ...[9, 10, 11].map(i => `max-${i}`),
  ...[1, 2, 3, 4, 7, 8, 9, 10].map(i => `prop-${i}`),
  ...[...Array(6)].map((_, i) => `max-v2-run-${i}`),
  ...[...Array(3)].map((_, i) => `max-v2-jump-${i}`)
];
for (const name of spriteNames) {
  const img = new Image();
  img.src = `/assets/sprites/${name}.png`;
  images[name] = img;
}
const hazardAtlas = new Image();
hazardAtlas.src = '/assets/hazards/satirical-atlas.png';
const animalAtlas = new Image();
animalAtlas.src = '/assets/hazards/animal-atlas.png';
const wildlifeAtlas = new Image();
wildlifeAtlas.src = '/assets/hazards/wildlife-atlas.png';
const animationSheets = Object.fromEntries([['bears', 'bear-run'], ['creatures', 'creatures-motion'],
  ['hourglass', 'hourglass-motion'], ['permit', 'permit-motion'], ['server', 'server-motion'], ['cable', 'cable-motion'],
  ['exposed-cable', 'exposed-cable-motion'], ['coffee', 'coffee-motion']].map(([key, filename]) => {
  const img = new Image();
  img.src = `/assets/hazards/${filename}.png`;
  return [key, img];
}));
const stageBackgrounds = [
  'scene-paperwork',
  'scene-infrastructure',
  'scene-cloud',
  'scene-whitelist',
  'scene-rkn9000'
];
const backgroundCache = new Map();
function backgroundFor(name) {
  const language = getLanguage();
  const key = `${name}:${language}`;
  if (!backgroundCache.has(key)) {
    const img = new Image();
    img.src = `/assets/backgrounds/${name}${language === 'ru' ? '' : `-${language}`}.png`;
    backgroundCache.set(key, img);
  }
  return backgroundCache.get(key);
}
const endlessObstacles = [...new Set(STAGES.flatMap(stage => stage.obstacles))];
const fallbackBackground = new Image();
fallbackBackground.src = '/assets/backgrounds/cybercity-night.png';

let W = 960, H = 540, floor = 442, playerX = 148;
const state = {
  mode: 'start', stage: 0, elapsed: 0, total: 0, spawnIn: 2.4, score: 0,
  checkpointScore: 0, lives: 3, shield: false, route: null, endless: false,
  jumpHeight: 0, velocity: 0, duck: false, invulnerable: 0, objects: [],
  ambience: 0, toastTimer: 0, ending: null, motion: newMotion(),
  duckUntil: 0,
  spawnState: { cooldown: 2, lastObstacle: null, lastBonus: null, lastLane: null, laneStreak: 0 }
};

function t(key) { return TEXT[getLanguage()][key]; }
function resize() {
  const small = matchMedia('(max-width: 600px)').matches;
  W = small ? 520 : 960;
  H = small ? 650 : 540;
  floor = H - 98;
  playerX = small ? 80 : 150;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

function localizeStatic() {
  backgroundFor(state.endless ? 'scene-endless' : stageBackgrounds[state.stage]);
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.title = getLanguage() === 'ru' ? 'Беги, Макс, беги — Олег Шокин' : 'Digital Development Simulator — Oleg Shokin';
  $('year').textContent = new Date().getFullYear();
  updateThemeLabel();
  refreshAudioLabels();
  updateHUD();
  if (state.mode !== 'running') renderOverlay();
}
function updateThemeLabel() {
  const names = { en: { system: 'Auto', light: 'Light', dark: 'Dark' }, ru: { system: 'Авто', light: 'Светлая', dark: 'Тёмная' }, es: { system: 'Auto', light: 'Claro', dark: 'Oscuro' } };
  $('theme-name').textContent = names[getLanguage()][getTheme()];
}
$('theme-cycle').addEventListener('click', () => {
  const themes = ['system', 'light', 'dark'];
  setTheme(themes[(themes.indexOf(getTheme()) + 1) % themes.length]);
  updateThemeLabel();
});
document.addEventListener('app:language', localizeStatic);
document.addEventListener('app:theme', updateThemeLabel);

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('show');
  state.toastTimer = 2.6;
}
function updateHUD() {
  ($('hud-level-label') || document.querySelector('[data-i18n="level"]')).textContent = t(state.endless ? 'modeLabel' : 'level');
  $('hud-level').textContent = state.endless ? '∞' : `${String(state.stage + 1).padStart(2, '0')}/05`;
  $('hud-score').textContent = String(Math.floor(state.score)).padStart(4, '0');
  $('hud-lives').textContent = '♥ '.repeat(state.lives).trim() || '—';
  $('scene-label').textContent = state.endless ? t('endlessLabel') : `${String(state.stage + 1).padStart(2, '0')} / ${t('stageNames')[state.stage]}`;
  $('scene-progress').textContent = state.endless ? '' : STAGES.map((_, i) => i <= state.stage ? '●' : '○').join(' ');
  $('route-label').textContent = state.endless ? `${t('timeLabel')} ${elapsedLabel(state.total)}` : t(state.route === 'public' ? 'routePublic' : state.route === 'white' ? 'routeWhite' : 'routeNone');
  const pace = paceFor(state.elapsed, STAGES[state.stage].duration, state.stage, state.endless ? state.total : 0);
  $('status-text').textContent = state.mode === 'running'
    ? `${t('statusRun')} ×${pace.multiplier.toFixed(1)}`
    : t(state.mode === 'paused' ? 'statusPause' : 'statusReady');
  $('pause-button').textContent = state.mode === 'paused' ? t('resume') : t('pause');
  $('pause-button').setAttribute('aria-label', state.mode === 'paused' ? t('resume') : t('pause'));
}
function overlay(kicker, title, body, actions, foot = '') {
  $('overlay').hidden = false;
  $('overlay-kicker').textContent = kicker;
  $('overlay-kicker').hidden = !kicker;
  $('overlay-title').textContent = title;
  $('overlay-body').textContent = body;
  $('overlay-body').hidden = !body;
  $('overlay-foot').textContent = foot;
  $('overlay-foot').hidden = !foot;
  const area = $('overlay-actions');
  area.replaceChildren();
  for (const [label, callback, secondary] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (secondary) button.className = 'secondary';
    button.addEventListener('click', callback);
    area.append(button);
  }
}
function renderOverlay() {
  const mode = state.mode;
  if (mode === 'running') { $('overlay').hidden = true; return; }
  if (mode === 'start') overlay('SYSTEM NOTICE / 001', t('startTitle'), t('startBody'), [[t('startButton'), startGame], [t('endless'), startEndless, true]], t('startFoot'));
  if (mode === 'interlude') overlay(`${String(state.stage + 1).padStart(2, '0')} / 05`, t('checkpointTitle'), t('stageQuips')[state.stage], [[t('continue'), beginStage]], t('stageIntros')[state.stage]);
  if (mode === 'route') overlay('FORM / 004', t('routeTitle'), t('routeBody'), [[t('routeOpenButton'), () => selectRoute('public')], [t('routeWhiteButton'), () => selectRoute('white'), true]], `${t('routeOpenFoot')}   /   ${t('routeWhiteFoot')}`);
  if (mode === 'final') overlay('RKN-9000 / DECISION', t('finalTitle'), t('finalBody'), [[t('finalGood'), () => finish('open')], [t('finalBad'), () => finish('committee'), true]], t('stageQuips')[4]);
  if (mode === 'ending') overlay(state.ending === 'good' ? 'ENDING / OPEN' : 'ENDING / COMMITTEE', t(state.ending === 'good' ? 'goodTitle' : 'badTitle'), t(state.ending === 'good' ? 'goodBody' : 'badBody'), [[t('restartGame'), startGame], [t('endless'), startEndless, true]], `SCORE / ${Math.floor(state.score).toLocaleString()}`);
  if (mode === 'paused') overlay('SYSTEM / PAUSED', t('pauseTitle'), t('pauseBody'), [[t('resume'), resume], [t(state.endless ? 'newEndlessRun' : 'restartLevel'), retryStage, true]]);
  if (mode === 'down') {
    const callbacks = { newEndlessRun: retryStage, restartLevel: retryStage, restartGame: startGame };
    const actions = recoveryOptions(state.endless).map((key, index) => [t(key), callbacks[key], index > 0]);
    overlay('', t(state.endless ? 'endlessDownTitle' : 'downTitle'), '', actions);
  }
}
function setMode(mode) { state.mode = mode; setAudioRunning(mode === 'running'); updateHUD(); renderOverlay(); }
function resetRun(endless = false) {
  Object.assign(state, { stage: 0, score: 0, checkpointScore: 0, route: null, total: 0, endless, ending: null,
    spawnState: { cooldown: 2, lastObstacle: null, lastBonus: null, lastLane: null, laneStreak: 0 } });
  restartMusic();
  beginStage();
}
function startGame() { resetRun(false); }
function startEndless() { resetRun(true); }
function beginStage() {
  Object.assign(state, { elapsed: 0, spawnIn: 2.4, lives: 3, shield: false, jumpHeight: 0, velocity: 0, duck: false, duckUntil: 0, invulnerable: 0, objects: [], checkpointScore: state.score, motion: newMotion() });
  setMode('running');
  toast(state.endless ? t('endlessBody') : t('stageIntros')[state.stage]);
}
function retryStage() { if (state.endless) resetRun(true); else { state.score = state.checkpointScore; beginStage(); } }
function selectRoute(route) { state.route = route; state.stage = 3; setMode('interlude'); }
function finish(choice) {
  state.ending = chooseEnding(choice);
  if (state.ending === 'good') state.score += scoreForRoute(state.route);
  setMode('ending');
}
function resume() { setMode('running'); }
function togglePause() {
  if (state.mode === 'running') setMode('paused');
  else if (state.mode === 'paused') resume();
}
function pauseRunning() {
  if (state.mode === 'running') {
    duckPointers.clear(); duckKeys.clear(); state.duckUntil = state.total; state.duck = false;
    setMode('paused');
  }
}
$('pause-button').addEventListener('click', togglePause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseRunning(); });
window.addEventListener('blur', pauseRunning);

function jump() {
  if (state.mode !== 'running' || state.jumpHeight > 0 || state.duck || state.motion.phase === 'hit') return;
  state.velocity = 790;
  state.motion = startMotion(state.motion, 'takeoff');
  playEffect('jump');
}
function duck(on) {
  if (state.mode !== 'running') return;
  const next = on && state.jumpHeight === 0;
  if (next === state.duck) return;
  state.duck = next;
  if (state.motion.phase !== 'hit') state.motion = startMotion(state.motion, next ? 'duck-enter' : 'duck-exit');
  if (next) playEffect('duck');
}
const duckKeys = new Set();
function requestDuck() {
  if (state.mode !== 'running') return;
  state.duckUntil = Math.max(state.duckUntil, state.total + .42);
  duck(true);
}
window.addEventListener('keydown', e => {
  const action = keyboardAction(e.code);
  if (action && !['BUTTON', 'A'].includes(document.activeElement.tagName)) e.preventDefault();
  if (e.repeat) return;
  if (e.code === 'PrintScreen') { pauseRunning(); return; }
  if (e.code === 'KeyP' || e.code === 'Escape') { togglePause(); return; }
  if (['BUTTON', 'A'].includes(document.activeElement.tagName)) return;
  if (action === 'jump') { if (state.mode === 'start') startGame(); else jump(); }
  if (action === 'duck') { duckKeys.add(e.code); requestDuck(); }
});
window.addEventListener('keyup', e => {
  if (e.code === 'PrintScreen') pauseRunning();
  if (keyboardAction(e.code) === 'duck') duckKeys.delete(e.code);
});
// The whole playfield is the touch target. Holding the lower half keeps Max ducked.
const duckPointers = new Set();
canvas.addEventListener('pointerdown', e => {
  if (state.mode !== 'running' || (e.pointerType === 'mouse' && e.button !== 0)) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  if (touchAction(rect, e.clientY) === 'jump') { jump(); return; }
  duckPointers.add(e.pointerId);
  canvas.setPointerCapture(e.pointerId);
  requestDuck();
});
function releaseDuckPointer(e) {
  duckPointers.delete(e.pointerId);
}
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(event, releaseDuckPointer);

const props = {
  paper: { image: 2, w: 72, h: 56, artBottomInset: 9 }, fan: { image: 4, w: 86, h: 62, artBottomInset: 16 },
  server: { w: 65, h: 74, artBottomInset: 3 }, barrier: { image: 7, w: 80, h: 47, artBottomInset: 14 },
  drone: { w: 86, h: 47, overhead: true, artHeight: 100, artBottomInset: 8 },
  shield: { image: 9, w: 65, h: 65, artBottomInset: 16 }, coffee: { image: 10, w: 61, h: 55, artBottomInset: 17 },
  cone: { image: 1, w: 62, h: 58, artBottomInset: 19 }, router: { image: 3, w: 76, h: 55, artBottomInset: 15 },
  camera: { w: 72, h: 70, artBottomInset: 27 }, crate: { image: 8, w: 76, h: 66, artBottomInset: 16 },
  cable: { w: 84, h: 43, artBottomInset: 9 },
  stamp: { w: 74, h: 72 }, lock: { w: 78, h: 80 },
  hourglass: { w: 68, h: 76 }, gate: { w: 82, h: 69 },
  permit: { w: 76, h: 72 }, archive: { w: 76, h: 83 },
  slowdown: { w: 70, h: 79 }, sovereign: { w: 78, h: 88 },
  bear: { w: 82, h: 88 }, orca: { w: 86, h: 81 },
  tiger: { w: 85, h: 57, overhead: true, artHeight: 100 },
  polarBear: { w: 86, h: 86 },
  glider: { w: 87, h: 56, overhead: true, artHeight: 100 },
  crane: { w: 86, h: 52, overhead: true, artHeight: 100 }
};
function spawn() {
  const stage = STAGES[state.stage];
  const pool = state.endless ? endlessObstacles : stage.obstacles;
  const { kind, next } = chooseSpawn(pool, state.spawnState, Math.random, state);
  state.spawnState = next;
  state.objects.push({ kind, x: W + 34, age: 0, taken: false });
  const easy = state.stage === 3 && state.route === 'white';
  const pace = paceFor(state.elapsed, stage.duration, state.stage, state.endless ? state.total : 0);
  state.spawnIn = easy ? 1.75 + Math.random() * .8 : pace.spawnDelay + Math.random() * pace.spawnJitter;
}
function objectBox(item) {
  return obstacleBox(item, props[item.kind], floor);
}
function playerBox() {
  return runnerBox(playerX, floor, state.jumpHeight, state.duck);
}
function update(dt) {
  state.ambience += dt;
  if (state.toastTimer > 0) { state.toastTimer -= dt; if (state.toastTimer <= 0) $('toast').classList.remove('show'); }
  if (state.mode !== 'running') return;
  state.elapsed += dt; state.total += dt; state.score += dt * 11;
  const pace = paceFor(state.elapsed, STAGES[state.stage].duration, state.stage, state.endless ? state.total : 0);
  state.invulnerable = Math.max(0, state.invulnerable - dt);
  if (state.velocity || state.jumpHeight) {
    state.jumpHeight += state.velocity * dt;
    state.velocity -= 1880 * dt;
    if (state.jumpHeight <= 0) { state.jumpHeight = 0; state.velocity = 0; }
  }
  duck(duckActive(duckPointers.size > 0 || duckKeys.size > 0, state.total, state.duckUntil));
  state.motion = advanceMotion(state.motion, dt, { ...state, cadence: pace.multiplier });
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) spawn();
  for (const item of state.objects) {
    item.age += dt;
    item.x -= pace.speed * dt;
    if (item.taken || !intersects(playerBox(), objectBox(item), 7)) continue;
    if (item.kind === 'shield' || item.kind === 'coffee') {
      if (!canCollectBonus(item.kind, state)) continue;
      item.taken = true;
      if (item.kind === 'shield') { state.shield = true; toast(t('toastShield')); playEffect('shield-pickup'); }
      else { state.lives++; toast(t('toastCoffee')); playEffect('coffee-pickup'); }
      state.score += 80;
    } else if (state.invulnerable <= 0) {
      item.taken = true;
      if (state.shield) { state.shield = false; toast(t('toastBlock')); playEffect('shield-break'); }
      else {
        state.invulnerable = 1.4;
        state.motion = startMotion(state.motion, 'hit');
        state.lives--;
        toast(t('toastHit'));
        if (state.lives <= 0) { state.jumpHeight = 0; setMode('down'); playEffect('death'); break; }
        playEffect('hit-gong');
      }
    }
  }
  state.objects = state.objects.filter(item => !item.taken && item.x > -130);
  const transition = checkpointTransition(state, STAGES[state.stage].duration);
  if (state.mode === 'running' && transition) {
    if (transition.stage !== undefined) state.stage = transition.stage;
    setMode(transition.mode);
  }
  updateHUD();
}

function image(name, x, y, w, h) {
  const img = images[name];
  if (img?.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
}
function drawPlayer(pose, jumpHeight, opacity = 1) {
  const size = 190;
  const width = size * pose.scaleX;
  const height = size * pose.scaleY;
  const bottom = FOOT_ANCHOR[pose.sprite] ?? 331;
  const drawY = floor + ROAD_OFFSET - 2 - jumpHeight - pose.lift - bottom * height / 362;
  const shake = state.motion.phase === 'hit' ? Math.sin(state.motion.age * 75) * 3 : 0;
  ctx.save();
  ctx.globalAlpha = opacity;
  image(pose.sprite, playerX - 56 - (width - size) / 2 + shake, drawY, width, height);
  ctx.restore();
}
function drawBackgroundImage(img, stage = 0) {
  if (!img?.complete || !img.naturalWidth || !img.naturalHeight) return false;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  // The illustrations are not seamless; keep the camera inside each image.
  const ratio = W / H;
  const viewW = Math.min(iw, ih * ratio);
  const viewH = Math.min(ih, iw / ratio);
  const marginX = Math.max(0, (iw - viewW) / 2);
  const marginY = Math.max(0, (ih - viewH) / 2);
  const sx = marginX + (reducedMotion.matches ? 0 : Math.sin(state.ambience * .12 + stage) * Math.min(marginX, 14));
  const sy = marginY + (reducedMotion.matches ? 0 : Math.sin(state.ambience * .09 + stage * .7) * Math.min(marginY, 7));
  const scene = state.endless ? 'scene-endless' : stageBackgrounds[stage];
  ctx.drawImage(img, sx, sy, viewW, viewH, 0, 0, W, H);
  // Only two distant tower beacons breathe gently. No gameplay information is
  // encoded in background motion, and reduced-motion removes it entirely.
  if (!reducedMotion.matches && img !== fallbackBackground) {
    const lamps = scene === 'scene-paperwork' ? [[114, 150], [1142, 189]] : [[115, 46], [1110, 46]];
    const phase = .24 + .20 * Math.sin(state.ambience * 1.7);
    ctx.fillStyle = `rgba(255, 141, 110, ${phase})`;
    for (const [px, py] of lamps) {
      const cx = (px * iw / 1254 - sx) * W / viewW;
      const cy = (py * ih / 706 - sy) * H / viewH;
      if (cx > 0 && cx < W && cy > 0 && cy < floor - 90) {
        ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  return true;
}
function drawStageBackdrop(dark) {
  const source = backgroundFor(state.endless ? 'scene-endless' : stageBackgrounds[state.stage]);
  const drawn = drawBackgroundImage(source, state.stage)
    || drawBackgroundImage(fallbackBackground);
  if (!drawn) {
    ctx.fillStyle = dark ? '#1a2f4b' : '#5f82aa';
    ctx.fillRect(0, 0, W, H);
  }

  const tint = ctx.createLinearGradient(0, 0, 0, H);
  tint.addColorStop(0, dark ? '#05102244' : '#ffffff1f');
  tint.addColorStop(.65, dark ? '#0b172e55' : '#18263e35');
  tint.addColorStop(1, dark ? '#0a1426c0' : '#13213d88');
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = STAGES[state.stage].palette;
  ctx.fillRect(0, floor, W, 10);
  ctx.fillStyle = dark ? '#0d1a2cd4' : '#15324eb0';
  ctx.fillRect(0, floor + 10, W, H - floor);
  ctx.fillStyle = dark ? '#5ecb7480' : '#dff7f095';
  const pace = paceFor(state.elapsed, STAGES[state.stage].duration, state.stage, state.endless ? state.total : 0);
  for (let x = -((state.ambience * pace.speed * .28) % 88); x < W; x += 88) ctx.fillRect(x, floor + 34, 52, 4);
}
function drawShield() {
  const crouching = state.duck;
  const cx = playerX + (crouching ? 43 : 46);
  const cy = floor + ROAD_OFFSET - (crouching ? 47 : 87) - state.jumpHeight;
  const rx = crouching ? 92 : 88;
  const ry = crouching ? 57 : 98;
  const pulse = .75 + Math.sin(state.ambience * 4.5) * .2;

  ctx.save();
  ctx.shadowColor = '#49f5f2';
  ctx.shadowBlur = 18;

  const aura = ctx.createRadialGradient(cx, cy, rx * .18, cx, cy, ry);
  aura.addColorStop(0, 'rgba(73, 245, 242, 0)');
  aura.addColorStop(.7, `rgba(73, 245, 242, ${pulse * .05})`);
  aura.addColorStop(1, 'rgba(73, 245, 242, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Keep the visible shield outside the sprite: a ground glow and orbiting nodes.
  ctx.strokeStyle = `rgba(101, 244, 247, ${.42 + pulse * .2})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, floor + ROAD_OFFSET - 2 - state.jumpHeight, rx * .72, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  const nodes = [
    [cx - rx, cy + ry * .08],
    [cx + rx, cy - ry * .12]
  ];
  for (const [x, y] of nodes) {
    ctx.fillStyle = '#d9ffef';
    ctx.beginPath();
    ctx.arc(x, y, 2.5 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(101, 244, 247, .55)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 7 + pulse * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShieldHead() {
  const { x, y } = shieldHeadPoint(playerX, floor, state.jumpHeight, state.duck);
  ctx.save();
  ctx.shadowColor = '#69faff'; ctx.shadowBlur = 15;
  ctx.fillStyle = '#e5fffc';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5af1f7'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 9 + Math.sin(state.ambience * 5) * 1.5, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

function drawItemCue(item, { x, y, w, h }) {
  if (item.kind !== 'coffee' && item.kind !== 'shield') return;
  ctx.save();
  ctx.strokeStyle = '#83ffda';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#83ffda';
  ctx.shadowBlur = 17;
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w * .43, h * .44, 0, 0, Math.PI * 2); ctx.stroke();
  const bx = x + w - 8, by = y + 13;
  ctx.fillStyle = '#12443f';
  ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fffdf3';
  ctx.font = '900 19px ui-monospace, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('+', bx, by + 1);
  ctx.restore();
}

function drawObstacle(item) {
  const prop = props[item.kind];
  const { x, y, w, h } = obstacleArtRect(item, prop, floor);
  const pose = hazardPose(item.kind, item.age);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2 + pose.bob);
  ctx.rotate(pose.tilt);
  ctx.scale(pose.squash, 1 / pose.squash);
  ctx.translate(-x - w / 2, -y - h / 2);
  let drawn = false;
  if (pose.sheet) {
    const sheet = animationSheets[pose.sheet];
    if (sheet.complete && sheet.naturalWidth) {
      const cw = sheet.naturalWidth / 4;
      const ch = sheet.naturalHeight / (pose.sheet === 'bears' ? 2 : 3);
      const strip = ['hourglass', 'permit', 'server', 'cable', 'exposed-cable', 'coffee'].includes(pose.sheet);
      const sourceY = pose.sheet === 'cable' ? 210 : pose.sheet === 'server' ? 110 : 0;
      const sourceH = pose.sheet === 'cable' ? 350 : pose.sheet === 'server' ? 560 : sheet.naturalHeight;
      ctx.drawImage(sheet, pose.frame * cw, strip ? sourceY : pose.row * ch,
        cw, strip ? sourceH : ch, x, y, w, h);
      drawn = true;
    }
  }
  const index = NEW_HAZARDS.indexOf(item.kind);
  if (!drawn && index >= 0) {
    if (!hazardAtlas.complete || !hazardAtlas.naturalWidth) { ctx.restore(); return; }
    const cellWidth = hazardAtlas.naturalWidth / 3;
    const cellHeight = hazardAtlas.naturalHeight / 3;
    if (item.kind === 'slowdown') {
      ctx.save();
      ctx.translate(2 * x + w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(hazardAtlas, index % 3 * cellWidth, Math.floor(index / 3) * cellHeight, cellWidth, cellHeight, x, y, w, h);
    if (item.kind === 'slowdown') ctx.restore();
  } else if (!drawn && ANIMAL_HAZARDS.includes(item.kind)) {
    if (!animalAtlas.complete || !animalAtlas.naturalWidth) { ctx.restore(); return; }
    const animalIndex = ANIMAL_HAZARDS.indexOf(item.kind);
    const cell = animalAtlas.naturalWidth / 3;
    ctx.drawImage(animalAtlas, animalIndex * cell, 0, cell, animalAtlas.naturalHeight, x, y, w, h);
  } else if (!drawn && WILDLIFE_HAZARDS.includes(item.kind)) {
    if (!wildlifeAtlas.complete || !wildlifeAtlas.naturalWidth) { ctx.restore(); return; }
    const wildlifeIndex = WILDLIFE_HAZARDS.indexOf(item.kind);
    const cell = wildlifeAtlas.naturalWidth / 3;
    ctx.drawImage(wildlifeAtlas, wildlifeIndex * cell, 0, cell, wildlifeAtlas.naturalHeight, x, y, w, h);
  } else if (!drawn && prop.image !== undefined) image(`prop-${prop.image}`, x, y, w, h);
  if (item.kind === 'glider' || item.kind === 'drone') {
    const centers = item.kind === 'glider'
      ? [[.78, .56]]
      : [[.16, .25], [.81, .25], [.23, .43], [.75, .43]];
    for (const [px, py] of centers) {
      ctx.save();
      ctx.translate(x + w * px, y + h * py);
      ctx.rotate(item.age * 28);
      ctx.strokeStyle = '#c9f8ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke();
      ctx.restore();
    }
  }
  if (item.kind === 'drone') {
    ctx.fillStyle = `rgba(255, 77, 60, ${.08 + .10 * (1 + Math.sin(item.age * 12)) / 2})`;
    ctx.beginPath();
    ctx.moveTo(x + w * .63, y + h * .48);
    ctx.lineTo(x + w * .94, y + h);
    ctx.lineTo(x + w * .48, y + h);
    ctx.closePath();
    ctx.fill();
  }
  drawHazardEffects(ctx, item.kind, { x, y, w, h }, item.age, reducedMotion.matches);
  ctx.restore();
  drawItemCue(item, { x, y, w, h });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const dark = effectiveTheme() === 'dark';
  drawStageBackdrop(dark);
  ctx.fillStyle = dark ? '#101b2bbc' : '#eff6e5d9';
  ctx.fillRect(20, 20, Math.min(W - 40, 300), 48);
  ctx.fillStyle = dark ? '#d7fa5b' : '#21352e';
  ctx.font = '800 15px ui-monospace, monospace';
  ctx.fillText(state.endless ? t('endlessLabel') : `${String(state.stage + 1).padStart(2, '0')} / ${t('stageNames')[state.stage]}`, 32, 49, Math.min(W - 65, 278));
  if (!state.endless) {
    ctx.fillStyle = STAGES[state.stage].palette;
    ctx.fillRect(0, 0, W * Math.min(1, state.elapsed / STAGES[state.stage].duration), 6);
  }
  for (const item of state.objects) drawObstacle(item);
  const pose = state.mode === 'down'
    ? { sprite: 'max-11', lift: 0, scaleX: 1, scaleY: 1 }
    : poseFor(state.motion, state.velocity);
  if (state.shield) drawShield();
  if (state.mode === 'down' || state.invulnerable <= 0 || Math.floor(state.ambience * 13) % 2 === 0) {
    drawPlayer(pose, state.jumpHeight);
  }
  if (state.shield) drawShieldHead();
  if (!state.endless && state.stage === 4) {
    ctx.fillStyle = dark ? '#d7fa5b' : '#173944';
    ctx.font = '900 12px ui-monospace, monospace';
    ctx.fillText('RKN-9000', W - 110, 48);
  }
}

let previous = performance.now();
function loop(now) {
  const dt = Math.min((now - previous) / 1000, .035);
  previous = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
localizeStatic();
renderOverlay();
requestAnimationFrame(loop);
