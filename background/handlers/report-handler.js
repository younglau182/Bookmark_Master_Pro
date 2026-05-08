import { getBookmarkInventory } from '../../lib/bookmarks.js';
import { getSummary } from '../../lib/storage.js';
import { buildHealthReport } from '../../lib/report-generator.js';

export async function handleReportMessage(message) {
  if (message?.type !== 'reports.build') return undefined;
  const inventory = await getBookmarkInventory();
  return buildHealthReport(await getSummary(), inventory.bookmarks);
}
