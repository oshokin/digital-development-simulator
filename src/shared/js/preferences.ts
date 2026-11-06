const themeKey = 'oshokin-theme';
const langKey = 'oshokin-lang';

export const LANGUAGES = ['en', 'ru', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some(language => language === value);
}

export function getLanguage() {
  const saved = localStorage.getItem(langKey);
  return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}

export function setLanguage(lang: string | null) {
  if (!isLanguage(lang)) return;
  localStorage.setItem(langKey, lang);
  document.documentElement.lang = lang;
  document.dispatchEvent(new CustomEvent('app:language', { detail: lang }));
}

export function getTheme() {
  const saved = localStorage.getItem(themeKey);
  return saved === 'system' || saved === 'light' || saved === 'dark'
    ? saved
    : 'system';
}

export function effectiveTheme() {
  return getTheme() === 'system'
    ? matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : getTheme();
}

export function applyTheme() {
  document.documentElement.dataset.theme = effectiveTheme();
  document.documentElement.dataset.themeChoice = getTheme();
  document.dispatchEvent(
    new CustomEvent('app:theme', { detail: effectiveTheme() })
  );
}

export function setTheme(theme: string) {
  if (!['system', 'light', 'dark'].includes(theme)) return;
  localStorage.setItem(themeKey, theme);
  applyTheme();
}

export function cycleTheme() {
  const themes = ['system', 'light', 'dark'] as const;
  setTheme(themes[(themes.indexOf(getTheme()) + 1) % themes.length]);
}

const themeNames = {
  en: { system: 'Auto', light: 'Light', dark: 'Dark' },
  ru: { system: 'Авто', light: 'Светлая', dark: 'Тёмная' },
  es: { system: 'Auto', light: 'Claro', dark: 'Oscuro' }
} satisfies Record<Language, Record<ReturnType<typeof getTheme>, string>>;

export function themeLabel(language: Language) {
  return themeNames[language][getTheme()];
}

export function initPreferences() {
  document.documentElement.lang = getLanguage();
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getTheme() === 'system') applyTheme();
  });
  document.querySelectorAll('[data-lang-choice]').forEach(button => {
    button.addEventListener('click', () =>
      setLanguage(button.getAttribute('data-lang-choice'))
    );
  });
  const refresh = () => {
    document.querySelectorAll('[data-lang-choice]').forEach(button => {
      const active = button.getAttribute('data-lang-choice') === getLanguage();
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };
  document.addEventListener('app:language', refresh);
  document.addEventListener('app:theme', refresh);
  refresh();
}
