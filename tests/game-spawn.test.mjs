import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseSpawn, obstacleLane, canCollectBonus } from '../dist/js/game-flow.js';
import { STAGES } from '../dist/js/game-world.js';

test('the stage pools contain one drone type with no duplicate entry', () => {
  for (const stage of STAGES) {
    assert.equal(stage.obstacles.filter(kind => kind === 'drone').length, stage.obstacles.includes('drone') ? 1 : 0);
    assert.ok(!stage.obstacles.includes('scanner'));
    assert.equal(new Set(stage.obstacles).size, stage.obstacles.length);
  }
});

test('obstacles never repeat and bonuses alternate, with two obstacles between bonuses', () => {
  const pool = ['drone', 'stamp', 'bear'];
  let state = { cooldown: 2, lastObstacle: null, lastBonus: null };
  const sequence = [];
  for (let i = 0; i < 10; i++) {
    const next = chooseSpawn(pool, state, () => 0);
    sequence.push(next.kind);
    state = next.next;
  }
  assert.deepEqual(sequence, ['shield', 'drone', 'stamp', 'coffee', 'drone', 'stamp', 'shield', 'drone', 'stamp', 'coffee']);
  assert.equal(chooseSpawn(pool, state, () => .99).kind, 'bear');
});

test('the obstacle and bonus history survives a level boundary', () => {
  const previous = { cooldown: 2, lastObstacle: 'drone', lastBonus: 'coffee' };
  const bonus = chooseSpawn(['drone', 'stamp'], previous, () => 0);
  assert.equal(bonus.kind, 'shield');
  const obstacle = chooseSpawn(['drone', 'stamp'], bonus.next, () => 0);
  assert.equal(obstacle.kind, 'stamp');
  assert.notEqual(obstacle.next.lastObstacle, previous.lastObstacle);
});

test('each collision height is capped at three consecutive hazards, including across pickups', () => {
  for (const pool of [...STAGES.map(stage => stage.obstacles), [...new Set(STAGES.flatMap(stage => stage.obstacles))]]) {
    assert.ok(pool.some(kind => obstacleLane(kind) === 'upper'));
    assert.ok(pool.some(kind => obstacleLane(kind) === 'ground'));
    let state = { cooldown: 2, lastObstacle: null, lastBonus: null, lastLane: null, laneStreak: 0 };
    let maxStreak = 0;
    for (let i = 0; i < 400; i++) {
      const result = chooseSpawn(pool, state, () => i % 11 === 0 ? 0 : .01);
      state = result.next;
      maxStreak = Math.max(maxStreak, state.laneStreak);
      assert.ok(state.laneStreak <= 3, `${result.kind} made a run of ${state.laneStreak}`);
    }
    assert.ok(maxStreak >= 1);
    for (const lane of ['upper', 'ground']) {
      const kindOnLane = pool.find(kind => obstacleLane(kind) === lane);
      const forced = chooseSpawn(pool, { ...state, cooldown: 0, lastLane: lane, laneStreak: 3, lastObstacle: kindOnLane }, () => 0);
      assert.notEqual(obstacleLane(forced.kind), lane);
      assert.equal(forced.next.laneStreak, 1);
    }
  }
});

test('a bonus spawns and can be picked up only when it changes player state', () => {
  assert.equal(canCollectBonus('shield', { lives: 2, shield: true }), false);
  assert.equal(canCollectBonus('coffee', { lives: 3, shield: false }), false);
  assert.equal(canCollectBonus('shield', { lives: 3, shield: false }), true);
  assert.equal(canCollectBonus('coffee', { lives: 2, shield: true }), true);
  const previous = { cooldown: 2, lastObstacle: null, lastBonus: 'coffee', lastLane: null, laneStreak: 0 };
  assert.equal(chooseSpawn(['drone', 'paper'], previous, () => 0, { lives: 3, shield: false }).kind, 'shield');
  assert.equal(chooseSpawn(['drone', 'paper'], previous, () => 0, { lives: 3, shield: true }).kind, 'drone');
  assert.equal(chooseSpawn(['drone', 'paper'], { ...previous, lastBonus: 'shield' }, () => 0, { lives: 2, shield: true }).kind, 'coffee');
});
