import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkpointTransition, elapsedLabel, recoveryOptions } from '../dist/js/game-flow.js';
import { STAGES, TEXT } from '../dist/js/game-world.js';

test('endless never reaches a checkpoint, route choice or final decision', () => {
  for (let stage = 0; stage < STAGES.length; stage++) {
    for (const elapsed of [0, STAGES[stage].duration, 3600]) {
      assert.equal(checkpointTransition({ endless: true, stage, elapsed }, STAGES[stage].duration), null);
    }
  }
  assert.deepEqual(checkpointTransition({ endless: false, stage: 0, elapsed: 76 }, 76), { mode: 'interlude', stage: 1 });
  assert.deepEqual(checkpointTransition({ endless: false, stage: 2, elapsed: 80 }, 80), { mode: 'route' });
  assert.deepEqual(checkpointTransition({ endless: false, stage: 4, elapsed: 84 }, 84), { mode: 'final' });
  assert.equal(elapsedLabel(3723.9), '62:03');
  assert.deepEqual(recoveryOptions(true), ['newEndlessRun']);
  assert.deepEqual(recoveryOptions(false), ['restartLevel', 'restartGame']);
});

test('endless scene exists and the home page keeps work and controls concise', async () => {
  const scene = await readFile(new URL('../dist/assets/backgrounds/scene-endless.png', import.meta.url));
  assert.equal(scene.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.ok(scene.length > 100_000);
  for (const lang of ['en', 'ru', 'es']) {
    for (const key of ['modeLabel', 'endlessLabel', 'timeLabel', 'restartEndless', 'endlessDownTitle', 'endlessDownBody']) {
      assert.ok(TEXT[lang][key], `${lang}.${key}`);
    }
  }
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const titles = [...html.matchAll(/<h3 data-i18n="p\dTitle">([^<]+)<\/h3>/g)].map(match => match[1]);
  assert.deepEqual(titles, ['Distributed object storage', 'Property valuation', 'Custom CRM', 'xk6-kv', 'Cursor Chat Transit']);
  assert.doesNotMatch(html, /MyOffice|МойОфис|DOS —|LEVEL 01 \/ 05|Code, projects and a game/);
  assert.ok(html.indexOf('class="header-tools"') < html.indexOf('<main id="main">'));
  assert.ok(html.indexOf('id="theme-cycle"') < html.indexOf('<main id="main">'));
  assert.match(html, /data-i18n="gameCaption"/);
  assert.doesNotMatch(html, /data-i18n="contactBody"/);
  const copy = await readFile(new URL('../dist/js/site.js', import.meta.url), 'utf8');
  assert.match(copy, /Без регистрации и СМС/);
  assert.match(copy, /БЕГИ \/ ПРЫГАЙ \/ ПРИНИМАЙ РЕШЕНИЕ/);
  assert.match(copy, /CORRE \/ SALTA \/ DECIDE/);
  assert.match(copy, /Изучаю код\. Измеряю быстродействие\./);
});
