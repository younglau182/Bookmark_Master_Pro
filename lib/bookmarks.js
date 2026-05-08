import { findDuplicateGroups } from './deduplicator.js';
import { getDomain } from './url-utils.js';

export function flattenBookmarkTree(nodes, parentPath = []) {
  const bookmarks = [];
  const folders = [];
  const visit = (node, path) => {
    if (node.url) {
      bookmarks.push({
        id: node.id,
        parentId: node.parentId,
        title: node.title || '(无标题)',
        url: node.url,
        domain: getDomain(node.url),
        dateAdded: node.dateAdded || null,
        path: path.join(' / ') || '根目录'
      });
      return;
    }
    const folder = {
      id: node.id,
      parentId: node.parentId,
      title: node.title || '根目录',
      dateAdded: node.dateAdded || null,
      path: path.join(' / ') || '根目录'
    };
    folders.push(folder);
    (node.children || []).forEach((child) => visit(child, [...path, folder.title].filter(Boolean)));
  };
  nodes.forEach((node) => visit(node, parentPath));
  return { bookmarks, folders };
}

export async function getBookmarkTree() {
  if (typeof chrome === 'undefined' || !chrome.bookmarks) {
    return [];
  }
  return chrome.bookmarks.getTree();
}

export async function getBookmarkInventory() {
  const tree = await getBookmarkTree();
  const { bookmarks, folders } = flattenBookmarkTree(tree);
  return { tree, bookmarks, folders };
}

export function countDuplicateBookmarks(bookmarks) {
  return findDuplicateGroups(bookmarks).reduce((sum, group) => sum + group.items.length - 1, 0);
}

export function buildSummaryFromInventory(inventory, cached = {}) {
  const totalBookmarks = inventory.bookmarks.length;
  const folderCount = Math.max(0, inventory.folders.length - 1);
  const duplicateCount = countDuplicateBookmarks(inventory.bookmarks);
  const brokenCount = cached.brokenCount ?? 0;
  const staleCount = cached.staleCount ?? 0;
  const penalty = Math.min(70, duplicateCount * 0.2 + brokenCount * 1.5 + staleCount * 0.05);
  return {
    totalBookmarks,
    folderCount,
    duplicateCount,
    brokenCount,
    staleCount,
    duplicateScannedAt: cached.duplicateScannedAt ?? null,
    lastSnapshotAt: cached.lastSnapshotAt ?? null,
    lastSnapshotId: cached.lastSnapshotId ?? null,
    lastSnapshotBookmarkCount: cached.lastSnapshotBookmarkCount ?? null,
    lastHealthCheckAt: cached.lastHealthCheckAt ?? null,
    healthScore: Math.max(0, Math.round(100 - penalty)),
    updatedAt: new Date().toISOString()
  };
}
