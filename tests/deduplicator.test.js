import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseKeepBookmark, findDuplicateGroups } from '../lib/deduplicator.js';

const bookmarks = [
  { id: '1', title: 'A', url: 'https://www.example.com/?utm_source=a', dateAdded: 1 },
  { id: '2', title: 'A2', url: 'https://example.com/', dateAdded: 2 },
  { id: '3', title: 'B', url: 'https://other.test/', dateAdded: 3 }
];

test('findDuplicateGroups groups normalized URLs', () => {
  const groups = findDuplicateGroups(bookmarks);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].items.length, 2);
});

test('chooseKeepBookmark keeps newest by default', () => {
  assert.equal(chooseKeepBookmark(bookmarks.slice(0, 2)).id, '2');
});
