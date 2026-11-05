const music = new Audio('/assets/audio/dj-perekryt-bum-bum-bam-bam.m4a');
music.loop = true;
music.preload = 'auto';
music.volume = .28;

let musicEnabled = localStorage.getItem('dds-music') !== 'off';
let effectsEnabled = localStorage.getItem('dds-effects') !== 'off';
let running = false;
const effectVolumes = {
  jump: .55, duck: .55, death: .7,
  'hit-gong': .95, 'shield-pickup': .78, 'shield-break': .82, 'coffee-pickup': .8
};
const effects = Object.fromEntries(Object.entries(effectVolumes).map(([name, volume]) => {
  const sound = new Audio(`/assets/audio/${name}.mp3`);
  sound.preload = 'auto';
  sound.volume = volume;
  return [name, sound];
}));

function syncMusic() {
  if (!musicEnabled || !running) { music.pause(); return; }
  music.play().catch(() => {});
}

export function setAudioRunning(value) {
  running = value;
  syncMusic();
}

export function restartMusic() {
  music.currentTime = 0;
}

const labels = {
  en: { music: 'Music', effects: 'Sound effects', on: 'on', off: 'off' },
  ru: { music: 'Музыка', effects: 'Эффекты', on: 'включены', off: 'выключены' },
  es: { music: 'Música', effects: 'Efectos', on: 'activados', off: 'desactivados' }
};

export function bindAudioControls(musicButton, effectsButton, getLanguage) {
  function refresh() {
    const words = labels[getLanguage()];
    for (const [button, key, enabled] of [[musicButton, 'music', musicEnabled], [effectsButton, 'effects', effectsEnabled]]) {
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

export function playEffect(action) {
  if (!effectsEnabled) return;
  if (action === 'death') Object.values(effects).forEach(sound => sound.pause());
  const sound = effects[action];
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}
