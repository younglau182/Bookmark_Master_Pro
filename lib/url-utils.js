export function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function normalizeUrl(value) {
  const url = safeParseUrl(value);
  if (!url) return String(value || '').trim().toLowerCase();
  url.hash = '';
  const removable = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
  removable.forEach((key) => url.searchParams.delete(key));
  const pathname = url.pathname !== '/' ? url.pathname.replace(/\/+$/, '') : '/';
  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  const search = url.searchParams.toString();
  return `${url.protocol}//${host}${url.port ? `:${url.port}` : ''}${pathname}${search ? `?${search}` : ''}`;
}

export function getDomain(value) {
  const url = safeParseUrl(value);
  return url ? url.hostname.replace(/^www\./i, '').toLowerCase() : '';
}

export function isHttpUrl(value) {
  const url = safeParseUrl(value);
  return Boolean(url && ['http:', 'https:'].includes(url.protocol));
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
