import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { join } from 'node:path';

const MEDIA = new URL('../public/media/', import.meta.url).pathname;
const MAX_BYTES = 2 * 1024 * 1024;

for (const name of ['handwriting-surprise.mp4', 'handwriting-surprise.webm', 'handwriting-surprise.jpg']) {
  test(`${name} exists and is within budget`, async () => {
    const s = await stat(join(MEDIA, name));
    assert.ok(s.size > 0, `${name} is empty`);
    assert.ok(s.size <= MAX_BYTES, `${name} is ${s.size} bytes, over the 2 MB budget`);
  });
}

test('every media.src referenced by a research entry exists on disk', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const content = new URL('../src/content/research/', import.meta.url).pathname;
  const pub = new URL('../public/', import.meta.url).pathname;

  for (const f of (await readdir(content)).filter((n) => n.endsWith('.md'))) {
    const body = await readFile(join(content, f), 'utf8');
    for (const m of body.matchAll(/^\s+(?:src|webm|poster):\s*(\/\S+?)\s*$/gm)) {
      const s = await stat(join(pub, m[1].slice(1)));
      assert.ok(s.size > 0, `${m[1]} (from ${f}) is empty`);
      const isClip = m[1].endsWith('.mp4') || m[1].endsWith('.webm');
      assert.ok(isClip || s.size <= 300 * 1024,
        `${m[1]} is ${Math.round(s.size / 1024)} KB — downscale it`);
    }
  }
});
