import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

export async function html(path) {
  return readFile(join(DIST, path), 'utf8');
}

// Astro extracts stylesheets over ~4 KB into /_astro/*.css, so "the CSS of a
// page" is its inline <style> blocks plus every stylesheet it links locally.
export async function styles(path) {
  const page = await html(path);
  let css = [...page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  for (const m of page.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="(\/[^"]+\.css)"/g)) {
    css += '\n' + await readFile(join(DIST, m[1].slice(1)), 'utf8');
  }
  return css;
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

test('both themes are defined at token level', async () => {
  const css = await styles('index.html');
  assert.match(css, /--paper:\s*#F1F2EE/i, 'light palette missing from bare :root');
  assert.match(css, /prefers-color-scheme:\s*dark/i, 'dark media query missing');
  // the minifier drops attribute-value quotes, so accept either spelling
  assert.match(css, /:root:not\(\[data-theme=["']?light["']?\]\)/i, 'dark query is not guarded');
  assert.match(css, /:root\[data-theme=["']?dark["']?\]/i, 'explicit dark stamp missing');
});

test('nav has exactly the three sections', async () => {
  const page = await html('index.html');
  const navLinks = [...page.matchAll(/<a[^>]+href="\/(research|publications|cv)\/"/g)];
  assert.equal(navLinks.length, 3, `expected 3 nav links, found ${navLinks.length}`);
});

test('body paints its own background', async () => {
  const css = await styles('index.html');
  assert.match(css, /body\s*{[^}]*background:\s*var\(--paper\)/s);
});
