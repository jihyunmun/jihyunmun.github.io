import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = new URL('../dist/', import.meta.url).pathname;

test('landing page payload stays inside the budget', async () => {
  const page = await readFile(join(DIST, 'index.html'));
  let bytes = gzipSync(page).length;

  const assets = join(DIST, '_astro');
  let entries = [];
  try { entries = await readdir(assets); } catch { /* no bundled assets */ }
  for (const f of entries.filter((f) => f.endsWith('.css') || f.endsWith('.js'))) {
    bytes += gzipSync(await readFile(join(assets, f))).length;
  }

  console.log(`    initial payload: ${Math.round(bytes / 1024)} KB gzip`);
  assert.ok(bytes <= 150 * 1024, `initial payload is ${Math.round(bytes / 1024)} KB gzip, budget is 150 KB`);
});

test('no built image exceeds the LCP budget', async () => {
  const dir = join(DIST, 'media');
  for (const f of await readdir(dir)) {
    if (!f.endsWith('.jpg')) continue;
    const s = await stat(join(dir, f));
    assert.ok(s.size <= 200 * 1024, `${f} is ${Math.round(s.size / 1024)} KB, over the 200 KB LCP budget`);
  }
});
