import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSearchMessage } from '../background/handlers/search-handler.js';
import { STORAGE_KEYS } from '../lib/constants.js';

function buildBookmarkTree(count) {
  return [{
    id: '0',
    title: '',
    children: [{
      id: '1',
      parentId: '0',
      title: 'Bookmarks Bar',
      children: Array.from({ length: count }, (_, index) => ({
        id: String(index + 2),
        parentId: '1',
        title: `Example bookmark ${index + 1}`,
        url: `https://example.com/page-${index + 1}`,
        dateAdded: index + 1
      }))
    }]
  }];
}

function installChromeMock(bookmarkCount) {
  const storageData = new Map();
  globalThis.chrome = {
    bookmarks: {
      getTree: async () => buildBookmarkTree(bookmarkCount)
    },
    storage: {
      local: {
        get: async (keys) => {
          if (typeof keys === 'string') return { [keys]: storageData.get(keys) };
          if (Array.isArray(keys)) return Object.fromEntries(keys.map((key) => [key, storageData.get(key)]));
          return Object.fromEntries(Object.entries(keys).map(([key, fallback]) => [key, storageData.get(key) ?? fallback]));
        },
        set: async (values) => {
          Object.entries(values).forEach(([key, value]) => storageData.set(key, value));
        },
        remove: async (keys) => {
          const list = Array.isArray(keys) ? keys : [keys];
          list.forEach((key) => storageData.delete(key));
        }
      }
    }
  };
  return storageData;
}

test('search reports full match count while returning default-capped results', async (t) => {
  const storageData = installChromeMock(300);
  t.after(() => {
    delete globalThis.chrome;
  });

  const response = await handleSearchMessage({ type: 'search.query', payload: { query: 'example' } });
  const lastSearch = storageData.get(STORAGE_KEYS.LAST_SEARCH);

  assert.equal(response.total, 300);
  assert.equal(response.returnedCount, 250);
  assert.equal(response.results.length, 250);
  assert.equal(lastSearch.resultCount, 300);
  assert.equal(lastSearch.returnedCount, 250);
});

test('search reports full match count while honoring a custom return limit', async (t) => {
  const storageData = installChromeMock(300);
  t.after(() => {
    delete globalThis.chrome;
  });

  const response = await handleSearchMessage({ type: 'search.query', payload: { query: 'example', limit: 25 } });
  const lastSearch = storageData.get(STORAGE_KEYS.LAST_SEARCH);

  assert.equal(response.total, 300);
  assert.equal(response.returnedCount, 25);
  assert.equal(response.results.length, 25);
  assert.equal(lastSearch.resultCount, 300);
  assert.equal(lastSearch.returnedCount, 25);
});
