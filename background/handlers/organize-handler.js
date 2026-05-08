import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { classifyBookmarks } from '../../lib/classifier.js';

export async function handleOrganizeMessage(message) {
  if (message?.type !== 'organize.suggest') return undefined;
  const inventory = await getBookmarkInventory();
  return { suggestions: classifyBookmarks(inventory.bookmarks, message.payload?.rules || []) };
}
