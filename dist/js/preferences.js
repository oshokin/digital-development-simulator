const themeKey = 'oshokin-theme';
const langKey = 'oshokin-lang';

export function getLanguage() {
  const saved = localStorage.getItem(langKey);
  return ['en', 'ru', 'es'].includes(saved) ? saved : 'en';
}

export function setLanguage(lang) {
  if (!['en', 'ru', 'es'].includes(lang)) return;
  localStorage.setItem(langKey, lang);
  document.documentElement.lang = lang;
  document.dispatchEvent(new CustomEvent('app:language', { detail: lang }));
}

export function getTheme() {
  const saved = localStorage.getItem(themeKey);
  return ['system', 'light', 'dark'].includes(saved) ? saved : 'system';
}

export function effectiveTheme() {
  return getTheme() === 'system'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : getTheme();
}

export function applyTheme() {
  document.documentElement.dataset.theme = effectiveTheme();
  document.documentElement.dataset.themeChoice = getTheme();
  document.dispatchEvent(new CustomEvent('app:theme', { detail: effectiveTheme() }));
}

export function setTheme(theme) {
  if (!['system', 'light', 'dark'].includes(theme)) return;
  localStorage.setItem(themeKey, theme);
  applyTheme();
}

export function initPreferences() {
  document.documentElement.lang = getLanguage();
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme();
  });
  document.querySelectorAll('[data-lang-choice]').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.langChoice));
  });
  const refresh = () => {
    document.querySelectorAll('[data-lang-choice]').forEach(button => {
      const active = button.dataset.langChoice === getLanguage();
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  document.addEventListener('app:language', refresh);
  document.addEventListener('app:theme', refresh);
  refresh();
}
