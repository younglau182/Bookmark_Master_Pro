import { getDomain } from './url-utils.js';

function includes(source, query) {
  return String(source || '').toLowerCase().includes(query);
}

export function searchBookmarks(bookmarks, filters = {}) {
  const query = String(filters.query || '').trim().toLowerCase();
  const title = String(filters.title || '').trim().toLowerCase();
  const url = String(filters.url || '').trim().toLowerCase();
  const folder = String(filters.folder || '').trim().toLowerCase();
  const domain = String(filters.domain || '').trim().toLowerCase();
  const sort = filters.sort || 'recent_added';

  const filtered = bookmarks.filter((bookmark) => {
    const bookmarkDomain = bookmark.domain || getDomain(bookmark.url);
    return (!query || includes(bookmark.title, query) || includes(bookmark.url, query) || includes(bookmark.path, query))
      && (!title || includes(bookmark.title, title))
      && (!url || includes(bookmark.url, url))
      && (!folder || includes(bookmark.path, folder))
      && (!domain || includes(bookmarkDomain, domain));
  });

  return filtered.sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
    if (sort === 'domain') return (a.domain || '').localeCompare(b.domain || '');
    return (b.dateAdded || 0) - (a.dateAdded || 0);
  });
}
