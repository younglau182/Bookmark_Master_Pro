export function classifyHealthFailure(errorOrStatus) {
  const value = String(errorOrStatus || '').toLowerCase();
  if (['404', '410'].some((code) => value.includes(code))) return '404/410';
  if (value.includes('dns') || value.includes('name_not_resolved')) return 'DNS 失败';
  if (value.includes('timeout') || value.includes('timed out')) return '超时';
  if (value.includes('ssl') || value.includes('certificate')) return 'SSL 错误';
  if (value.includes('proxy')) return '需要代理';
  if (value.includes('login') || value.includes('401')) return '需要登录';
  if (value.includes('403') || value.includes('forbidden')) return '403/被拒绝';
  return '未知错误';
}
