// ============================================
// lang.js
// Complete multi-language system
// Supports: English (en), Hindi (hi), Bengali (bn)
// ============================================

const SUPPORTED_LANGS = ["en", "hi", "bn"];
const DEFAULT_LANG = "en";
const STORAGE_KEY = "preferred_lang";

// Current state
let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
let translations = {};
let isLoaded = false;

// ---- Load a language file ----
export async function loadLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;

  try {
    const res = await fetch(`lang/${lang}.json?v=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    translations = await res.json();
    currentLang = lang;
    isLoaded = true;

    // Persist preference
    localStorage.setItem(STORAGE_KEY, lang);

    // Apply to DOM
    applyTranslations();
    updateLangButtons();
    updateHtmlLang();

    // Dispatch event so other scripts can react
    window.dispatchEvent(new CustomEvent("langChanged", { detail: { lang } }));

    // Smooth fade when language changes
    document.body.style.opacity = "0.7";
    setTimeout(() => {
      document.body.style.opacity = "1";
      document.body.style.transition = "opacity 0.2s ease";
    }, 50);

    return true;
  } catch (err) {
    console.error(`Language load failed (${lang}):`, err);
    // Fall back to English
    if (lang !== DEFAULT_LANG) return loadLanguage(DEFAULT_LANG);
    return false;
  }
}

// ---- Translate a key ----
// Usage: t('nav.home') → 'Home' or 'होम'
export function t(keyPath) {
  const keys = keyPath.split(".");
  let value = translations;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return keyPath; // fallback = key itself
  }
  return value || keyPath;
}

// ---- Apply translations to the entire DOM ----
export function applyTranslations() {
  // Elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = t(key);
    if (text !== key) el.textContent = text;
  });

  // Placeholders with data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const text = t(key);
    if (text !== key) el.placeholder = text;
  });

  // Titles with data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const text = t(key);
    if (text !== key) el.title = text;
  });

  // Aria-labels with data-i18n-aria
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const text = t(key);
    if (text !== key) el.setAttribute("aria-label", text);
  });
}

// ---- Update lang button active states ----
function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

// ---- Update <html lang=""> attribute ----
function updateHtmlLang() {
  const langMap = { en: "en", hi: "hi", bn: "bn" };
  document.documentElement.lang = langMap[currentLang] || "en";
}

// ---- Get current language ----
export function getCurrentLang() {
  return currentLang;
}

// ---- Init language switcher buttons ----
export function initLangSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (lang !== currentLang) loadLanguage(lang);
    });
  });
}

// ---- Format date in current language ----
export function formatDateLocale(date) {
  const localeMap = { en: "en-IN", hi: "hi-IN", bn: "bn-IN" };
  const locale = localeMap[currentLang] || "en-IN";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---- Format number in current language ----
export function formatNumber(num) {
  const localeMap = { en: "en-IN", hi: "hi-IN", bn: "bn-IN" };
  return new Intl.NumberFormat(localeMap[currentLang] || "en-IN").format(num);
}
