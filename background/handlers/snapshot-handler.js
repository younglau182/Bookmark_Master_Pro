import { flattenBookmarkTree, getBookmarkTree } from '../../lib/bookmarks.js';
import { getAllSnapshotMetadata, getRecord, putRecord } from '../../lib/db.js';

function createSnapshotId() {
  if (globalThis.crypto?.randomUUID) return `snapshot-${globalThis.crypto.randomUUID()}`;
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getTreeSizeBytes(tree) {
  const serialized = JSON.stringify(tree);
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(serialized).length;
  return serialized.length;
}

export async function handleSnapshotMessage(message) {
  if (message?.type === 'snapshots.list' || message?.type === 'snapshots.listMetadata') {
    return getAllSnapshotMetadata();
  }

  if (message?.type === 'snapshots.get') {
    const id = message.payload?.id;
    if (!id) throw new Error('Snapshot id is required.');
    return getRecord('snapshots', id);
  }

  if (message?.type === 'snapshots.create') {
    const tree = await getBookmarkTree();
    const snapshot = {
      id: createSnapshotId(),
      name: message.payload?.name || `手动快照 ${new Date().toLocaleString()}`,
      reason: message.payload?.reason || 'manual',
      tree,
      bookmarkCount: flattenBookmarkTree(tree).bookmarks.length,
      sizeBytes: getTreeSizeBytes(tree),
      createdAt: new Date().toISOString()
    };
    return putRecord('snapshots', snapshot);
  }
}
