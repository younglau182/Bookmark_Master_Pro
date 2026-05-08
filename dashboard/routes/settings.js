import { PERMISSION_EXPLANATIONS } from '../../lib/permissions.js';

function labelInput(labelText, value, type = 'text') {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = type;
  input.value = value ?? '';
  label.append(input);
  return { label, input };
}

function section(titleText, description) {
  const card = document.createElement('section'); card.className = 'card';
  const title = document.createElement('h2'); title.textContent = titleText;
  const desc = document.createElement('p'); desc.className = 'muted'; desc.textContent = description;
  card.append(title, desc);
  return card;
}

export async function renderSettings({ view, send, toast }) {
  view.textContent = '';
  const settings = await send('settings.get');
  const form = document.createElement('section'); form.className = 'grid';

  const experience = section('基础体验', '语言、主题、默认页面和搜索模式。');
  const theme = document.createElement('select');
  [['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']].forEach(([value, text]) => { const option = document.createElement('option'); option.value = value; option.textContent = text; option.selected = settings.experience.theme === value; theme.append(option); });
  const themeLabel = document.createElement('label'); themeLabel.textContent = '主题'; themeLabel.append(theme);
  const { label: languageLabel, input: language } = labelInput('语言', settings.experience.language);
  experience.append(languageLabel, themeLabel);

  const safety = section('数据安全', '危险操作默认需要二次确认，并优先创建快照。');
  const { label: retentionLabel, input: snapshotRetention } = labelInput('快照保留数量', settings.safety.snapshotRetention, 'number');
  const { label: recycleLabel, input: recycleRetentionDays } = labelInput('回收站保留天数', settings.safety.recycleRetentionDays, 'number');
  const { label: wordLabel, input: restoreConfirmationWord } = labelInput('恢复确认词', settings.safety.restoreConfirmationWord);
  safety.append(retentionLabel, recycleLabel, wordLabel);

  const health = section('检测与代理', '代理检测为可选能力；proxy 权限只在检测期间临时使用并在 finally 清理。');
  const { label: timeoutLabel, input: timeoutMs } = labelInput('超时时间（毫秒）', settings.health.timeoutMs, 'number');
  const { label: concurrencyLabel, input: concurrency } = labelInput('并发数量', settings.health.concurrency, 'number');
  health.append(timeoutLabel, concurrencyLabel);

  const ai = section('AI 能力', '默认关闭。启用前会提示候选书签标题和 URL 将发送给所配置 Provider。API Key 仅本地保存。');
  const aiEnabledLabel = document.createElement('label'); aiEnabledLabel.textContent = '启用 AI 搜索';
  const aiEnabled = document.createElement('input'); aiEnabled.type = 'checkbox'; aiEnabled.checked = settings.ai.enabled; aiEnabledLabel.append(aiEnabled);
  const { label: providerLabel, input: provider } = labelInput('API Provider', settings.ai.provider);
  const { label: endpointLabel, input: endpoint } = labelInput('API Endpoint', settings.ai.endpoint);
  const { label: modelLabel, input: model } = labelInput('Model', settings.ai.model);
  ai.append(aiEnabledLabel, providerLabel, endpointLabel, modelLabel);

  const privacy = section('权限与隐私', '默认所有数据本地处理，不依赖远程后端。');
  PERMISSION_EXPLANATIONS.forEach((item) => { const p = document.createElement('p'); p.textContent = `${item.permission}：${item.reason}`; privacy.append(p); });

  const save = document.createElement('button'); save.className = 'primary'; save.textContent = '保存设置';
  save.addEventListener('click', async () => {
    await send('settings.save', {
      experience: { ...settings.experience, language: language.value, theme: theme.value },
      safety: { ...settings.safety, snapshotRetention: Number(snapshotRetention.value), recycleRetentionDays: Number(recycleRetentionDays.value), restoreConfirmationWord: restoreConfirmationWord.value },
      health: { ...settings.health, timeoutMs: Number(timeoutMs.value), concurrency: Number(concurrency.value) },
      ai: { ...settings.ai, enabled: aiEnabled.checked, provider: provider.value, endpoint: endpoint.value, model: model.value }
    });
    document.documentElement.dataset.theme = theme.value === 'system' ? '' : theme.value;
    toast('设置已保存');
  });

  form.append(experience, safety, health, ai, privacy, save);
  view.append(form);
}
