import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { searchBookmarks } from '../../lib/search.js';
import { storageSet } from '../../lib/storage.js';
import { STORAGE_KEYS } from '../../lib/constants.js';

export async function handleSearchMessage(message) {
  if (message?.type !== 'search.query') return undefined;
  const filters = message.payload || {};
  const inventory = await getBookmarkInventory();
  const allResults = searchBookmarks(inventory.bookmarks, filters);
  const limit = filters.limit || 250;
  const results = allResults.slice(0, limit);
  await storageSet({
    [STORAGE_KEYS.LAST_SEARCH]: {
      filters,
      resultCount: allResults.length,
      returnedCount: results.length,
      searchedAt: new Date().toISOString()
    }
  });
  return { results, total: allResults.length, returnedCount: results.length };
}
