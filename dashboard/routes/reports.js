export async function renderReports({ view, send }) {
  view.textContent = '';
  const report = await send('reports.build');
  const card = document.createElement('section'); card.className = 'card';
  const title = document.createElement('h2'); title.textContent = '健康报告（Phase 1 基础版）';
  const score = document.createElement('p'); score.textContent = `健康分：${report.summary?.healthScore ?? '--'}`;
  const domains = document.createElement('div'); domains.className = 'actions';
  report.topDomains.forEach(([domain, count]) => { const pill = document.createElement('span'); pill.className = 'pill'; pill.textContent = `${domain || '未知'} ${count}`; domains.append(pill); });
  card.append(title, score, domains);
  view.append(card);
}
