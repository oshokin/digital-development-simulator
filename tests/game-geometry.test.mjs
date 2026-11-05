import test from 'node:test';
import assert from 'node:assert/strict';
import { intersects } from '../dist/js/game-logic.js';
import { obstacleArtRect, obstacleBox, playerBox, shieldHeadPoint, ROAD_OFFSET } from '../dist/js/game-geometry.js';

test('a flying drone visibly clears crouching Max and hits standing Max', () => {
  const floor = 442;
  const playerX = 150;
  const drone = { kind: 'drone', x: playerX };
  const prop = { w: 86, h: 47, overhead: true, artHeight: 100, artBottomInset: 8 };
  const art = obstacleArtRect(drone, prop, floor);
  // The unified atlas drone ends at y=373/404; crouching Max begins at 105/362.
  const droneBottom = art.y + 373 / 404 * art.h;
  const duckTop = floor + ROAD_OFFSET - 2 - 327 / 362 * 190 + 105 / 362 * 190;
  assert.ok(droneBottom < duckTop, 'visible gap below the drone');
  const box = obstacleBox(drone, prop, floor);
  assert.ok(intersects(playerBox(playerX, floor, 0, false), box, 7));
  assert.ok(!intersects(playerBox(playerX, floor, 0, true), box, 7));
});

test('the third stage uses the same floor line for characters and props', () => {
  const floor = 442;
  const item = { kind: 'server', x: 150 };
  const prop = { w: 65, h: 74 };
  const art = obstacleArtRect(item, prop, floor);
  assert.equal(art.y + art.h - 9, floor + ROAD_OFFSET);
  const box = obstacleBox(item, prop, floor);
  assert.ok(intersects(playerBox(150, floor, 0, false), box, 7));
  assert.ok(!intersects(playerBox(150, floor, 150, false), box, 7));
});

test('transparent padding no longer makes ground art hover above the road', () => {
  for (const [kind, inset] of [['cone', 19], ['paper', 9], ['barrier', 14], ['camera', 27], ['server', 3]]) {
    const art = obstacleArtRect({ kind, x: 150 }, { artBottomInset: inset }, 442);
    assert.equal(art.y + art.h - inset, 442 + ROAD_OFFSET, kind);
  }
  const standing = playerBox(150, 442, 0, false);
  const ducking = playerBox(150, 442, 0, true);
  assert.equal(standing.y + standing.h, 442 + ROAD_OFFSET - 8);
  assert.equal(ducking.y + ducking.h, 442 + ROAD_OFFSET - 8);
});

test('shield indicator stays above Max when standing, crouching and jumping', () => {
  for (const jumpHeight of [0, 120]) {
    for (const duck of [false, true]) {
      const point = shieldHeadPoint(150, 442, jumpHeight, duck);
      const box = playerBox(150, 442, jumpHeight, duck);
      assert.ok(point.y + 10 < box.y, `${duck ? 'duck' : 'stand'} +${jumpHeight}`);
    }
  }
});

test('coffee and shield are above standing Max and reachable with a jump', () => {
  for (const kind of ['coffee', 'shield']) {
    const floor = 442;
    const item = { kind, x: 150 };
    const prop = { w: 65, h: 65 };
    const art = obstacleArtRect(item, prop, floor);
    const box = obstacleBox(item, prop, floor);
    assert.ok(art.y + art.h < playerBox(150, floor, 0, false).y, kind);
    assert.ok(!intersects(playerBox(150, floor, 0, false), box, 7), kind);
    assert.ok(intersects(playerBox(150, floor, 120, false), box, 7), kind);
  }
});

test('bear and orca require a jump; hovering tiger requires a duck', () => {
  const floor = 442;
  for (const [kind, w, h] of [['bear', 82, 88], ['orca', 86, 81]]) {
    const box = obstacleBox({ kind, x: 150 }, { w, h }, floor);
    assert.ok(intersects(playerBox(150, floor, 0, false), box, 7), kind);
    assert.ok(!intersects(playerBox(150, floor, 150, false), box, 7), kind);
  }
  const item = { kind: 'tiger', x: 150 };
  const prop = { w: 85, h: 57, overhead: true, artHeight: 100 };
  const art = obstacleArtRect(item, prop, floor);
  assert.ok(art.y + art.h < playerBox(150, floor, 0, true).y);
  assert.ok(intersects(playerBox(150, floor, 0, false), obstacleBox(item, prop, floor), 7));
  assert.ok(!intersects(playerBox(150, floor, 0, true), obstacleBox(item, prop, floor), 7));
});

test('polar bear requires a jump; glider and crane clear ducking Max', () => {
  const floor = 442;
  const bear = { kind: 'polarBear', x: 150 };
  const bearBox = obstacleBox(bear, { w: 86, h: 86 }, floor);
  assert.ok(intersects(playerBox(150, floor, 0, false), bearBox, 7));
  assert.ok(!intersects(playerBox(150, floor, 150, false), bearBox, 7));
  for (const kind of ['glider', 'crane']) {
    const item = { kind, x: 150 };
    const prop = { w: 86, h: 56, overhead: true, artHeight: 100 };
    const art = obstacleArtRect(item, prop, floor);
    const box = obstacleBox(item, prop, floor);
    assert.ok(art.y + art.h < playerBox(150, floor, 0, true).y, kind);
    assert.ok(intersects(playerBox(150, floor, 0, false), box, 7), kind);
    assert.ok(!intersects(playerBox(150, floor, 0, true), box, 7), kind);
  }
});
