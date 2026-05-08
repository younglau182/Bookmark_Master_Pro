import { APP_VERSION, DASHBOARD_PATH } from '../lib/constants.js';

const $ = (selector) => document.querySelector(selector);
let currentTab = null;
let currentBookmark = null;

async function send(type, payload) {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (!response?.ok) throw new Error(response?.error || '请求失败');
  return response.data;
}

function openDashboard(route = 'overview', params = {}) {
  const query = new URLSearchParams({ route, ...params });
  chrome.tabs.create({ url: chrome.runtime.getURL(`${DASHBOARD_PATH}?${query}`) });
}

async function loadSummary() {
  const summary = await send('bookmarks.getSummary');
  $('#totalBookmarks').textContent = summary.totalBookmarks;
  $('#duplicateCount').textContent = summary.duplicateCount;
  $('#brokenCount').textContent = summary.brokenCount;
  $('#staleCount').textContent = summary.staleCount;
}

async function loadCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  if (!tab?.url || !/^https?:/.test(tab.url)) {
    $('#currentPageStatus').textContent = '当前页面不是可收藏的 HTTP/HTTPS 页面。';
    $('#bookmarkCurrent').disabled = true;
    return;
  }
  const matches = await send('bookmarks.findByUrl', { url: tab.url });
  currentBookmark = matches[0] || null;
  if (currentBookmark) {
    $('#currentPageStatus').textContent = '已收藏，可快速编辑标题。';
    $('#bookmarkCurrent').textContent = '已收藏';
    $('#bookmarkCurrent').disabled = true;
    $('#currentPageEditor').classList.remove('hidden');
    $('#currentTitle').value = currentBookmark.title || tab.title || '';
  } else {
    $('#currentPageStatus').textContent = '当前页面尚未收藏。';
    $('#bookmarkCurrent').textContent = '收藏当前页面';
  }
}

async function loadTasks() {
  const tasks = await send('tasks.list');
  const running = tasks.find((task) => task.status === 'running' || task.status === 'paused');
  if (running) {
    $('#taskStatus').textContent = `${running.message} ${running.progress}%`;
    $('#taskStatus').onclick = () => openDashboard('health');
  }
}

$('#searchButton').addEventListener('click', () => {
  const q = $('#searchInput').value.trim();
  openDashboard('search', q ? { q } : {});
});
$('#searchInput').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') $('#searchButton').click();
});
$('#openDashboard').addEventListener('click', () => openDashboard());
$('#openOptions').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('#bookmarkCurrent').addEventListener('click', async () => {
  if (!currentTab) return;
  await send('bookmarks.addCurrent', { title: currentTab.title || currentTab.url, url: currentTab.url });
  await loadCurrentPage();
});
$('#saveCurrentTitle').addEventListener('click', async () => {
  if (!currentBookmark) return;
  await send('bookmarks.update', { id: currentBookmark.id, changes: { title: $('#currentTitle').value.trim() || currentBookmark.title } });
  await loadCurrentPage();
});

document.querySelector('footer span').textContent = `v${APP_VERSION}`;
Promise.allSettled([loadSummary(), loadCurrentPage(), loadTasks()]).catch(console.error);
