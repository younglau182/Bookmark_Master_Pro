export async function renderCleanup({ view, send }) {
  view.textContent = '';
  const panel = document.createElement('section');
  panel.className = 'card danger-zone';
  const title = document.createElement('h2'); title.textContent = '清理工作台';
  const desc = document.createElement('p'); desc.textContent = 'Phase 1 仅提供去重扫描预览；删除会在 Phase 2 以自动快照、二次确认、回收站恢复方式实现。';
  const button = document.createElement('button'); button.className = 'primary'; button.textContent = '扫描重复书签';
  const list = document.createElement('section'); list.className = 'result-list';
  button.addEventListener('click', async () => {
    list.textContent = '扫描中...';
    const { groups, duplicateCount } = await send('dedup.preview', { strategy: 'normalized_url' });
    list.textContent = '';
    const summary = document.createElement('p'); summary.textContent = `发现 ${groups.length} 个重复组，预估可清理 ${duplicateCount} 条。当前仅预览，不会删除。`; list.append(summary);
    groups.slice(0, 30).forEach((group) => {
      const card = document.createElement('article'); card.className = 'result-card';
      const heading = document.createElement('h3'); heading.textContent = group.key; card.append(heading);
      group.items.forEach((item) => { const p = document.createElement('p'); p.textContent = `${item.id === group.keepId ? '建议保留：' : '候选删除：'}${item.title} — ${item.path}`; card.append(p); });
      list.append(card);
    });
  });
  panel.append(title, desc, button);
  view.append(panel, list);
}
