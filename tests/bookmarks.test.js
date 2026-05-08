import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSummaryFromInventory } from '../lib/bookmarks.js';

test('buildSummaryFromInventory computes duplicate bookmarks from normalized URL groups', () => {
  const inventory = {
    bookmarks: [
      { id: '1', title: 'Example', url: 'https://www.example.com/?utm_source=newsletter', dateAdded: 1 },
      { id: '2', title: 'Example canonical', url: 'https://example.com/', dateAdded: 2 },
      { id: '3', title: 'Example trailing slash', url: 'https://example.com/#section', dateAdded: 3 },
      { id: '4', title: 'Docs', url: 'https://docs.example.test/page', dateAdded: 4 },
      { id: '5', title: 'Docs duplicate', url: 'https://docs.example.test/page/', dateAdded: 5 },
      { id: '6', title: 'Unique', url: 'https://unique.example.test/', dateAdded: 6 }
    ],
    folders: [{ id: '0', title: 'root' }, { id: '1', title: 'Bookmarks Bar' }]
  };

  const summary = buildSummaryFromInventory(inventory, {
    duplicateCount: 0,
    brokenCount: 2,
    staleCount: 4,
    lastSnapshotAt: '2026-05-08T00:00:00.000Z'
  });

  assert.equal(summary.totalBookmarks, 6);
  assert.equal(summary.folderCount, 1);
  assert.equal(summary.duplicateCount, 3);
  assert.equal(summary.brokenCount, 2);
  assert.equal(summary.staleCount, 4);
  assert.equal(summary.lastSnapshotAt, '2026-05-08T00:00:00.000Z');
});
