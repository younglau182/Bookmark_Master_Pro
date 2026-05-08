function metric(label, value) {
  const card = document.createElement('article');
  card.className = 'card metric';
  const strong = document.createElement('strong');
  strong.textContent = value ?? '--';
  const span = document.createElement('span');
  span.textContent = label;
  card.append(strong, span);
  return card;
}

function actionCard(text, route, navigate) {
  const card = document.createElement('article');
  card.className = 'card';
  const p = document.createElement('p');
  p.textContent = text;
  const button = document.createElement('button');
  button.className = 'primary';
  button.textContent = '查看';
  button.addEventListener('click', () => navigate(route));
  card.append(p, button);
  return card;
}

export async function renderOverview({ view, send, navigate }) {
  const summary = await send('bookmarks.getSummary');
  view.textContent = '';
  const metrics = document.createElement('section');
  metrics.className = 'grid cards';
  metrics.append(
    metric('书签总数', summary.totalBookmarks),
    metric('文件夹数量', summary.folderCount),
    metric('重复书签', summary.duplicateCount),
    metric('失效链接', summary.brokenCount),
    metric('吃灰书签', summary.staleCount),
    metric('最近快照', summary.lastSnapshotAt ? new Date(summary.lastSnapshotAt).toLocaleString() : '暂无'),
    metric('最近检测', summary.lastHealthCheckAt ? new Date(summary.lastHealthCheckAt).toLocaleString() : '暂无'),
    metric('健康分', summary.healthScore)
  );
  const actions = document.createElement('section');
  actions.className = 'grid';
  actions.append(
    actionCard(`发现 ${summary.duplicateCount} 个疑似重复书签，建议先创建快照后进入去重。`, 'cleanup', navigate),
    actionCard(`有 ${summary.brokenCount} 个链接连续检测失败，建议进入健康检测。`, 'health', navigate),
    actionCard(`有 ${summary.staleCount} 个 180 天未访问书签，建议进入吃灰清理。`, 'cleanup', navigate)
  );
  view.append(metrics, actions);
}
