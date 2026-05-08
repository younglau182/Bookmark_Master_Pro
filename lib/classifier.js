import { getDomain } from './url-utils.js';

export function suggestCategory(bookmark, rules = []) {
  const title = String(bookmark.title || '').toLowerCase();
  const url = String(bookmark.url || '').toLowerCase();
  const matchedRule = rules.find((rule) => {
    const pattern = String(rule.pattern || '').toLowerCase();
    return pattern && (title.includes(pattern) || url.includes(pattern));
  });
  if (matchedRule) return matchedRule.category;
  const domain = getDomain(bookmark.url);
  if (domain.includes('github')) return 'Development';
  if (domain.includes('docs') || title.includes('文档')) return 'Documentation';
  if (domain.includes('youtube') || domain.includes('bilibili')) return 'Media';
  return 'Uncategorized';
}

export function classifyBookmarks(bookmarks, rules = []) {
  return bookmarks.map((bookmark) => ({ ...bookmark, suggestedCategory: suggestCategory(bookmark, rules) }));
}
