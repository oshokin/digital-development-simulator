import test from 'node:test';
import assert from 'node:assert/strict';

test('music and effects have independent controls; the four new effects play at their events', async () => {
  const tracks = new Map();
  globalThis.Audio = class {
    constructor(src) { this.src = src; this.playCount = 0; this.pauseCount = 0; tracks.set(src, this); }
    play() { this.playCount++; return Promise.resolve(); }
    pause() { this.pauseCount++; }
  };
  const saved = new Map();
  globalThis.localStorage = { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) };
  const { bindAudioControls, setAudioRunning, playEffect } = await import('../dist/play/js/game-audio.js');
  const button = () => ({
    listeners: {}, attributes: {}, classList: { toggle() {} },
    addEventListener(event, callback) { this.listeners[event] = callback; },
    setAttribute(key, value) { this.attributes[key] = value; },
    click() { this.listeners.click(); }
  });
  const musicButton = button();
  const effectsButton = button();
  bindAudioControls(musicButton, effectsButton, () => 'en');
  setAudioRunning(true);
  assert.equal(tracks.get('/assets/game/audio/background-music.m4a').playCount, 1);

  for (const [name, file] of Object.entries({ jump: 'player-jump', duck: 'player-duck', 'hit-gong': 'player-hit', 'shield-pickup': 'shield-pickup', 'shield-break': 'shield-break', 'coffee-pickup': 'coffee-pickup' })) {
    playEffect(name);
    assert.equal(tracks.get(`/assets/game/audio/${file}.mp3`).playCount, 1, name);
  }
  effectsButton.click();
  assert.equal(effectsButton.attributes['aria-pressed'], 'false');
  playEffect('hit-gong');
  assert.equal(tracks.get('/assets/game/audio/player-hit.mp3').playCount, 1);
  assert.equal(tracks.get('/assets/game/audio/background-music.m4a').pauseCount, 0);

  effectsButton.click();
  playEffect('death');
  assert.equal(tracks.get('/assets/game/audio/player-death.mp3').playCount, 1);
  assert.ok(tracks.get('/assets/game/audio/player-hit.mp3').pauseCount > 0);
  musicButton.click();
  assert.equal(musicButton.attributes['aria-pressed'], 'false');
  assert.equal(tracks.get('/assets/game/audio/background-music.m4a').pauseCount, 1);
});
