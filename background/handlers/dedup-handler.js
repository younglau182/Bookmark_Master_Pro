import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { findDuplicateGroups } from '../../lib/deduplicator.js';

export async function handleDedupMessage(message) {
  if (message?.type !== 'dedup.preview') return undefined;
  const inventory = await getBookmarkInventory();
  const groups = findDuplicateGroups(inventory.bookmarks, message.payload?.strategy);
  return { groups, duplicateCount: groups.reduce((sum, group) => sum + group.items.length - 1, 0) };
}
