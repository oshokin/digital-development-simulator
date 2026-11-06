import { imageDimensions } from './image-dimensions.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { paceFor } from '../dist/play/js/game-pace.js';
import { obstacleArtRect, obstacleBox, playerBox } from '../dist/play/js/game-geometry.js';
import { STAGES, NEW_HAZARDS, ANIMAL_HAZARDS, WILDLIFE_HAZARDS } from '../dist/play/js/game-world.js';

test('actual update clock is frame-rate independent and freezes outside active play', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('function update(dt) {'), source.indexOf('\nfunction image('));
  function simulate(fps, mode = 'running', pending = false, seconds = 60) {
    const state = { mode, elapsed: 0, total: 0, score: 0, ambience: 0, toastTimer: 0,
      invulnerable: 0, velocity: 0, jumpHeight: 0, duckUntil: 0, motion: {}, spawnIn: 999,
      objects: [], stage: 0, endless: true };
    const noop = () => {};
    const update = new Function('state', 'scene', 'paceFor', 'RUN_SCORE_PER_SECOND',
      'duck', 'duckActive', 'duckPointers', 'duckKeys', 'advanceMotion', 'spawn',
      'checkpointTransition', 'STAGES', 'updateHUD', 'DESPAWN_X',
      `${body}; return update;`)(state, { pending }, paceFor, 10, noop, () => false,
      new Set(), new Set(), () => ({}), noop, () => null, STAGES, noop, -130);
    for (let i = 0; i < fps * seconds; i++) update(1 / fps);
    return state;
  }
  for (const fps of [30, 60, 144]) {
    const state = simulate(fps);
    assert.ok(Math.abs(state.total - 60) < 1e-8);
    assert.ok(Math.abs(paceFor(state.total).speed - 720) < 1e-7);
    const capped = simulate(fps, 'running', false, 130);
    assert.ok(Math.abs(capped.total - 130) < 1e-8);
    assert.equal(paceFor(capped.total).speed, 975);
  }
  for (const mode of ['paused', 'interlude', 'route', 'down', 'start', 'final']) {
    assert.equal(simulate(60, mode).total, 0);
  }
  assert.equal(simulate(60, 'running', true).total, 0);
});

test('actual stage start and retry preserve and restore checkpoint pace', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const body = source.slice(source.indexOf('function beginStage() {'), source.indexOf('\nfunction selectRoute('));
  const state = { total: 76, score: 760, stage: 1, endless: false };
  const noop = () => {};
  const { beginStage, retryStage } = new Function('state', 'RUN_START', 'newMotion', 'setMode',
    'requestScene', 'stageBackgrounds', 'preloadBackground', 'resetRun', 'toast', 't',
    `${body}; return { beginStage, retryStage };`)(state, { spawnSeconds: 1, lives: 3 },
    () => ({}), noop, noop, [], noop, noop, noop, () => []);
  beginStage();
  assert.equal(state.total, 76);
  assert.equal(state.checkpointTotal, 76);
  state.total = 91;
  state.score = 999;
  retryStage();
  assert.equal(state.total, 76);
  assert.equal(state.score, 760);
  assert.equal(state.elapsed, 0);
  assert.equal(paceFor(state.total).speed, 792);
});

