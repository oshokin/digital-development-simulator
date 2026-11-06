// Generated from src/ by npm run build. Do not edit.
const themeKey = "oshokin-theme";
const langKey = "oshokin-lang";
const LANGUAGES = ["en", "ru", "es"];
const DEFAULT_LANGUAGE = "en";
function isLanguage(value) {
  return LANGUAGES.some((language) => language === value);
}
function getLanguage() {
  const saved = localStorage.getItem(langKey);
  return isLanguage(saved) ? saved : DEFAULT_LANGUAGE;
}
function setLanguage(lang) {
  if (!isLanguage(lang)) return;
  localStorage.setItem(langKey, lang);
  document.documentElement.lang = lang;
  document.dispatchEvent(new CustomEvent("app:language", { detail: lang }));
}
function getTheme() {
  const saved = localStorage.getItem(themeKey);
  return saved === "system" || saved === "light" || saved === "dark" ? saved : "system";
}
function effectiveTheme() {
  return getTheme() === "system" ? matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : getTheme();
}
function applyTheme() {
  document.documentElement.dataset.theme = effectiveTheme();
  document.documentElement.dataset.themeChoice = getTheme();
  document.dispatchEvent(
    new CustomEvent("app:theme", { detail: effectiveTheme() })
  );
}
function setTheme(theme) {
  if (!["system", "light", "dark"].includes(theme)) return;
  localStorage.setItem(themeKey, theme);
  applyTheme();
}
function cycleTheme() {
  const themes = ["system", "light", "dark"];
  setTheme(themes[(themes.indexOf(getTheme()) + 1) % themes.length]);
}
const themeNames = {
  en: { system: "Auto", light: "Light", dark: "Dark" },
  ru: { system: "Авто", light: "Светлая", dark: "Тёмная" },
  es: { system: "Auto", light: "Claro", dark: "Oscuro" }
};
function themeLabel(language) {
  return themeNames[language][getTheme()];
}
function initPreferences() {
  document.documentElement.lang = getLanguage();
  applyTheme();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getTheme() === "system") applyTheme();
  });
  document.querySelectorAll("[data-lang-choice]").forEach((button) => {
    button.addEventListener(
      "click",
      () => setLanguage(button.getAttribute("data-lang-choice"))
    );
  });
  const refresh = () => {
    document.querySelectorAll("[data-lang-choice]").forEach((button) => {
      const active = button.getAttribute("data-lang-choice") === getLanguage();
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };
  document.addEventListener("app:language", refresh);
  document.addEventListener("app:theme", refresh);
  refresh();
}
export {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  applyTheme,
  cycleTheme,
  effectiveTheme,
  getLanguage,
  getTheme,
  initPreferences,
  isLanguage,
  setLanguage,
  setTheme,
  themeLabel
};
