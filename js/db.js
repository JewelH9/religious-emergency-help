// ============================================
// db.js — All Firestore database operations
// ============================================

import { db } from "./firebase-config.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ════════════════════════════════════════════
// GUIDES
// ════════════════════════════════════════════

// Get a single guide by religion ID
export async function getGuide(religionId) {
  try {
    const snap = await getDoc(doc(db, "guides", religionId));
    if (snap.exists()) {
      return { success: true, data: { id: snap.id, ...snap.data() } };
    }
    return { success: false, error: "Guide not found" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get all guides
export async function getAllGuides() {
  try {
    const snap = await getDocs(collection(db, "guides"));
    const guides = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: guides };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Save or update a guide (admin only)
export async function saveGuide(religionId, data) {
  try {
    await setDoc(
      doc(db, "guides", religionId),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════
// BOOKMARKS
// ════════════════════════════════════════════

// Save a bookmark
export async function saveBookmark(userId, guideId, guideName, guideIcon) {
  try {
    const ref = doc(db, "bookmarks", userId, "items", guideId);
    await setDoc(ref, {
      guideId,
      guideName,
      guideIcon,
      userId,
      savedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Remove a bookmark
export async function removeBookmark(userId, guideId) {
  try {
    await deleteDoc(doc(db, "bookmarks", userId, "items", guideId));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get all bookmarks for a user
export async function getUserBookmarks(userId) {
  try {
    const snap = await getDocs(collection(db, "bookmarks", userId, "items"));
    const bookmarks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { success: true, data: bookmarks };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Check if a guide is bookmarked
export async function isBookmarked(userId, guideId) {
  try {
    const snap = await getDoc(doc(db, "bookmarks", userId, "items", guideId));
    return snap.exists();
  } catch (err) {
    return false;
  }
}

// ════════════════════════════════════════════
// USER PROFILES
// ════════════════════════════════════════════

// Create or update user profile
export async function saveUserProfile(userId, data) {
  try {
    await setDoc(
      doc(db, "users", userId),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    if (snap.exists()) {
      return { success: true, data: snap.data() };
    }
    return { success: false, error: "Profile not found" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ════════════════════════════════════════════
// SEARCH INDEX
// ════════════════════════════════════════════

// Build a flat search index from all guides
export async function buildSearchIndex() {
  const result = await getAllGuides();
  if (!result.success) return [];

  const index = [];
  for (const guide of result.data) {
    // Add immediate steps to index
    if (guide.immediateSteps) {
      guide.immediateSteps.forEach((step) => {
        index.push({
          id: guide.id,
          religion: guide.name,
          icon: guide.icon,
          color: guide.color,
          type: "Emergency Step",
          title: step.title,
          detail: step.detail,
          url: `emergency.html?r=${guide.id}`,
        });
      });
    }
    // Add prayers to index
    if (guide.prayers) {
      guide.prayers.forEach((prayer) => {
        index.push({
          id: guide.id,
          religion: guide.name,
          icon: guide.icon,
          color: guide.color,
          type: "Prayer",
          title: prayer.name,
          detail: prayer.meaning,
          url: `religion.html?r=${guide.id}&tab=prayers`,
        });
      });
    }
    // Add the guide itself
    index.push({
      id: guide.id,
      religion: guide.name,
      icon: guide.icon,
      color: guide.color,
      type: "Guide",
      title: guide.name + " Emergency Guide",
      detail: guide.subtitle,
      url: `religion.html?r=${guide.id}`,
    });
  }
  return index;
}
