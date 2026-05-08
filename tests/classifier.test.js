import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyBookmarks, suggestCategory } from '../lib/classifier.js';

test('suggestCategory honors custom rules', () => {
  assert.equal(suggestCategory({ title: 'Kubernetes Guide', url: 'https://example.com' }, [{ pattern: 'kubernetes', category: 'Cloud' }]), 'Cloud');
});

test('classifyBookmarks adds suggestedCategory', () => {
  const [item] = classifyBookmarks([{ title: 'GitHub', url: 'https://github.com/a/b' }]);
  assert.equal(item.suggestedCategory, 'Development');
});
