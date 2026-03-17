// ============================================
// bookmarks.js
// Bookmark save / remove / load logic
// ============================================

import { auth } from "./firebase-config.js";
import {
  saveBookmark,
  removeBookmark,
  getUserBookmarks,
  isBookmarked,
} from "./db.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---- Save a bookmark ----
export async function handleSaveBookmark(guideId, guideName, guideIcon) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        resolve({ success: false, reason: "not-logged-in" });
        return;
      }
      const result = await saveBookmark(
        user.uid,
        guideId,
        guideName,
        guideIcon,
      );
      resolve(result);
    });
  });
}

// ---- Remove a bookmark ----
export async function handleRemoveBookmark(guideId) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        resolve({ success: false, reason: "not-logged-in" });
        return;
      }
      const result = await removeBookmark(user.uid, guideId);
      resolve(result);
    });
  });
}

// ---- Check if bookmarked ----
export async function checkIfBookmarked(guideId) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        resolve(false);
        return;
      }
      const result = await isBookmarked(user.uid, guideId);
      resolve(result);
    });
  });
}

// ---- Load all bookmarks for current user ----
export async function loadUserBookmarks() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        resolve({ success: false, reason: "not-logged-in" });
        return;
      }
      const result = await getUserBookmarks(user.uid);
      resolve(result);
    });
  });
}
