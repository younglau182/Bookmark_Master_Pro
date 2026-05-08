export async function renderOrganize({ view, send, toast }) {
  view.textContent = '';
  const intro = document.createElement('section');
  intro.className = 'card';
  intro.textContent = '整理模块遵循：先生成建议，不直接移动；执行前自动快照、预览影响范围并支持撤销/回收站。';
  const button = document.createElement('button');
  button.className = 'primary';
  button.textContent = '生成分类建议';
  const list = document.createElement('section');
  list.className = 'result-list';
  button.addEventListener('click', async () => {
    list.textContent = '正在生成建议...';
    const { suggestions } = await send('organize.suggest', { rules: [] });
    list.textContent = '';
    suggestions.slice(0, 50).forEach((item) => {
      const card = document.createElement('article'); card.className = 'result-card';
      card.textContent = `${item.title} → ${item.suggestedCategory}`;
      list.append(card);
    });
    toast(`已生成 ${suggestions.length} 条建议，执行能力将在后续阶段启用。`);
  });
  intro.append(document.createElement('br'), button);
  view.append(intro, list);
}
