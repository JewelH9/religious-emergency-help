// ============================================
// auth.js
// Handles all authentication logic
// ============================================

import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---- Auth State Observer ----
// This runs on EVERY page that imports auth.js
// It automatically updates the navbar and buttons
export function initAuthObserver() {
  onAuthStateChanged(auth, (user) => {
    updateNavForUser(user);
  });
}

// ---- Update Navbar Based on Auth State ----
function updateNavForUser(user) {
  const authBtn = document.getElementById("authBtn");
  const adminLink = document.getElementById("adminLink");

  if (!authBtn) return;

  if (user) {
    // User is signed in
    const displayName = user.displayName || user.email.split("@")[0];

    authBtn.textContent = `👤 ${displayName}`;
    authBtn.href = "bookmarks.html";

    // Show admin link only for admin email
    // Replace with YOUR admin email address
    const ADMIN_EMAIL = "admin@yourdomain.com";
    if (adminLink) {
      adminLink.style.display =
        user.email === ADMIN_EMAIL ? "inline-flex" : "none";
    }

    // Save minimal user info to localStorage
    // (used by pages that don't import Firebase)
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("userDisplayName", displayName);
  } else {
    // User is signed out
    authBtn.textContent = "Sign In";
    authBtn.href = "login.html";
    if (adminLink) adminLink.style.display = "none";

    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userDisplayName");
  }
}

// ---- Sign Up ----
export async function signUp(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Set the display name
    await updateProfile(userCredential.user, {
      displayName: displayName,
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ---- Sign In ----
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ---- Sign Out ----
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ---- Password Reset ----
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ---- Get Current User ----
export function getCurrentUser() {
  return auth.currentUser;
}

// ---- Require Auth (redirect if not logged in) ----
export function requireAuth(redirectUrl = "login.html") {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href =
        redirectUrl + "?next=" + encodeURIComponent(window.location.pathname);
    }
  });
}

// ---- Friendly Error Messages ----
function getErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use":
      "This email is already registered. Please sign in.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed":
      "Network error. Please check your connection.",
    "auth/invalid-credential": "Invalid email or password. Please try again.",
  };
  return messages[code] || "An error occurred. Please try again.";
}
