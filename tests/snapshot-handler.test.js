import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSnapshotMessage } from '../background/handlers/snapshot-handler.js';
import { buildSummaryFromInventory } from '../lib/bookmarks.js';
import { __clearMemoryStoreForTests, getSummary, saveSummary } from '../lib/storage.js';

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
        title: `Snapshot bookmark ${index + 1}`,
        url: `https://example.com/snapshot-${index + 1}`,
        dateAdded: index + 1
      }))
    }]
  }];
}

function createRequest() {
  return {
    result: undefined,
    error: null,
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  };
}

function installIndexedDbMock() {
  const stores = new Map();

  function ensureStore(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    return stores.get(name);
  }

  const db = {
    objectStoreNames: {
      contains: (name) => stores.has(name)
    },
    createObjectStore: (name) => ensureStore(name),
    transaction: (name) => ({
      objectStore: () => ({
        put: (record) => {
          ensureStore(name).set(record.id, structuredClone(record));
          queueMicrotask(() => db.currentTransaction?.oncomplete?.());
        },
        get: (id) => {
          const request = createRequest();
          queueMicrotask(() => {
            request.result = ensureStore(name).get(id);
            request.onsuccess?.();
          });
          return request;
        },
        getAll: () => {
          const request = createRequest();
          queueMicrotask(() => {
            request.result = Array.from(ensureStore(name).values()).map((value) => structuredClone(value));
            request.onsuccess?.();
          });
          return request;
        },
        openCursor: () => {
          const request = createRequest();
          const values = Array.from(ensureStore(name).values()).map((value) => structuredClone(value));
          let index = 0;
          const step = () => {
            if (index >= values.length) {
              request.result = null;
            } else {
              request.result = {
                value: values[index++],
                continue: () => queueMicrotask(step)
              };
            }
            request.onsuccess?.();
          };
          queueMicrotask(step);
          return request;
        }
      }),
      set oncomplete(callback) {
        db.currentTransaction = { oncomplete: callback };
      },
      get oncomplete() {
        return db.currentTransaction?.oncomplete;
      },
      onerror: null
    })
  };

  globalThis.indexedDB = {
    open: () => {
      const request = createRequest();
      request.result = db;
      queueMicrotask(() => {
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    }
  };
}

function installChromeMock(bookmarkCount) {
  globalThis.chrome = {
    bookmarks: {
      getTree: async () => buildBookmarkTree(bookmarkCount)
    }
  };
}

test('snapshot metadata listing does not include full tree payloads', async (t) => {
  __clearMemoryStoreForTests();
  installIndexedDbMock();
  installChromeMock(3);
  t.after(() => {
    delete globalThis.chrome;
    delete globalThis.indexedDB;
    __clearMemoryStoreForTests();
  });

  const first = await handleSnapshotMessage({ type: 'snapshots.create', payload: { name: 'Before cleanup' } });
  await handleSnapshotMessage({ type: 'snapshots.create', payload: { name: 'Before restore' } });
  const metadata = await handleSnapshotMessage({ type: 'snapshots.listMetadata' });
  const legacyMetadata = await handleSnapshotMessage({ type: 'snapshots.list' });

  assert.equal(metadata.length, 2);
  assert.equal(legacyMetadata.length, 2);
  assert.equal(metadata.some((snapshot) => 'tree' in snapshot), false);
  assert.equal(legacyMetadata.some((snapshot) => 'tree' in snapshot), false);
  assert.deepEqual(Object.keys(metadata[0]).sort(), ['bookmarkCount', 'createdAt', 'id', 'name', 'sizeBytes'].sort());
  assert.equal(metadata[0].id, first.id);
  assert.equal(metadata[0].name, 'Before cleanup');
  assert.equal(metadata[0].bookmarkCount, 3);
  assert.ok(metadata[0].sizeBytes > 0);
  assert.equal('tree' in metadata[0], false);
});

test('snapshots.get returns the full tree for restore flows', async (t) => {
  __clearMemoryStoreForTests();
  installIndexedDbMock();
  installChromeMock(2);
  t.after(() => {
    delete globalThis.chrome;
    delete globalThis.indexedDB;
    __clearMemoryStoreForTests();
  });

  const created = await handleSnapshotMessage({ type: 'snapshots.create', payload: { name: 'Restore point' } });
  const snapshot = await handleSnapshotMessage({ type: 'snapshots.get', payload: { id: created.id } });

  assert.equal(snapshot.id, created.id);
  assert.equal(snapshot.name, 'Restore point');
  assert.deepEqual(snapshot.tree, created.tree);
  assert.equal(snapshot.tree[0].children[0].children.length, 2);
});


test('snapshots.create updates the summary cache with latest snapshot metadata', async (t) => {
  __clearMemoryStoreForTests();
  installIndexedDbMock();
  installChromeMock(4);
  await saveSummary({
    duplicateCount: 7,
    brokenCount: 2,
    staleCount: 3,
    lastHealthCheckAt: '2026-05-07T00:00:00.000Z'
  });
  t.after(() => {
    delete globalThis.chrome;
    delete globalThis.indexedDB;
    __clearMemoryStoreForTests();
  });

  const created = await handleSnapshotMessage({ type: 'snapshots.create', payload: { name: 'Current snapshot' } });
  const cached = await getSummary();
  const summary = buildSummaryFromInventory({ bookmarks: [], folders: [] }, cached);

  assert.equal(cached.lastSnapshotAt, created.createdAt);
  assert.equal(cached.lastSnapshotId, created.id);
  assert.equal(cached.lastSnapshotBookmarkCount, 4);
  assert.equal(cached.duplicateCount, 7);
  assert.equal(cached.brokenCount, 2);
  assert.equal(cached.staleCount, 3);
  assert.equal(cached.lastHealthCheckAt, '2026-05-07T00:00:00.000Z');
  assert.equal(summary.lastSnapshotAt, created.createdAt);
  assert.equal(summary.lastSnapshotId, created.id);
  assert.equal(summary.lastSnapshotBookmarkCount, 4);
});
