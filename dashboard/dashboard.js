import { APP_VERSION, ROUTES } from '../lib/constants.js';
import { renderOverview } from './routes/overview.js';
import { renderSearch } from './routes/search.js';
import { renderOrganize } from './routes/organize.js';
import { renderCleanup } from './routes/cleanup.js';
import { renderHealth } from './routes/health.js';
import { renderReports } from './routes/reports.js';
import { renderSafety } from './routes/safety.js';
import { renderSettings } from './routes/settings.js';

const routeMap = { overview: renderOverview, search: renderSearch, organize: renderOrganize, cleanup: renderCleanup, health: renderHealth, reports: renderReports, safety: renderSafety, settings: renderSettings };
const state = { route: new URLSearchParams(location.search).get('route') || location.hash.slice(1) || 'overview' };

export async function send(type, payload) {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (!response?.ok) throw new Error(response?.error || '请求失败');
  return response.data;
}

export function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.remove('hidden');
  setTimeout(() => element.classList.add('hidden'), 2600);
}

function renderNav() {
  const nav = document.querySelector('#nav');
  nav.textContent = '';
  ROUTES.forEach((route) => {
    const button = document.createElement('button');
    button.className = `nav-item ${route.id === state.route ? 'active' : ''}`;
    button.type = 'button';
    button.dataset.route = route.id;
    button.textContent = `${route.icon} ${route.label}`;
    button.addEventListener('click', () => navigate(route.id));
    nav.append(button);
  });
}

async function navigate(route) {
  state.route = route;
  history.replaceState(null, '', `?route=${route}`);
  await renderRoute();
}

async function renderRoute() {
  renderNav();
  const routeMeta = ROUTES.find((item) => item.id === state.route) || ROUTES[0];
  document.querySelector('#pageTitle').textContent = routeMeta.label;
  document.querySelector('#pageSubtitle').textContent = state.route === 'overview' ? '核心指标、风险和推荐动作' : '先扫描 → 再预览 → 再快照 → 再确认 → 再执行 → 可恢复';
  const view = document.querySelector('#routeView');
  view.textContent = '加载中...';
  try {
    await (routeMap[state.route] || renderOverview)({ view, send, toast, navigate, query: new URLSearchParams(location.search) });
  } catch (error) {
    view.innerHTML = '';
    const errorBox = document.createElement('div');
    errorBox.className = 'empty';
    errorBox.textContent = `加载失败：${error.message}`;
    const retry = document.createElement('button');
    retry.textContent = '重试';
    retry.addEventListener('click', renderRoute);
    errorBox.append(document.createElement('br'), retry);
    view.append(errorBox);
  }
}

document.querySelector('.sidebar-footer').textContent = `v${APP_VERSION} · Local-first`;
document.querySelector('#refreshButton').addEventListener('click', renderRoute);
renderRoute();
