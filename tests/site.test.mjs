import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

export async function html(path) {
  return readFile(join(DIST, path), 'utf8');
}

export async function exists(path) {
  try { await access(join(DIST, path)); return true; }
  catch { return false; }
}

test('build produces a landing page', async () => {
  const page = await html('index.html');
  assert.match(page, /<html/);
});

test('existing PDF URLs survive the migration', async () => {
  assert.ok(await exists('assets/pdfs/cv.pdf'), 'cv.pdf missing');
  assert.ok(await exists('assets/pdfs/2023_interspeech.pdf'), '2023 interspeech pdf missing');
  assert.ok(await exists('assets/images/portrait.jpg'), 'portrait.jpg missing');
});
