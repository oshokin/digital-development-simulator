import test from 'node:test';
import assert from 'node:assert/strict';
import { touchAction, keyboardAction, duckActive } from '../dist/play/js/game-input.js';

test('visible upper half jumps, visible lower half ducks at any canvas size', () => {
  for (const bounds of [{ top: 100, height: 540 }, { top: 220, height: 350 }]) {
    assert.equal(touchAction(bounds, bounds.top + 1), 'jump');
    assert.equal(touchAction(bounds, bounds.top + bounds.height / 2 - 1), 'jump');
    assert.equal(touchAction(bounds, bounds.top + bounds.height / 2), 'duck');
    assert.equal(touchAction(bounds, bounds.top + bounds.height - 1), 'duck');
  }
});

test('W and up jump, S and down duck; a tap has a short reliable crouch', () => {
  for (const code of ['Space', 'ArrowUp', 'KeyW']) assert.equal(keyboardAction(code), 'jump');
  for (const code of ['ArrowDown', 'KeyS']) assert.equal(keyboardAction(code), 'duck');
  assert.equal(keyboardAction('KeyA'), null);
  assert.equal(keyboardAction('KeyP'), null);
  assert.equal(duckActive(false, 10.2, 10.42), true);
  assert.equal(duckActive(false, 10.42, 10.42), false);
  assert.equal(duckActive(true, 11, 10.42), true);
});
