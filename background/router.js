import { handleBookmarksMessage } from './handlers/bookmarks-handler.js';
import { handleSearchMessage } from './handlers/search-handler.js';
import { handleSettingsMessage } from './handlers/settings-handler.js';
import { handleTaskMessage } from './handlers/health-handler.js';
import { handleDedupMessage } from './handlers/dedup-handler.js';
import { handleOrganizeMessage } from './handlers/organize-handler.js';
import { handleSnapshotMessage } from './handlers/snapshot-handler.js';
import { handleRecycleMessage } from './handlers/recycle-handler.js';
import { handleReportMessage } from './handlers/report-handler.js';

const handlers = [
  handleBookmarksMessage,
  handleSearchMessage,
  handleSettingsMessage,
  handleTaskMessage,
  handleDedupMessage,
  handleOrganizeMessage,
  handleSnapshotMessage,
  handleRecycleMessage,
  handleReportMessage
];

export async function routeMessage(message, sender) {
  for (const handler of handlers) {
    const response = await handler(message, sender);
    if (response !== undefined) return { ok: true, data: response };
  }
  return { ok: false, error: `Unknown message type: ${message?.type}` };
}