test('stable spacing and mobile warning permit ground clearance using actual physics', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const value = name => Number(source.match(new RegExp(`(?:const ${name} =|${name}:)\\s*([\\d.]+)`))[1]);
  const velocity = value('JUMP_VELOCITY');
  const gravity = value('GRAVITY');
  const flight = 2 * velocity / gravity;
  for (const seconds of [0, 30, 60, 120, 3600]) {
    const pace = paceFor(seconds);
    assert.ok(pace.spawnDelay > flight + 0.5);
    // Largest ground box width is 70; standing runner width is 58.
    // Even at the initial speed, ground clearance at height 88 is ample.
    const clearTime = 2 * Math.sqrt(velocity ** 2 - 2 * gravity * 88) / gravity;
    assert.ok((70 + 58) / pace.speed < clearTime);
  }
  const props = new Function(`return ${source.match(/const props = (\{[\s\S]*?\n\});/)[1]}`)();
  const ground = Object.entries(props).filter(([kind, prop]) =>
    !prop.overhead && !['shield', 'coffee'].includes(kind));
  const floor = 552;
  const tallest = Math.max(...ground.map(([, prop]) => prop.h));
  const widest = Math.max(...ground.map(([kind, prop]) =>
    obstacleBox({ kind, x: 0 }, prop, floor).w));
  assert.equal(tallest, 88);
  assert.equal(widest, 70);
  const ascent = (velocity - Math.sqrt(velocity ** 2 - 2 * gravity * tallest)) / gravity;
  for (const viewport of ['mobile', 'desktop']) {
    const width = value(`${viewport}Width`);
    const runner = playerBox(value(`${viewport}PlayerX`), floor, 0, false);
    for (const [kind, prop] of ground) {
      // First visible pixel of art to first raw horizontal box overlap.
      // Ignoring collision insets and using full hazard height is conservative.
      const art = obstacleArtRect({ kind, x: 0 }, prop, floor);
      const box = obstacleBox({ kind, x: 0 }, prop, floor);
      const warning = (width - art.x + box.x - runner.x - runner.w) / paceFor(3600).speed;
      assert.ok(warning - ascent - 0.035 >= 0.3, `${viewport}/${kind}: ${warning - ascent - 0.035}`);
    }
  }
  // Exercise the shipped discrete integrator, not just its continuous formula.
  for (const dt of [1 / 144, 1 / 60, 1 / 30, 0.035]) {
    let height = 0, vy = velocity, time = 0, clearFrames = 0;
    do {
      height += vy * dt;
      vy -= gravity * dt;
      time += dt;
      if (height > 88) clearFrames++;
    } while (height > 0);
    assert.ok(clearFrames * dt > (widest + playerBox(0, floor, 0, false).w) / paceFor(0).speed);
    assert.ok(paceFor(120).spawnDelay - time > 0.5);
  }
});

test('pace is linear in active run seconds and the multiplier is honest', () => {
  for (const [seconds, speed] of [[0, 450], [30, 585], [60, 720], [100, 900], [116, 972], [120, 975], [3600, 975]]) {
    const pace = paceFor(seconds);
    assert.equal(pace.speed, speed);
    assert.equal(pace.multiplier, speed / 450);
    assert.equal(pace.spawnDelay, 1.8);
    assert.equal(pace.spawnJitter, 0.6);
  }
  assert.equal(paceFor(-10).speed, 450);
  const capTime = (975 - 450) / 4.5;
  assert.equal(capTime, 116.66666666666667);
  assert.equal(paceFor(capTime).speed, 975);
  assert.equal(paceFor(capTime).multiplier, 13 / 6);
  assert.ok(paceFor(capTime - 1e-6).speed < 975);
});

test('nine satirical hazards appear in campaign and endless pools', async () => {
  assert.equal(NEW_HAZARDS.length, 9);
  for (const name of NEW_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }

});

test('bear, orca and tiger have their own pixel-art atlas and stage entries', async () => {
  assert.deepEqual(ANIMAL_HAZARDS, ['bear', 'orca', 'tiger']);
  for (const name of ANIMAL_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }
  const art = await readFile(new URL('../dist/assets/game/sprites/hazards/orca.webp', import.meta.url));
  imageDimensions(art);
  assert.equal(imageDimensions(art)[0], 1448);
  assert.equal(imageDimensions(art)[1], 354);
});

test('polar bear, hang glider and crane have an atlas and campaign entries', async () => {
  assert.deepEqual(WILDLIFE_HAZARDS, ['polarBear', 'glider', 'crane']);
  for (const name of WILDLIFE_HAZARDS) {
    assert.ok(STAGES.some(stage => stage.obstacles.includes(name)), name);
  }
  const art = await readFile(new URL('../dist/assets/game/sprites/hazards/glider.webp', import.meta.url));
  imageDimensions(art);
  assert.equal(imageDimensions(art)[0], 724);
  assert.equal(imageDimensions(art)[1], 703);
});
