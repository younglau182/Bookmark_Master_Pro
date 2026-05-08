import { APP_VERSION } from '../lib/constants.js';

async function send(type, payload) {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (!response?.ok) throw new Error(response?.error || '请求失败');
  return response.data;
}

function field(labelText, value, type = 'text') {
  const label = document.createElement('label'); label.textContent = labelText;
  const input = document.createElement('input'); input.type = type; input.value = value ?? ''; label.append(input);
  return { label, input };
}

async function init() {
  const settings = await send('settings.get');
  const root = document.querySelector('#settings');
  const card = document.createElement('section'); card.className = 'card';
  const title = document.createElement('h2'); title.textContent = '基础设置';
  const { label: languageLabel, input: language } = field('语言', settings.experience.language);
  const { label: retentionLabel, input: retention } = field('快照保留数量', settings.safety.snapshotRetention, 'number');
  const save = document.createElement('button'); save.textContent = '保存';
  save.addEventListener('click', async () => {
    await send('settings.save', { ...settings, experience: { ...settings.experience, language: language.value }, safety: { ...settings.safety, snapshotRetention: Number(retention.value) } });
    save.textContent = '已保存'; setTimeout(() => { save.textContent = '保存'; }, 1500);
  });
  card.append(title, languageLabel, retentionLabel, save);
  root.append(card);
  document.querySelector('footer').textContent = `v${APP_VERSION}`;
}

init().catch((error) => { document.querySelector('#settings').textContent = error.message; });
