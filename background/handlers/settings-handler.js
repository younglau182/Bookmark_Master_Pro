import { getSettings, saveSettings } from '../../lib/storage.js';

export async function handleSettingsMessage(message) {
  if (message?.type === 'settings.get') return getSettings();
  if (message?.type === 'settings.save') return saveSettings(message.payload || {});
}
