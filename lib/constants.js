export const APP_NAME = 'Bookmark Master Pro';
export const APP_VERSION = '0.1.0';
export const DASHBOARD_PATH = 'dashboard/dashboard.html';
export const OPTIONS_PATH = 'options/options.html';

export const STORAGE_KEYS = Object.freeze({
  SETTINGS: 'bmp.settings',
  SUMMARY: 'bmp.summary',
  TASKS: 'bmp.tasks',
  LAST_SEARCH: 'bmp.lastSearch',
  HEALTH_RESULTS: 'bmp.healthResults',
  RECYCLE_BIN: 'bmp.recycleBin',
  OPERATION_LOG: 'bmp.operationLog'
});

export const DEFAULT_SETTINGS = Object.freeze({
  experience: {
    language: 'zh-CN',
    theme: 'system',
    defaultPage: 'overview',
    defaultSearchMode: 'local'
  },
  safety: {
    autoSnapshot: true,
    snapshotRetention: 10,
    recycleRetentionDays: 30,
    requireDangerConfirmation: true,
    restoreConfirmationWord: 'RESTORE'
  },
  bookmarks: {
    defaultDedupStrategy: 'normalized_url',
    defaultScope: 'all',
    classificationRules: [],
    tagRules: []
  },
  health: {
    defaultMode: 'direct',
    intervalDays: 14,
    incrementalRefreshDays: 7,
    proxy: { type: 'system', host: '', port: '' },
    timeoutMs: 10000,
    concurrency: 6
  },
  ai: {
    enabled: false,
    provider: '',
    endpoint: '',
    apiKey: '',
    model: '',
    dailyBudget: 0,
    monthlyBudget: 0,
    tokenBudget: 0
  }
});

export const TASK_TYPES = Object.freeze({
  HEALTH_CHECK: 'health_check',
  DEDUPLICATE: 'deduplicate',
  CLASSIFY: 'classify',
  STALE_SCAN: 'stale_scan',
  SNAPSHOT_RESTORE: 'snapshot_restore',
  EXPORT_REPORT: 'export_report'
});

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

export const ROUTES = [
  { id: 'overview', label: '总览', icon: '⌂' },
  { id: 'search', label: '搜索', icon: '⌕' },
  { id: 'organize', label: '整理', icon: '▦' },
  { id: 'cleanup', label: '清理', icon: '♻' },
  { id: 'health', label: '检测', icon: '◆' },
  { id: 'reports', label: '报告', icon: '▧' },
  { id: 'safety', label: '安全与恢复', icon: '◈' },
  { id: 'settings', label: '设置', icon: '⚙' }
];
