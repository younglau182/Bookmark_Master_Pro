function formatDate(value) { return value ? new Date(value).toLocaleString() : '暂无'; }

function resultCard(bookmark) {
  const card = document.createElement('article');
  card.className = 'result-card';
  const title = document.createElement('h3');
  title.textContent = bookmark.title;
  const url = document.createElement('a');
  url.href = bookmark.url;
  url.target = '_blank';
  url.rel = 'noreferrer';
  url.textContent = bookmark.url;
  const meta = document.createElement('div');
  meta.className = 'actions';
  ['路径：' + bookmark.path, '域名：' + (bookmark.domain || '未知'), '添加：' + formatDate(bookmark.dateAdded)].forEach((text) => {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = text;
    meta.append(pill);
  });
  const actions = document.createElement('div');
  actions.className = 'actions';
  [['打开', () => window.open(bookmark.url, '_blank', 'noopener')], ['编辑', () => alert('编辑能力将在 Phase 2 完善')], ['移动', () => alert('批量移动将在 Phase 2/4 以预览+快照方式实现')], ['删除', () => alert('删除必须进入回收站，将在 Phase 2 实现')], ['打标签', () => alert('标签能力将在 Phase 2/4 实现')]].forEach(([label, handler]) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.addEventListener('click', handler);
    actions.append(button);
  });
  card.append(title, url, meta, actions);
  return card;
}

export async function renderSearch({ view, send, query }) {
  view.textContent = '';
  const form = document.createElement('section');
  form.className = 'card form-grid';
  const fields = [
    ['query', '关键词', query.get('q') || ''], ['title', '标题', ''], ['url', 'URL', ''], ['folder', '文件夹', ''], ['domain', '域名', '']
  ];
  const inputs = {};
  fields.forEach(([name, labelText, value]) => {
    const label = document.createElement('label');
    label.textContent = labelText;
    const input = document.createElement('input');
    input.name = name;
    input.value = value;
    label.append(input);
    inputs[name] = input;
    form.append(label);
  });
  const sortLabel = document.createElement('label');
  sortLabel.textContent = '排序';
  const sort = document.createElement('select');
  [['recent_added', '最近添加'], ['title', '标题'], ['domain', '域名']].forEach(([value, label]) => {
    const option = document.createElement('option'); option.value = value; option.textContent = label; sort.append(option);
  });
  sortLabel.append(sort);
  const submit = document.createElement('button');
  submit.className = 'primary';
  submit.textContent = '搜索';
  form.append(sortLabel, submit);

  const resultList = document.createElement('section');
  resultList.className = 'result-list';
  async function runSearch() {
    resultList.textContent = '搜索中...';
    const payload = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value]));
    payload.sort = sort.value;
    const { results, total } = await send('search.query', payload);
    resultList.textContent = '';
    const summary = document.createElement('p');
    summary.className = 'muted';
    summary.textContent = `找到 ${total} 条结果（当前最多显示 250 条）。`;
    resultList.append(summary);
    if (!results.length) {
      const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = '没有匹配结果，请调整关键词或筛选条件。'; resultList.append(empty); return;
    }
    results.forEach((bookmark) => resultList.append(resultCard(bookmark)));
  }
  submit.addEventListener('click', runSearch);
  form.addEventListener('keydown', (event) => { if (event.key === 'Enter') runSearch(); });
  view.append(form, resultList);
  await runSearch();
}
