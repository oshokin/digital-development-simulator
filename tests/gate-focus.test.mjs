import test from 'node:test';
import assert from 'node:assert/strict';
import { focusPlayfield, handleGameKey } from '../dist/play/js/game-input.js';
import { drawHazardEffects } from '../dist/play/js/hazard-effects.js';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { keyboardAction, touchAction } from '../dist/play/js/game-input.js';

test('actual toolbar audio handlers toggle once, pointer clicks restore Space, keyboard clicks retain focus', async () => {
  globalThis.Audio = class {
    play() { return Promise.resolve(); }
    pause() {}
  };
  const writes = [];
  globalThis.localStorage = {
    getItem() { return null; },
    setItem(key, value) { writes.push([key, value]); }
  };
  const { bindAudioControls } = await import('../dist/play/js/game-audio.js');
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const doc = { activeElement: null, querySelector() { return toolbar; } };
  let listener, jumps = 0;
  const toolbar = { addEventListener(type, callback) { assert.equal(type, 'click'); listener = callback; } };
  class Element {
    constructor(id) { this.id = id; this.listeners = {}; }
    closest() { return ['music-toggle', 'effects-toggle', 'theme-cycle', 'language'].includes(this.id) ? this : null; }
    addEventListener(type, callback) { this.listeners[type] = callback; }
    setAttribute() {}
    classList = { toggle() {} };
  }
  class MouseEvent {
    constructor(target, detail) { this.target = target; this.detail = detail; }
  }
  const canvas = { focus() { doc.activeElement = canvas; } };
  const context = vm.createContext({ document: doc, canvas, MouseEvent, Element, focusPlayfield });
  const start = source.indexOf('document.querySelector(".header-tools")');
  assert.ok(start >= 0, 'compiled toolbar handler exists');
  vm.runInContext(source.slice(start, source.indexOf('function toast(', start)), context);
  const music = new Element('music-toggle'), effects = new Element('effects-toggle');
  bindAudioControls(music, effects, () => 'en');
  const click = (button, detail) => {
    doc.activeElement = button;
    button.listeners.click?.();
    listener(new MouseEvent(button, detail));
  };
  const space = mode => {
    const event = { code: 'Space', repeat: false, preventDefault() { this.prevented = true; } };
    handleGameKey(event, canvas, doc.activeElement, {
      jump() { if (mode === 'running') jumps++; }, duck() {}, pause() {}, pauseRunning() {}
    });
    if (!event.prevented && doc.activeElement.listeners?.click) click(doc.activeElement, 0);
    return event;
  };
  for (const button of [music, effects]) {
    for (const mode of ['running', 'paused', 'start', 'down']) {
      const before = writes.length;
      click(button, 1);
      assert.equal(doc.activeElement, canvas);
      assert.equal(writes.length, before + 1);
      assert.equal(space(mode).prevented, true);
      assert.equal(writes.length, before + 1, 'Space must not toggle audio again');
    }
    click(button, 0);
    assert.equal(doc.activeElement, button);
    const before = writes.length;
    assert.equal(space('running').prevented, undefined);
    assert.equal(writes.length, before + 1, 'native keyboard activation remains available');
    assert.equal(doc.activeElement, button);
  }
  assert.equal(jumps, 2);
  for (const id of ['theme-cycle', 'language']) {
    click(new Element(id), 1);
    assert.equal(doc.activeElement, canvas, 'including while a language scene is pending');
  }
  const overlayAction = new Element('retry');
  doc.activeElement = overlayAction;
  listener(new MouseEvent(overlayAction, 1));
  assert.equal(doc.activeElement, overlayAction);
  const link = new Element('link');
  click(link, 1);
  assert.equal(doc.activeElement, link);
});

test('gate effects never paint procedural lamps or scanner', () => {
  const render = (age, reduced = false) => {
    const calls = [];
    const ctx = {
      save() {}, restore() {}, beginPath() {},
      fillRect(...args) { calls.push(['scanner', this.fillStyle, ...args]); },
      arc(...args) { calls.push(['lamp', ...args]); },
      fill() { calls.push(['fill', this.fillStyle]); }
    };
    drawHazardEffects(ctx, 'gate', { x: 10, y: 20, w: 100, h: 80 }, age, reduced);
    return calls;
  };
  assert.deepEqual(render(0), []);
  assert.deepEqual(render(0.3), render(0.3), 'paused age freezes paint');
  assert.deepEqual(render(0, true), render(12, true));
  assert.deepEqual(render(12), []);
});

