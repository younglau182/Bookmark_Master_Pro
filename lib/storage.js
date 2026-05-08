import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants.js';

const memoryStore = new Map();

function hasChromeStorage(area = 'local') {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage[area];
}

function resolveArea(area) {
  if (hasChromeStorage(area)) return area;
  if (area === 'session' && hasChromeStorage('local')) return 'local';
  return null;
}

export function deepMerge(base, override) {
  if (!override || typeof override !== 'object' || Array.isArray(override)) return override ?? base;
  const output = { ...base };
  Object.entries(override).forEach(([key, value]) => {
    output[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? deepMerge(base?.[key] ?? {}, value)
      : value;
  });
  return output;
}

export async function storageGet(keys, area = 'local') {
  const resolvedArea = resolveArea(area);
  if (resolvedArea) {
    return chrome.storage[resolvedArea].get(keys);
  }
  if (keys == null) return Object.fromEntries(memoryStore.entries());
  if (typeof keys === 'string') return { [keys]: memoryStore.get(keys) };
  if (Array.isArray(keys)) return Object.fromEntries(keys.map((key) => [key, memoryStore.get(key)]));
  return Object.fromEntries(Object.entries(keys).map(([key, fallback]) => [key, memoryStore.get(key) ?? fallback]));
}

export async function storageSet(values, area = 'local') {
  const resolvedArea = resolveArea(area);
  if (resolvedArea) {
    await chrome.storage[resolvedArea].set(values);
    return;
  }
  Object.entries(values).forEach(([key, value]) => memoryStore.set(key, value));
}

export async function storageRemove(keys, area = 'local') {
  const resolvedArea = resolveArea(area);
  if (resolvedArea) {
    await chrome.storage[resolvedArea].remove(keys);
    return;
  }
  const list = Array.isArray(keys) ? keys : [keys];
  list.forEach((key) => memoryStore.delete(key));
}

export async function getSettings() {
  const data = await storageGet({ [STORAGE_KEYS.SETTINGS]: DEFAULT_SETTINGS });
  return deepMerge(DEFAULT_SETTINGS, data[STORAGE_KEYS.SETTINGS]);
}

export async function saveSettings(settings) {
  const merged = deepMerge(DEFAULT_SETTINGS, settings);
  await storageSet({ [STORAGE_KEYS.SETTINGS]: merged });
  return merged;
}

export async function getSummary() {
  const data = await storageGet({ [STORAGE_KEYS.SUMMARY]: null });
  return data[STORAGE_KEYS.SUMMARY];
}

export async function saveSummary(summary) {
  await storageSet({ [STORAGE_KEYS.SUMMARY]: summary });
  return summary;
}

export function __clearMemoryStoreForTests() {
  memoryStore.clear();
}
