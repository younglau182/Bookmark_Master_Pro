import test from 'node:test';
import assert from 'node:assert/strict';
import { handleBookmarksMessage } from '../background/handlers/bookmarks-handler.js';
import { handleDedupMessage } from '../background/handlers/dedup-handler.js';
import { STORAGE_KEYS } from '../lib/constants.js';
import { __clearMemoryStoreForTests, storageGet } from '../lib/storage.js';

function installChromeBookmarkMock() {
  globalThis.chrome = {
    bookmarks: {
      getTree: async () => [{
        id: '0',
        title: '',
        children: [{
          id: '1',
          parentId: '0',
          title: 'Bookmarks Bar',
          children: [
            { id: '2', parentId: '1', title: 'A', url: 'https://www.example.com/?utm_source=test', dateAdded: 1 },
            { id: '3', parentId: '1', title: 'A duplicate', url: 'https://example.com/', dateAdded: 2 },
            { id: '4', parentId: '1', title: 'B', url: 'https://other.example.test/', dateAdded: 3 }
          ]
        }]
      }]
    }
  };
}

test('dedup preview updates summary cache and bookmarks summary reports duplicate count', async (t) => {
  __clearMemoryStoreForTests();
  installChromeBookmarkMock();
  t.after(() => {
    delete globalThis.chrome;
    __clearMemoryStoreForTests();
  });

  const preview = await handleDedupMessage({ type: 'dedup.preview', payload: { strategy: 'normalized_url' } });
  const cached = (await storageGet({ [STORAGE_KEYS.SUMMARY]: null }))[STORAGE_KEYS.SUMMARY];
  const summary = await handleBookmarksMessage({ type: 'bookmarks.getSummary' });

  assert.equal(preview.duplicateCount, 1);
  assert.equal(cached.duplicateCount, 1);
  assert.match(cached.duplicateScannedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(summary.duplicateCount, 1);
});
