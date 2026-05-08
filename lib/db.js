const DB_NAME = 'bookmark-master-pro';
const DB_VERSION = 1;
const STORES = ['snapshots', 'recycleBin', 'operationLogs', 'healthResults'];

function countBookmarksInTree(nodes = []) {
  return nodes.reduce((count, node) => {
    if (node.url) return count + 1;
    return count + countBookmarksInTree(node.children || []);
  }, 0);
}

export function openDatabase() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available in this environment.'));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORES.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function putRecord(store, record) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecord(store, id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords(store) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = db.transaction(store, 'readonly').objectStore(store).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllSnapshotMetadata() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const metadata = [];
    const request = db.transaction('snapshots', 'readonly').objectStore('snapshots').openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve(metadata);
        return;
      }
      const { id, name, createdAt, bookmarkCount, sizeBytes, tree } = cursor.value;
      metadata.push({
        id,
        name,
        createdAt,
        bookmarkCount: bookmarkCount ?? countBookmarksInTree(tree),
        ...(sizeBytes === undefined ? {} : { sizeBytes })
      });
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}
