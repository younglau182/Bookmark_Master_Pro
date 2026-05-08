export async function renderHealth({ view, send, toast }) {
  view.textContent = '';
  const panel = document.createElement('section'); panel.className = 'card';
  const title = document.createElement('h2'); title.textContent = '健康检测任务';
  const desc = document.createElement('p'); desc.textContent = 'Phase 1 搭建统一 TaskManager 和持久化任务状态；真实链接检测、代理清理将在 Phase 3 实现。';
  const create = document.createElement('button'); create.className = 'primary'; create.textContent = '创建健康检测任务';
  const tasks = document.createElement('section'); tasks.className = 'result-list';
  async function refresh() {
    tasks.textContent = '';
    const list = await send('tasks.list');
    if (!list.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = '暂无任务。'; tasks.append(empty); return; }
    list.forEach((task) => {
      const card = document.createElement('article'); card.className = 'result-card';
      card.textContent = `${task.type} · ${task.status} · ${task.progress}% · ${task.message}`;
      const actions = document.createElement('div'); actions.className = 'actions';
      [['开始', 'tasks.start'], ['暂停', 'tasks.pause'], ['继续', 'tasks.resume'], ['停止', 'tasks.stop']].forEach(([label, type]) => {
        const b = document.createElement('button'); b.textContent = label; b.addEventListener('click', async () => { await send(type, { taskId: task.id }); await refresh(); }); actions.append(b);
      });
      card.append(actions); tasks.append(card);
    });
  }
  create.addEventListener('click', async () => { await send('tasks.createHealthCheck', { total: 0 }); toast('已创建健康检测任务'); await refresh(); });
  panel.append(title, desc, create);
  view.append(panel, tasks);
  await refresh();
}
