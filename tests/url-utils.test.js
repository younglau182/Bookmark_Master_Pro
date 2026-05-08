import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, getDomain, isHttpUrl, normalizeUrl } from '../lib/url-utils.js';

test('normalizeUrl removes tracking parameters and hash', () => {
  assert.equal(normalizeUrl('https://www.example.com/docs/?utm_source=x&a=1#top'), 'https://example.com/docs?a=1');
});

test('getDomain removes www prefix', () => {
  assert.equal(getDomain('https://www.github.com/openai'), 'github.com');
});

test('isHttpUrl rejects browser internal URLs', () => {
  assert.equal(isHttpUrl('chrome://extensions'), false);
});

test('escapeHtml escapes bookmark-controlled text', () => {
  assert.equal(escapeHtml('<img src=x onerror=1>'), '&lt;img src=x onerror=1&gt;');
});
