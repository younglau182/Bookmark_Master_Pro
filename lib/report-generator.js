export function buildHealthReport(summary, bookmarks = []) {
  const domains = new Map();
  bookmarks.forEach((bookmark) => domains.set(bookmark.domain, (domains.get(bookmark.domain) || 0) + 1));
  return {
    summary,
    topDomains: [...domains.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    generatedAt: new Date().toISOString()
  };
}
