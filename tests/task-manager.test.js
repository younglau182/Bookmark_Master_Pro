import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskManager } from '../background/task-manager.js';
import { STORAGE_KEYS } from '../lib/constants.js';

function createTask(id, updatedAt = '2026-01-01T00:00:00.000Z') {
  return {
    id,
    type: 'health_check',
    status: 'pending',
    progress: 0,
    current: 0,
    total: 1,
    message: 'saved task',
    createdAt: updatedAt,
    updatedAt,
    payload: {},
    result: null,
    error: null
  };
}

function createStorageArea({ values = {}, shouldThrow = false, calls }) {
  return {
    get: async (keys) => {
      calls.get += 1;
      if (shouldThrow) throw new Error('storage read failed');
      if (typeof keys === 'string') return { [keys]: values[keys] };
      if (Array.isArray(keys)) return Object.fromEntries(keys.map((key) => [key, values[key]]));
      return Object.fromEntries(
        Object.entries(keys).map(([key, fallback]) => [key, values[key] ?? fallback])
      );
    },
    set: async () => {},
    remove: async () => {}
  };
}

function installStorageMock({ sessionTasks, localTasks, sessionThrows = false }) {
  const calls = {
    session: { get: 0 },
    local: { get: 0 }
  };
  globalThis.chrome = {
    storage: {
      session: createStorageArea({
        values: sessionTasks === undefined ? {} : { [STORAGE_KEYS.TASKS]: sessionTasks },
        shouldThrow: sessionThrows,
        calls: calls.session
      }),
      local: createStorageArea({
        values: localTasks === undefined ? {} : { [STORAGE_KEYS.TASKS]: localTasks },
        calls: calls.local
      })
    }
  };
  return calls;
}

async function restoreWithMock(options) {
  const calls = installStorageMock(options);
  const manager = new TaskManager();
  const tasks = await manager.listTasks();
  return { calls, manager, tasks };
}

test('restoreTaskProgress loads local fallback when session returns an empty task list', async (t) => {
  t.after(() => {
    delete globalThis.chrome;
  });

  const localTasks = [createTask('local-1'), createTask('local-2', '2026-01-02T00:00:00.000Z')];
  const { calls, manager, tasks } = await restoreWithMock({ sessionTasks: [], localTasks });

  assert.equal(manager.restored, true);
  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks.map((task) => task.id), ['local-2', 'local-1']);
  assert.equal(calls.session.get, 1);
  assert.equal(calls.local.get, 1);
});

test('restoreTaskProgress loads local fallback when session read throws', async (t) => {
  t.after(() => {
    delete globalThis.chrome;
  });

  const localTasks = [createTask('local-only')];
  const { calls, manager, tasks } = await restoreWithMock({
    sessionTasks: [],
    localTasks,
    sessionThrows: true
  });

  assert.equal(manager.restored, true);
  assert.equal(tasks.length, 1);
  assert.equal(tasks[0].id, 'local-only');
  assert.equal(calls.session.get, 1);
  assert.equal(calls.local.get, 1);
});

test('restoreTaskProgress prefers non-empty session tasks and does not read local', async (t) => {
  t.after(() => {
    delete globalThis.chrome;
  });

  const sessionTasks = [
    createTask('session-1', '2026-01-01T00:00:00.000Z'),
    createTask('session-2', '2026-01-02T00:00:00.000Z'),
    createTask('session-3', '2026-01-03T00:00:00.000Z')
  ];
  const localTasks = [createTask('local-1'), createTask('local-2')];
  const { calls, manager, tasks } = await restoreWithMock({ sessionTasks, localTasks });

  assert.equal(manager.restored, true);
  assert.equal(tasks.length, 3);
  assert.deepEqual(tasks.map((task) => task.id), ['session-3', 'session-2', 'session-1']);
  assert.equal(calls.session.get, 1);
  assert.equal(calls.local.get, 0);
});

test('restoreTaskProgress marks restored with no error when both stores are empty', async (t) => {
  t.after(() => {
    delete globalThis.chrome;
  });

  const { calls, manager, tasks } = await restoreWithMock({ sessionTasks: [], localTasks: [] });

  assert.equal(manager.restored, true);
  assert.deepEqual(tasks, []);
  assert.equal(calls.session.get, 1);
  assert.equal(calls.local.get, 1);
});
