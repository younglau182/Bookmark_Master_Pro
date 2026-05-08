import { getBookmarkTree } from '../../lib/bookmarks.js';
import { putRecord, getAllRecords } from '../../lib/db.js';

export async function handleSnapshotMessage(message) {
  if (message?.type === 'snapshots.list') return getAllRecords('snapshots');
  if (message?.type === 'snapshots.create') {
    const tree = await getBookmarkTree();
    const snapshot = {
      id: `snapshot-${Date.now()}`,
      name: message.payload?.name || `手动快照 ${new Date().toLocaleString()}`,
      reason: message.payload?.reason || 'manual',
      tree,
      createdAt: new Date().toISOString()
    };
    return putRecord('snapshots', snapshot);
  }
}
