import { buildSummaryFromInventory, getBookmarkInventory } from '../../lib/bookmarks.js';
import { getSummary, saveSummary } from '../../lib/storage.js';

export async function handleBookmarksMessage(message) {
  if (message?.type === 'bookmarks.getInventory') {
    return getBookmarkInventory();
  }
  if (message?.type === 'bookmarks.getSummary') {
    const inventory = await getBookmarkInventory();
    const cached = (await getSummary()) || {};
    const summary = buildSummaryFromInventory(inventory, cached);
    await saveSummary(summary);
    return summary;
  }
  if (message?.type === 'bookmarks.addCurrent') {
    const { title, url, parentId = '1' } = message.payload || {};
    if (!title || !url) throw new Error('Missing title or url.');
    return chrome.bookmarks.create({ title, url, parentId });
  }
  if (message?.type === 'bookmarks.findByUrl') {
    const { url } = message.payload || {};
    if (!url) return [];
    return chrome.bookmarks.search({ url });
  }
  if (message?.type === 'bookmarks.update') {
    const { id, changes } = message.payload || {};
    if (!id || !changes) throw new Error('Missing bookmark update payload.');
    return chrome.bookmarks.update(id, changes);
  }
}
