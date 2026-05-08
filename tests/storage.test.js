import test from 'node:test';
import assert from 'node:assert/strict';
import { __clearMemoryStoreForTests, getSettings, saveSettings, storageGet, storageSet } from '../lib/storage.js';

test('storage fallback stores values without chrome API', async () => {
  __clearMemoryStoreForTests();
  await storageSet({ a: 1 });
  assert.deepEqual(await storageGet('a'), { a: 1 });
});

test('settings are merged with defaults', async () => {
  __clearMemoryStoreForTests();
  await saveSettings({ ai: { enabled: true } });
  const settings = await getSettings();
  assert.equal(settings.ai.enabled, true);
  assert.equal(settings.safety.snapshotRetention, 10);
});
