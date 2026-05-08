import { getAllRecords } from '../../lib/db.js';

export async function handleRecycleMessage(message) {
  if (message?.type === 'recycle.list') return getAllRecords('recycleBin');
}
