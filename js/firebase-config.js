// ============================================
// firebase-config.js
// Firebase initialization — used by all pages
// ============================================

// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── PASTE YOUR CONFIG HERE ───────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDrS6Oz8NmWjBIE9iKfyfgffZ3SGgvKu0M",
  authDomain: "religious-emergency-help.firebaseapp.com",
  projectId: "religious-emergency-help",
  storageBucket: "religious-emergency-help.firebasestorage.app",
  messagingSenderId: "943603909858",
  appId: "1:943603909858:web:e4850b746ec6bfc9ca4abb",
};
// ──────────────────────────────────────────────

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services for use in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
