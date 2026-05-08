import { routeMessage } from './router.js';
import { taskManager } from './task-manager.js';
import { DASHBOARD_PATH, OPTIONS_PATH } from '../lib/constants.js';
import { logger } from '../lib/logger.js';

chrome.runtime.onInstalled.addListener(() => {
  taskManager.restoreTaskProgress().catch((error) => logger.warn('Task restore failed', error));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  routeMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      logger.error('Message handling failed', error);
      sendResponse({ ok: false, error: error.message || String(error) });
    });
  return true;
});

chrome.action.onClicked?.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL(DASHBOARD_PATH) });
});

chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'open-dashboard') chrome.tabs.create({ url: chrome.runtime.getURL(DASHBOARD_PATH) });
  if (command === 'open-options') chrome.runtime.openOptionsPage?.();
});

export { OPTIONS_PATH };
