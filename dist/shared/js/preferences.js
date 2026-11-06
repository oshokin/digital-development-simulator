// Generated from src/ by npm run build. Do not edit.
const themeKey = "oshokin-theme";
const langKey = "oshokin-lang";
function getLanguage() {
  const saved = localStorage.getItem(langKey);
  return saved === "en" || saved === "ru" || saved === "es" ? saved : "en";
}
function setLanguage(lang) {
  if (lang !== "en" && lang !== "ru" && lang !== "es") return;
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
  applyTheme,
  effectiveTheme,
  getLanguage,
  getTheme,
  initPreferences,
  setLanguage,
  setTheme
};
