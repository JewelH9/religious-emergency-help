// ============================================
// search.js
// Real-time search across all guide content
// ============================================

import { buildSearchIndex } from "./db.js";

// Cache the index so we only fetch once per session
let searchIndex = null;
let isIndexReady = false;

// ---- Build index on first call ----
export async function initSearchIndex() {
  if (isIndexReady) return true;
  try {
    searchIndex = await buildSearchIndex();
    isIndexReady = true;
    return true;
  } catch (err) {
    console.error("Search index failed:", err);
    return false;
  }
}

// ---- Main search function ----
export function searchGuides(query) {
  if (!query || query.trim().length < 2) return [];
  if (!searchIndex) return [];

  const q = query.toLowerCase().trim();

  return searchIndex.filter((item) => {
    const searchText = [item.religion, item.type, item.title, item.detail]
      .join(" ")
      .toLowerCase();

    return searchText.includes(q);
  });
}

// ---- Group results by religion ----
export function groupByReligion(results) {
  const groups = {};
  results.forEach((r) => {
    if (!groups[r.religion]) {
      groups[r.religion] = {
        religion: r.religion,
        icon: r.icon,
        color: r.color,
        items: [],
      };
    }
    groups[r.religion].items.push(r);
  });
  return Object.values(groups);
}

// ---- Get search suggestions (top 5) ----
export function getSuggestions(query) {
  const results = searchGuides(query);
  return results.slice(0, 5);
}
