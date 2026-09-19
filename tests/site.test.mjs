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

test('research collection has seven entries, one featured', async () => {
  const { readdir } = await import('node:fs/promises');
  const dir = new URL('../src/content/research/', import.meta.url).pathname;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  assert.equal(files.length, 7, `expected 7 research files, found ${files.length}`);

  let featured = 0;
  for (const f of files) {
    const body = await readFile(join(dir, f), 'utf8');
    if (/^featured:\s*true\s*$/m.test(body)) featured += 1;
    assert.match(body, /^\s+alt:\s*\S/m, `${f} has no media alt`);
    assert.match(body, /^\s+caption:\s*\S/m, `${f} has no media caption`);
  }
  assert.equal(featured, 1, `expected exactly 1 featured entry, found ${featured}`);
});

test('nothing withheld leaks into content', async () => {
  const { readdir } = await import('node:fs/promises');
  const root = new URL('../src/content/', import.meta.url).pathname;
  const banned = [/CHIRO-?NEURO/i, /ANR-NRF/i, /lifeformer/i, /LifeCast/i];
  const walk = async (d) => {
    const out = [];
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      out.push(...(e.isDirectory() ? await walk(p) : [p]));
    }
    return out;
  };
  for (const f of await walk(root)) {
    const body = await readFile(f, 'utf8');
    for (const re of banned) {
      assert.ok(!re.test(body), `${f} mentions ${re}`);
    }
  }
});