test('canvas focus restores game keys without stealing native button or editable keys', () => {
  const doc = { activeElement: null };
  let jumps = 0, toggles = 0, pauses = 0;
  const canvas = {
    focus(options) {
      assert.deepEqual(options, { preventScroll: true });
      doc.activeElement = canvas;
    }
  };
  const button = { tagName: 'BUTTON', click() { toggles++; doc.activeElement = button; } };
  const actions = {
    jump() { jumps++; }, duck() {}, pause() { pauses++; }, pauseRunning() {}
  };
  const key = code => {
    const event = { code, repeat: false, prevented: false, preventDefault() { this.prevented = true; } };
    handleGameKey(event, canvas, doc.activeElement, actions);
    if (!event.prevented && doc.activeElement === button && ['Space', 'Enter'].includes(code)) button.click();
    return event;
  };
  button.click();
  focusPlayfield(canvas); // canvas pointerdown
  assert.equal(key('Space').prevented, true);
  assert.equal(jumps, 1);
  assert.equal(toggles, 1);
  doc.activeElement = button; // intentional keyboard tab
  assert.equal(key('Space').prevented, false);
  assert.equal(key('Enter').prevented, false);
  assert.equal(toggles, 3);
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT', 'DIV']) {
    doc.activeElement = { tagName };
    assert.equal(key('Space').prevented, false);
    key('KeyP');
  }
  assert.equal(pauses, 0);
  for (const transition of ['start', 'retry', 'resume']) {
    doc.activeElement = button;
    focusPlayfield(canvas);
    assert.equal(key('Space').prevented, true, transition);
  }
  key('Escape');
  assert.equal(pauses, 1);
});

test('actual canvas pointer, keyboard and running transitions transfer focus', async () => {
  const source = await readFile(new URL('../dist/play/js/game.js', import.meta.url), 'utf8');
  const handlers = {};
  const doc = { activeElement: null };
  let jumps = 0;
  const canvas = {
    addEventListener(name, handler) { handlers[name] = handler; },
    focus(options) {
      assert.deepEqual(options, { preventScroll: true });
      doc.activeElement = canvas;
    },
    getBoundingClientRect() { return { top: 0, height: 100 }; }
  };
  const context = vm.createContext({
    canvas, document: doc,
    window: { addEventListener(name, handler) { handlers[name] = handler; } },
    state: { mode: 'running' }, scene: { pending: false },
    focusPlayfield, handleGameKey, keyboardAction, touchAction,
    jump() { jumps++; }, requestDuck() {}, startGame() {},
    togglePause() {}, pauseRunning() {}, setAudioRunning() {},
    updateHUD() {}, renderOverlay() {}
  });
  vm.runInContext(source.slice(source.indexOf('const duckKeys ='), source.indexOf('function releaseDuckPointer')), context);
  vm.runInContext(source.slice(source.indexOf('function setMode('), source.indexOf('function resetRun(')), context);
  const soundButton = { tagName: 'BUTTON' };
  doc.activeElement = soundButton;
  handlers.pointerdown({ pointerType: 'mouse', button: 0, clientY: 10, preventDefault() {} });
  assert.equal(doc.activeElement, canvas);
  const event = { code: 'Space', repeat: false, preventDefault() { this.prevented = true; } };
  handlers.keydown(event);
  assert.equal(jumps, 2);
  assert.equal(event.prevented, true);
  doc.activeElement = soundButton;
  handlers.keydown({ code: 'Space', preventDefault() { assert.fail('native button blocked'); } });
  assert.equal(jumps, 2);
  for (const transition of ['start', 'retry', 'resume']) {
    doc.activeElement = soundButton;
    vm.runInContext("setMode('running')", context);
    assert.equal(doc.activeElement, canvas, transition);
  }
  vm.runInContext("setMode('paused')", context);
  assert.equal(context.state.mode, 'paused');
});
