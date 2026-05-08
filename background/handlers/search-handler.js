import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { searchBookmarks } from '../../lib/search.js';
import { storageSet } from '../../lib/storage.js';
import { STORAGE_KEYS } from '../../lib/constants.js';

export async function handleSearchMessage(message) {
  if (message?.type !== 'search.query') return undefined;
  const filters = message.payload || {};
  const inventory = await getBookmarkInventory();
  const results = searchBookmarks(inventory.bookmarks, filters).slice(0, filters.limit || 250);
  await storageSet({ [STORAGE_KEYS.LAST_SEARCH]: { filters, resultCount: results.length, searchedAt: new Date().toISOString() } });
  return { results, total: results.length };
}
