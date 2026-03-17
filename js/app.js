// ============================================
// app.js — Core Application Bootstrap
// Runs on every page via <script src="js/app.js">
// ============================================

// NOTE: app.js is a regular script (not a module)
// so it uses dynamic import for the lang module

// ---- Language init (runs on every page) ----
async function bootLanguage() {
  try {
    const mod = await import("./js/lang.js");
    const savedLang = localStorage.getItem("preferred_lang") || "en";
    await mod.loadLanguage(savedLang);
    mod.initLangSwitcher();

    // Make t() globally available for inline scripts
    window.t = mod.t;
  } catch (err) {
    console.warn("Language system init failed:", err);
  }
}

// ---- Mobile Navigation ----
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    // Animate hamburger
    toggle.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle.classList.remove("open");
    });
  });

  // Close nav when clicking outside
  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
      toggle.classList.remove("open");
    }
  });
}

// ---- Active Nav Link ----
function setActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href")?.split("?")[0];
    link.classList.toggle("active", href === page);
  });
}

// ---- Toast Notification ----
window.showToast = function (message, type = "default", duration = 3000) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  // Set colour by type
  const colors = {
    default: "#0f172a",
    success: "#166534",
    error: "#991b1b",
    warning: "#92400e",
  };
  toast.style.background = colors[type] || colors.default;
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
};

// ---- Auth state from localStorage (non-Firebase pages) ----
function syncAuthNav() {
  const authBtn = document.getElementById("authBtn");
  const savedEmail = localStorage.getItem("userEmail");
  const savedName = localStorage.getItem("userDisplayName");

  if (authBtn && savedEmail) {
    authBtn.textContent = `👤 ${savedName || savedEmail.split("@")[0]}`;
    authBtn.href = "bookmarks.html";
  }
}

// ---- Utility: Get URL param ----
window.getParam = function (name) {
  return new URLSearchParams(window.location.search).get(name);
};

// ---- Utility: Format date ----
window.formatDate = function (timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ---- Loading overlay ----
window.showLoading = function () {
  const el = document.createElement("div");
  el.className = "loading-overlay";
  el.id = "loading-overlay";
  el.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(el);
};
window.hideLoading = function () {
  document.getElementById("loading-overlay")?.remove();
};

// ---- Boot on DOM ready ----
document.addEventListener("DOMContentLoaded", () => {
  bootLanguage();
  initMobileNav();
  setActiveNav();
  syncAuthNav();
});
