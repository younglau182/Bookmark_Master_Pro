import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { findDuplicateGroups } from '../../lib/deduplicator.js';
import { patchSummary } from '../../lib/storage.js';

export async function handleDedupMessage(message) {
  if (message?.type !== 'dedup.preview') return undefined;
  const inventory = await getBookmarkInventory();
  const groups = findDuplicateGroups(inventory.bookmarks, message.payload?.strategy);
  const duplicateCount = groups.reduce((sum, group) => sum + group.items.length - 1, 0);
  await patchSummary({ duplicateCount, duplicateScannedAt: new Date().toISOString() });
  return { groups, duplicateCount };
}
