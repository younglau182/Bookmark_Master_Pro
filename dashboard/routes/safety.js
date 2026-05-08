export async function renderSafety({ view, send, toast }) {
  view.textContent = '';
  const card = document.createElement('section'); card.className = 'card';
  const title = document.createElement('h2'); title.textContent = '安全与恢复';
  const desc = document.createElement('p'); desc.textContent = '快照使用 IndexedDB 保存完整书签树；恢复能力将在 Phase 2 按三次确认流程启用。';
  const create = document.createElement('button'); create.className = 'primary'; create.textContent = '手动创建快照';
  const list = document.createElement('section'); list.className = 'result-list';
  async function refresh() {
    list.textContent = '';
    const snapshots = await send('snapshots.listMetadata');
    if (!snapshots.length) { const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = '暂无快照。'; list.append(empty); return; }
    snapshots.forEach((snapshot) => { const item = document.createElement('article'); item.className = 'result-card'; item.textContent = `${snapshot.name} · ${new Date(snapshot.createdAt).toLocaleString()}`; list.append(item); });
  }
  create.addEventListener('click', async () => { await send('snapshots.create', { reason: 'manual' }); toast('快照已创建'); await refresh(); });
  card.append(title, desc, create);
  view.append(card, list);
  await refresh();
}
