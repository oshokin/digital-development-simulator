import test from 'node:test';
import assert from 'node:assert/strict';
import { intersects, stageForTime, chooseEnding, scoreForRoute } from '../dist/play/js/game-logic.js';
import { STAGES, TEXT } from '../dist/play/js/game-data.js';

test('jump clears low obstacle while duck clears drone', () => {
  const low = { x: 100, y: 395, w: 80, h: 47 };
  const drone = { x: 100, y: 320, w: 80, h: 58 };
  const standing = { x: 110, y: 340, w: 58, h: 94 };
  const jumping = { ...standing, y: 215 };
  const ducking = { x: 110, y: 394, w: 66, h: 40 };
  assert.equal(intersects(standing, low, 7), true);
  assert.equal(intersects(jumping, low, 7), false);
  assert.equal(intersects(standing, drone, 7), true);
  assert.equal(intersects(ducking, drone, 7), false);
  assert.equal(intersects({ ...standing, y: 315 }, drone, 7), true);
});

test('five stages advance in order and both endings remain distinct', () => {
  const durations = STAGES.map(stage => stage.duration);
  assert.deepEqual(durations, [76, 80, 80, 80, 84]);
  assert.equal(stageForTime(0, durations), 0);
  assert.equal(stageForTime(durations[0], durations), 1);
  assert.equal(stageForTime(durations.reduce((a, b) => a + b, 0), durations), 5);
  assert.equal(chooseEnding('open'), 'good');
  assert.equal(chooseEnding('committee'), 'bad');
  assert.equal(scoreForRoute('public'), 2000);
  assert.equal(scoreForRoute('white'), 0);
  for (const lang of ['en', 'ru', 'es']) assert.equal(TEXT[lang].stageNames.length, 5);
});
