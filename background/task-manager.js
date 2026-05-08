import { STORAGE_KEYS, TASK_STATUS } from '../lib/constants.js';
import { storageGet, storageSet } from '../lib/storage.js';

export class TaskManager {
  constructor() {
    this.tasks = new Map();
    this.restored = false;
  }

  async createTask(type, payload = {}) {
    await this.restoreTaskProgress();
    const now = new Date().toISOString();
    const task = {
      id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      status: TASK_STATUS.PENDING,
      progress: 0,
      current: 0,
      total: payload.total || 0,
      message: '等待开始',
      createdAt: now,
      updatedAt: now,
      payload,
      result: null,
      error: null
    };
    this.tasks.set(task.id, task);
    await this.persistTaskProgress();
    return task;
  }

  async startTask(taskId) { return this.updateTask(taskId, { status: TASK_STATUS.RUNNING, message: '任务运行中' }); }
  async pauseTask(taskId) { return this.updateTask(taskId, { status: TASK_STATUS.PAUSED, message: '任务已暂停' }); }
  async resumeTask(taskId) { return this.updateTask(taskId, { status: TASK_STATUS.RUNNING, message: '任务已继续' }); }
  async stopTask(taskId) { return this.updateTask(taskId, { status: TASK_STATUS.STOPPED, message: '任务已停止' }); }

  async updateTask(taskId, patch) {
    await this.restoreTaskProgress();
    const existing = this.tasks.get(taskId);
    if (!existing) throw new Error(`Task not found: ${taskId}`);
    const next = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    if (typeof next.current === 'number' && typeof next.total === 'number' && next.total > 0) {
      next.progress = Math.min(100, Math.round((next.current / next.total) * 100));
    }
    this.tasks.set(taskId, next);
    await this.persistTaskProgress();
    return next;
  }

  async getTask(taskId) {
    await this.restoreTaskProgress();
    return this.tasks.get(taskId) || null;
  }

  async listTasks() {
    await this.restoreTaskProgress();
    return [...this.tasks.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async persistTaskProgress() {
    const serialized = [...this.tasks.values()];
    try {
      await storageSet({ [STORAGE_KEYS.TASKS]: serialized }, 'session');
    } catch {
      await storageSet({ [STORAGE_KEYS.TASKS]: serialized }, 'local');
    }
  }

  async restoreTaskProgress() {
    if (this.restored) return;
    let data = {};
    try {
      data = await storageGet({ [STORAGE_KEYS.TASKS]: [] }, 'session');
    } catch {
      data = await storageGet({ [STORAGE_KEYS.TASKS]: [] }, 'local');
    }
    (data[STORAGE_KEYS.TASKS] || []).forEach((task) => this.tasks.set(task.id, task));
    this.restored = true;
  }
}

export const taskManager = new TaskManager();
