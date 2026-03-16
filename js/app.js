// ============================================
// app.js — Core Application Bootstrap
// Runs on every page
// ============================================

// ---------- Language System ----------
const SUPPORTED_LANGS = ["en", "hi", "bn"];
const DEFAULT_LANG = "en";

let currentLang = localStorage.getItem("lang") || DEFAULT_LANG;
let translations = {};

async function loadLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  try {
    const res = await fetch(`lang/${lang}.json`);
    translations = await res.json();
    currentLang = lang;
    localStorage.setItem("lang", lang);
    applyTranslations();
    updateLangButtons();
  } catch (err) {
    console.error("Failed to load language file:", err);
  }
}

function t(keyPath) {
  // keyPath like "nav.home" or "common.loading"
  const keys = keyPath.split(".");
  let value = translations;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return keyPath;
  }
  return value || keyPath;
}

function applyTranslations() {
  // Apply to any element with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
  // Apply to placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });
}

function updateLangButtons() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function initLanguageSwitcher() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      loadLanguage(btn.dataset.lang);
    });
  });
}

// ---------- Toast Notification ----------
function showToast(message, duration = 3000) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), duration);
}

// ---------- Mobile Navigation ----------
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
    });
  });
}

// ---------- Active Navigation Link ----------
function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === currentPage);
  });
}

// ---------- Utility: Format Date ----------
function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString(currentLang === "en" ? "en-IN" : currentLang, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------- Utility: Get URL Param ----------
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// ---------- Loading State ----------
function showLoading() {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.id = "loading-overlay";
  overlay.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(overlay);
}

function hideLoading() {
  document.getElementById("loading-overlay")?.remove();
}

// ---------- App Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  await loadLanguage(currentLang);
  initMobileNav();
  setActiveNav();
  initLanguageSwitcher();
});
