export const PERMISSION_EXPLANATIONS = [
  { permission: 'bookmarks', reason: '读取和管理书签树，用于搜索、整理、移动、删除与恢复。' },
  { permission: 'history', reason: '识别低频访问/吃灰书签；不会上传浏览历史。' },
  { permission: 'storage / unlimitedStorage', reason: '本地保存设置、快照、检测结果、回收站和操作日志。' },
  { permission: 'proxy', reason: '可选权限，仅在用户启用代理检测时临时影响浏览器全局代理，并在检测结束后清理。' },
  { permission: 'host_permissions http/https', reason: '仅用于对书签 URL 执行健康检测请求。' }
];
