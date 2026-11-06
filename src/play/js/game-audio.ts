import type { Language } from '../../shared/js/preferences.js';

// Background music gain on the normalized audio volume scale.
const MUSIC_VOLUME = 0.28;
const music = new Audio('/assets/game/audio/background-music.m4a');
music.loop = true;
music.preload = 'auto';
music.volume = MUSIC_VOLUME;

let musicEnabled = localStorage.getItem('dds-music') !== 'off';
let effectsEnabled = localStorage.getItem('dds-effects') !== 'off';
let running = false;
// Authored per-effect gains on the normalized audio volume scale.
const effectVolumes = {
  jump: 0.55,
  duck: 0.55,
  death: 0.7,
  'hit-gong': 0.95,
  'shield-pickup': 0.78,
  'shield-break': 0.82,
  'coffee-pickup': 0.8
};

const effectFiles: Record<string, string> = {
  jump: 'player-jump',
  duck: 'player-duck',
  death: 'player-death',
  'hit-gong': 'player-hit',
  'shield-pickup': 'shield-pickup',
  'shield-break': 'shield-break',
  'coffee-pickup': 'coffee-pickup'
};
const effects = Object.fromEntries(
  Object.entries(effectVolumes).map(([name, volume]) => {
    const sound = new Audio(`/assets/game/audio/${effectFiles[name]}.mp3`);
    sound.preload = 'auto';
    sound.volume = volume;
    return [name, sound];
  })
);

function syncMusic() {
  if (!musicEnabled || !running) {
    music.pause();
    return;
  }
  music.play().catch(() => {});
}

export function setAudioRunning(value: boolean) {
  running = value;
  syncMusic();
}

export function restartMusic() {
  music.currentTime = 0;
}

const labels = {
  en: { music: 'Music', effects: 'Sound effects', on: 'on', off: 'off' },
  ru: { music: 'Музыка', effects: 'Эффекты', on: 'включены', off: 'выключены' },
  es: {
    music: 'Música',
    effects: 'Efectos',
    on: 'activados',
    off: 'desactivados'
  }
};

export function bindAudioControls(
  musicButton: HTMLElement,
  effectsButton: HTMLElement,
  getLanguage: () => Language
) {
  function refresh() {
    const words = labels[getLanguage()];

    const controls: [HTMLElement, 'music' | 'effects', boolean][] = [
      [musicButton, 'music', musicEnabled],
      [effectsButton, 'effects', effectsEnabled]
    ];
    for (const [button, key, enabled] of controls) {
      const label = `${words[key]}: ${words[enabled ? 'on' : 'off']}`;
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(enabled));
      button.classList.toggle('is-muted', !enabled);
    }
  }
  musicButton.addEventListener('click', () => {
    musicEnabled = !musicEnabled;
    localStorage.setItem('dds-music', musicEnabled ? 'on' : 'off');
    syncMusic();
    refresh();
  });
  effectsButton.addEventListener('click', () => {
    effectsEnabled = !effectsEnabled;
    localStorage.setItem('dds-effects', effectsEnabled ? 'on' : 'off');
    if (!effectsEnabled) Object.values(effects).forEach(sound => sound.pause());
    refresh();
  });
  refresh();
  return refresh;
}

export function playEffect(action: keyof typeof effectVolumes) {
  if (!effectsEnabled) return;
  if (action === 'death')
    Object.values(effects).forEach(sound => sound.pause());
  const sound = effects[action];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
