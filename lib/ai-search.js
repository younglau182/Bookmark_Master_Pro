export function isAiSearchAvailable(settings) {
  return Boolean(settings?.ai?.enabled && settings.ai.apiKey && settings.ai.endpoint);
}

export async function semanticSearch() {
  throw new Error('AI semantic search is optional and will be implemented in Phase 5.');
}
