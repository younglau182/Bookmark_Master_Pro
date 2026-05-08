import { normalizeUrl } from './url-utils.js';

export function findDuplicateGroups(bookmarks, strategy = 'normalized_url') {
  const groups = new Map();
  bookmarks.forEach((bookmark) => {
    const key = strategy === 'exact_url' ? bookmark.url : normalizeUrl(bookmark.url);
    if (!key) return;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(bookmark);
  });
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({ key, items, keepId: chooseKeepBookmark(items)?.id }));
}

export function chooseKeepBookmark(items, strategy = 'newest') {
  if (!items.length) return null;
  if (strategy === 'shortest_url') return [...items].sort((a, b) => a.url.length - b.url.length)[0];
  return [...items].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))[0];
}
