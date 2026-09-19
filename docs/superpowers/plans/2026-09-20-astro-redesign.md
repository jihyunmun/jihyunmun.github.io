# jihyunmun.github.io Astro Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Jekyll/Hamilton list-style site with a static Astro showcase site whose landing page leads with research media, on the same URL, without breaking existing inbound links.

**Architecture:** Static Astro build (no UI framework islands). Content lives in three content collections (`research`, `news`, `publications`) so adding a paper never touches a component. One design-token stylesheet drives light and dark themes. Media is pre-encoded by a shell script into `public/media/` and played by a single `ResearchMedia` component that is poster-first and motion-safe. Deployment is a GitHub Actions workflow publishing `dist/` to GitHub Pages.

**Tech Stack:** Astro 7.3.3 · Node 26.8.2 · npm 11.19.1 · ffmpeg 9.0.1 · no CSS framework · `node:test` for build-output assertions.

**Spec:** `docs/superpowers/specs/2026-09-16-homepage-redesign-design.md`

## Global Constraints

- Work on branch `redesign`. **Never commit to `master`** — `master` stays live until an explicit cutover.
- Site URL is `https://jihyunmun.github.io` (user site). `astro.config.mjs` sets `site` and **must not set `base`**.
- Deploy workflow triggers on `master` (this repo's default branch is `master`, not `main`).
- Never publish: the ANR–NRF `CHIRO-NEURO` proposal, `lifeformer`/LifeCast, unpublished dataset paths, or numbers from papers under review.
- Never claim the DiaGraMo dataset as the author's own — it is Zvončáková et al. 2026, Zenodo `10.5281/zenodo.18299327`, CC-BY-4.0.
- Software registrations are held by **SNU R&DB Foundation**; the author is credited as developer, never as rights holder. Certificate images are never published.
- No audio playback anywhere on the site. Spectrogram and waveform **images** are permitted.
- Papers under review or in preparation carry an explicit status badge (`under review`, `submitted`, `in preparation`).
- Every research media element requires non-empty `alt` **and** `caption` — enforced by the collection schema.
- Colour tokens: `paper #F1F2EE` · `well #FAFAF8` · `ink #15171B` · `soft #5B6066` · `faint #8A9098` · `rule #DBDDD6` · `accent #2A3C8F`. Dark: `#101215` · `#181A1F` · `#E9E9E3` · `#9BA1A8` · `#6E747C` · `#2A2E35` · `#92A6F2`.
- Figure-only ramp (never used for UI): `slow #1B2A6B` → `mid #2E8F9E` → `fast #E8A33D` → `peak #C0442F`. Dark: `#5B73D8` · `#49C0CE` · `#F0B75C` · `#E46A52`.
- Typefaces: Spectral (headings), IBM Plex Sans (body, 16–17px / 1.6), IBM Plex Mono (venue tags, captions, axis labels, nav, dates). Google Fonts with `display=swap` and real fallback stacks.
- Layout: single column, `max-width: 1080px`, side gutter ≥ 16px at every width, 2-column research grid collapsing to 1 column at ≤ 760px.
- Performance budget: initial HTML+CSS+JS ≤ 150 KB gzip; LCP image ≤ 200 KB; every `<video>` uses `preload="none"`.
- Encoded clips: silent, ≤ 2 MB, h264 MP4 + VP9 WebM + poster JPG, `+faststart`.
- Contact email is `jihyun.mun@telecom-sudparis.eu`. Affiliation is `Samovar, Télécom SudParis, Institut Polytechnique de Paris`.
- Link row is exactly: GitHub · LinkedIn · CV (PDF) · Email. **No Google Scholar.**
- The portrait at `public/assets/images/portrait.jpg` is kept in the repo but **never referenced by any page**.

---

### Task 1: Astro scaffold, asset migration, and a green build

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`
- Create: `src/pages/index.astro` (placeholder, replaced in Task 7)
- Create: `tests/site.test.mjs`
- Move: `assets/` → `public/assets/`
- Delete: `_config.yml`, `_data/`, `_includes/`, `_layouts/`, `_pages/`, `_posts/`, `_sass/`, `about.md`, `autism.md`, `categories.md`, `ckd.md`, `docs.md`, `education.md`, `faq.md`, `index.html`, `patents.md`, `projects.md`, `publications.md`, `research.md`, `tags.md`, `years.md`, `Gemfile`, `jekyll-theme-hamilton.gemspec`, `scripts/server`, `logo.png`, `screenshot.png`, `screenshot-midnight.png`, `screenshot-sunrise.png`, `404.html`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run build` → `dist/`; `npm test` runs `node --test tests/`; static files served from `public/` keep their URL path (so `/assets/pdfs/cv.pdf` stays valid).

- [ ] **Step 1: Confirm you are on the `redesign` branch**

```bash
cd ~/jihyunmun.github.io
git branch --show-current   # must print: redesign
git status --short
```

Expected: `redesign`, with only `assets/pdfs/cv.pdf` and `docs/` untracked.

- [ ] **Step 2: Write the failing test**

Create `tests/site.test.mjs`:

```javascript
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
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
node --test tests/
```

Expected: FAIL — `dist/` does not exist yet (ENOENT on `dist/index.html`).

- [ ] **Step 4: Remove the Jekyll site and migrate assets**

```bash
cd ~/jihyunmun.github.io
git rm -r -q _config.yml _data _includes _layouts _pages _posts _sass \
  about.md autism.md categories.md ckd.md docs.md education.md faq.md \
  index.html patents.md projects.md publications.md research.md tags.md years.md \
  Gemfile jekyll-theme-hamilton.gemspec scripts logo.png screenshot.png \
  screenshot-midnight.png screenshot-sunrise.png 404.html
mkdir -p public
git mv assets public/assets
git add public/assets/pdfs/cv.pdf
```

`README.md` and `LICENSE.txt` are the Hamilton theme's. Replace `README.md` in Step 5; leave `LICENSE.txt` alone for now (it is the theme's MIT licence and removing it is a separate legal question, out of scope here).

- [ ] **Step 5: Write the project files**

`package.json`:

```json
{
  "name": "jihyunmun-site",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "astro build && node --test tests/",
    "encode-media": "bash scripts/encode-media.sh"
  },
  "dependencies": {
    "astro": "^7.3.3"
  }
}
```

`astro.config.mjs`:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jihyunmun.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`.gitignore`:

```
node_modules/
dist/
.astro/
.DS_Store
*.log
```

`README.md`:

```markdown
# jihyunmun.github.io

Personal research site. Astro static build, deployed to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `master`.

## Local

    npm install
    npm run dev       # http://localhost:4321
    npm run build     # -> dist/
    npm test          # build, then assert on the built HTML

## Content

Nothing on this site is edited in a component. Content lives in:

- `src/content/research/*.md` — the seven research entries on the landing page
- `src/content/news/*.md` — the News list
- `src/content/publications.yaml` — the full publication list

## Media

`npm run encode-media` re-encodes source clips into `public/media/`.
Source paths are listed at the top of `scripts/encode-media.sh`.
```

`src/pages/index.astro` (placeholder — Task 7 replaces it):

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Jihyun Mun</title></head>
  <body><h1>Jihyun Mun</h1></body>
</html>
```

- [ ] **Step 6: Install and build**

```bash
cd ~/jihyunmun.github.io
npm install
npm run build
```

Expected: `dist/index.html` exists; `dist/assets/pdfs/cv.pdf` exists.

- [ ] **Step 7: Run the test to verify it passes**

```bash
node --test tests/
```

Expected: 2 passing.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "build: replace Jekyll with Astro scaffold, migrate assets to public/"
```

---

### Task 2: Design tokens, base layout, nav and footer

**Files:**
- Create: `src/styles/tokens.css`, `src/layouts/Base.astro`, `src/components/SiteNav.astro`, `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: Task 1's build.
- Produces: `Base.astro` accepting props `{ title: string; description?: string; page?: 'research' | 'publications' | 'cv' }`. `page` marks the current nav item with `aria-current="page"`. Every later page imports this layout.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('both themes are defined at token level', async () => {
  const css = await html('index.html');
  assert.match(css, /--paper:\s*#F1F2EE/i, 'light palette missing from bare :root');
  assert.match(css, /prefers-color-scheme:\s*dark/i, 'dark media query missing');
  assert.match(css, /:root:not\(\[data-theme="light"\]\)/i, 'dark query is not guarded');
  assert.match(css, /:root\[data-theme="dark"\]/i, 'explicit dark stamp missing');
});

test('nav has exactly the three sections', async () => {
  const page = await html('index.html');
  const navLinks = [...page.matchAll(/<a[^>]+href="\/(research|publications|cv)\/"/g)];
  assert.equal(navLinks.length, 3, `expected 3 nav links, found ${navLinks.length}`);
});

test('body paints its own background', async () => {
  const page = await html('index.html');
  assert.match(page, /body\s*{[^}]*background:\s*var\(--paper\)/s);
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `--paper` not found in the placeholder page.

- [ ] **Step 3: Write `src/styles/tokens.css`**

```css
:root {
  --paper: #F1F2EE;
  --well: #FAFAF8;
  --ink: #15171B;
  --soft: #5B6066;
  --faint: #8A9098;
  --rule: #DBDDD6;
  --accent: #2A3C8F;
  --accent-w: #E3E7F6;

  --fig-slow: #1B2A6B;
  --fig-mid: #2E8F9E;
  --fig-fast: #E8A33D;
  --fig-peak: #C0442F;

  --serif: "Spectral", Georgia, "Times New Roman", serif;
  --sans: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;

  --col: 1080px;
  --gutter: 24px;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #101215;
    --well: #181A1F;
    --ink: #E9E9E3;
    --soft: #9BA1A8;
    --faint: #6E747C;
    --rule: #2A2E35;
    --accent: #92A6F2;
    --accent-w: #1D2338;
    --fig-slow: #5B73D8;
    --fig-mid: #49C0CE;
    --fig-fast: #F0B75C;
    --fig-peak: #E46A52;
  }
}

:root[data-theme="dark"] {
  --paper: #101215;
  --well: #181A1F;
  --ink: #E9E9E3;
  --soft: #9BA1A8;
  --faint: #6E747C;
  --rule: #2A2E35;
  --accent: #92A6F2;
  --accent-w: #1D2338;
  --fig-slow: #5B73D8;
  --fig-mid: #49C0CE;
  --fig-fast: #F0B75C;
  --fig-peak: #E46A52;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 { margin: 0; text-wrap: balance; font-weight: 400; font-family: var(--serif); }
img, video, svg { max-width: 100%; display: block; }
a { color: inherit; }

a:focus-visible, button:focus-visible, video:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.wrap {
  max-width: var(--col);
  margin-inline: auto;
  padding-inline: var(--gutter);
}
@media (max-width: 480px) { :root { --gutter: 16px; } }

.skip {
  position: absolute; left: -9999px;
  background: var(--well); color: var(--ink);
  padding: 10px 16px; border: 1px solid var(--rule);
  font-family: var(--mono); font-size: 13px;
}
.skip:focus { left: 16px; top: 16px; z-index: 99; }

.eyebrow {
  font-family: var(--mono); font-size: 11.5px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--faint); font-weight: 500;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
```

- [ ] **Step 4: Write `src/components/SiteNav.astro`**

```astro
---
interface Props { page?: 'research' | 'publications' | 'cv' }
const { page } = Astro.props;
const items = [
  { href: '/research/', label: 'Research', key: 'research' },
  { href: '/publications/', label: 'Publications', key: 'publications' },
  { href: '/cv/', label: 'CV', key: 'cv' },
] as const;
---
<nav class="site" aria-label="Primary">
  <a class="mark" href="/">Jihyun Mun</a>
  <ul>
    {items.map((i) => (
      <li>
        <a href={i.href} aria-current={page === i.key ? 'page' : undefined}>{i.label}</a>
      </li>
    ))}
  </ul>
</nav>

<style>
  nav.site {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 24px; flex-wrap: wrap; padding-block: 34px 0;
  }
  .mark { font-family: var(--serif); font-size: 19px; font-weight: 600; text-decoration: none; }
  ul {
    display: flex; gap: 26px; list-style: none; margin: 0; padding: 0;
    font-family: var(--mono); font-size: 12.5px; letter-spacing: .06em; text-transform: uppercase;
  }
  ul a {
    text-decoration: none; color: var(--soft);
    padding-bottom: 3px; border-bottom: 1px solid transparent;
  }
  ul a:hover, ul a[aria-current="page"] { color: var(--ink); border-bottom-color: var(--accent); }
</style>
```

- [ ] **Step 5: Write `src/components/SiteFooter.astro`**

```astro
---
const year = new Date().getFullYear();
---
<footer class="site">
  <span>© {year} Jihyun Mun</span>
  <span>Built for keyboard, screen reader, and reduced motion.</span>
</footer>

<style>
  footer.site {
    border-top: 1px solid var(--rule);
    margin-top: 84px; padding-block: 30px 70px;
    display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
    font-family: var(--mono); font-size: 11.5px; color: var(--faint);
  }
</style>
```

- [ ] **Step 6: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/tokens.css';
import SiteNav from '../components/SiteNav.astro';
import SiteFooter from '../components/SiteFooter.astro';

interface Props {
  title: string;
  description?: string;
  page?: 'research' | 'publications' | 'cv';
}
const {
  title,
  description = 'Jihyun Mun — clinically reliable, interpretable models for atypical speech and handwriting.',
  page,
} = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Spectral:wght@400;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
    />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <div class="wrap">
      <SiteNav page={page} />
      <main id="main"><slot /></main>
      <SiteFooter />
    </div>
  </body>
</html>
```

- [ ] **Step 7: Point the placeholder page at the layout**

Replace `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Jihyun Mun">
  <h1>Jihyun Mun</h1>
</Base>
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
npm test
```

Expected: 5 passing.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: design tokens, base layout, nav and footer"
```

---

### Task 3: Content collections and the content files

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/research/{handwriting-surprise,handwriting-profiling,language-models-assessment,ckd-speech,asd-severity,evaluation-reliability,resources}.md`
- Create: `src/content/news/{2026-09-preprint,2026-09-registration,2026-01-postdoc,2025-08-phd}.md`
- Create: `src/content/publications.yaml`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: three collections queried as `getCollection('research' | 'news' | 'publications')`.
  - `research` entry `data`: `{ title, order, featured, venues[], status, dek, links[], media: { type, src, poster?, alt, caption }, draft }` where `status ∈ 'published' | 'under-review' | 'submitted' | 'in-preparation'` and `media.type ∈ 'video' | 'image'`.
  - `news` entry `data`: `{ date: Date, text: string }`.
  - `publications` entry `data`: `{ year, title, authors, venue, type, pdf?, thumb?, url?, code?, research? }` with `type ∈ 'conference' | 'journal' | 'preprint' | 'in-preparation'`.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('research collection has seven entries, one featured', async () => {
  const { readdir } = await import('node:fs/promises');
  const dir = new URL('../src/content/research/', import.meta.url).pathname;
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
  assert.equal(files.length, 7, `expected 7 research files, found ${files.length}`);

  const { readFile } = await import('node:fs/promises');
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
  const { readdir, readFile } = await import('node:fs/promises');
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `src/content/research/` does not exist (ENOENT).

- [ ] **Step 3: Write `src/content.config.ts`**

```typescript
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const media = z.object({
  type: z.enum(['video', 'image']),
  src: z.string(),
  poster: z.string().optional(),
  webm: z.string().optional(),
  alt: z.string().min(1),
  caption: z.string().min(1),
});

const link = z.object({
  label: z.string(),
  href: z.string(),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    featured: z.boolean().default(false),
    venues: z.array(z.string()).default([]),
    status: z.enum(['published', 'under-review', 'submitted', 'in-preparation']),
    dek: z.string(),
    media,
    links: z.array(link).default([]),
    draft: z.boolean().default(false),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    date: z.coerce.date(),
    text: z.string(),
  }),
});

const publications = defineCollection({
  loader: file('src/content/publications.yaml'),
  schema: z.object({
    id: z.string(),
    year: z.number().int(),
    title: z.string(),
    authors: z.string(),
    venue: z.string(),
    type: z.enum(['conference', 'journal', 'preprint', 'in-preparation']),
    pdf: z.string().optional(),
    thumb: z.string().optional(),
    url: z.string().optional(),
    code: z.string().optional(),
    research: z.string().optional(),
  }),
});

export const collections = { research, news, publications };
```

- [ ] **Step 4: Write the seven research entries**

`src/content/research/handwriting-surprise.md`:

```markdown
---
title: "When the pen surprises the model: forecasting handwriting as a graphomotor biomarker"
order: 1
featured: true
venues: ["In preparation, 2026"]
status: in-preparation
dek: "A forecaster trained on typical children's pen trajectories encodes normative dynamics. Its per-timestep surprise stays a time-aligned signal instead of collapsing into a score, so the model can point at when automaticity breaks down — not just whether it did."
media:
  type: video
  src: /media/handwriting-surprise.mp4
  webm: /media/handwriting-surprise.webm
  poster: /media/handwriting-surprise.jpg
  alt: "Two handwriting trajectories drawn side by side from the same dictation task. The control writer's trace stays almost uniformly blue; the dysgraphia trace breaks into red, orange and green."
  caption: "DiaGraMo TSK4 dictation, played at 9× speed. Stroke colour is pen speed, 0–70 mm/s. Top: control writer. Bottom: a child with developmental dysgraphia. Data: Zvončáková et al. 2026 (Zenodo 10.5281/zenodo.18299327, CC-BY-4.0)."
---

Handwriting is a time series, and the loss of graphomotor automaticity in developmental
dysgraphia shows up as online motor corrections at particular moments. A forecaster trained
on typical trajectories learns normative dynamics: smooth ballistic motion is highly
predictable, feedback-corrected motion is not.

The design choice that matters is what happens to the forecast error. Collapsing it into a
single score throws away the thing clinicians would actually act on. Keeping it as a
time-aligned signal lets the model say *when* the writing stopped being automatic, which is
a statement a clinician can check against the page.
```

`src/content/research/handwriting-profiling.md`:

```markdown
---
title: "Profiling handwriting-process deviations in developmental dysgraphia"
order: 2
featured: false
venues: ["arXiv:2609.15435", "Behavior Research Methods"]
status: under-review
dek: "A frozen 136-feature vocabulary over 12 handwriting-process domains and an age- and sex-adjusted normative reference that turns one child's writing into a 12-axis deviation profile with per-child uncertainty. Validated on 257 Czech children."
media:
  type: image
  src: /assets/images/research/profile-radar.png   # produced by scripts/encode-media.sh (Task 4)
  alt: "A twelve-axis radar chart showing one child's handwriting-process deviation profile against a shaded normative band."
  caption: "Per-child deviation profile across the 12 handwriting-process domains, with the age- and sex-adjusted normative band shaded. Figure from the paper, re-rendered for the web."
links:
  - label: "Preprint"
    href: "https://arxiv.org/abs/2609.15435"
  - label: "Code"
    href: "https://github.com/jihyunmun/handwriting-process-profiling"
---

The instrument has three parts: a 12-domain, 136-feature vocabulary fixed from the
literature before any analysis; an age- and sex-adjusted normative reference; and the
measurement-property evidence that the two together behave like an instrument —
structural coherence, reference calibration, known-groups validity, and individual
reliability.

It reports where a child sits relative to verified-typical peers of the same age and sex.
It does not train a classifier and it does not output a diagnosis; its outlier rate is not
a diagnostic rate. The vocabulary, the analysis code, and a reference implementation are
released openly. A hosted scoring API is in preparation.

Cohort: 257 Czech children (110 typically developing, 147 with dysgraphia) from the
DiaGraMo dataset, which is openly published by Zvončáková and colleagues under CC-BY-4.0.
```

`src/content/research/language-models-assessment.md`:

```markdown
---
title: "Language models for clinical speech assessment"
order: 3
featured: false
venues: ["Interspeech 2024", "LREC-COLING 2024"]
status: published
dek: "Comparing full fine-tuning, prompt tuning, and parameter-efficient adaptation of language models over ASR transcripts to predict clinician severity scores — alongside the corpus and the linguistic analysis it is built on."
media:
  type: image
  src: /assets/images/research/lm-adaptation.png   # produced by scripts/encode-media.sh (Task 4)
  alt: "A diagram in which an ASR transcript branches into three adaptation regimes — full fine-tuning, prompt tuning, and parameter-efficient learning — and converges on a predicted severity score."
  caption: "Three adaptation regimes compared on the same transcripts. Diagram redrawn for the web from the Interspeech 2024 paper."
---

Once a child's speech has been transcribed, predicting a clinician's severity score is a
language problem, and the interesting question is how much adaptation a language model
actually needs. Full fine-tuning, prompt tuning, and parameter-efficient methods were
compared on the same transcripts, which makes the cost of each regime legible rather than
assumed.

The work rests on a corpus built for the purpose: the first Korean speech corpus of
children with autism spectrum disorder, with acoustic and linguistic analysis of
pronunciation and communication traits.
```

`src/content/research/ckd-speech.md`:

```markdown
---
title: "Speech-based detection and staging of chronic kidney disease"
order: 4
featured: false
venues: ["Interspeech 2023", "Interspeech 2025", "Phonetics and Speech Sciences 2022", "O-COCOSDA 2022"]
status: published
dek: "A purpose-built CKD speech corpus, glottal-source analysis of what the disease does to the voice, and transformer fusion of glottal and spectrogram features with explanations clinicians can read."
media:
  type: image
  src: /assets/images/research/ckd-spectrogram.png   # produced by scripts/encode-media.sh (Task 4)
  alt: "Two spectrograms stacked vertically, a control speaker above and a speaker with chronic kidney disease below, with glottal flow waveforms beneath each."
  caption: "Spectrogram and glottal flow for the same utterance, control above and CKD below. Silent visualisation; no audio is published. Source: SNUBH CKD voice-banking cohort."
---

Chronic kidney disease changes the voice, and the changes are measurable before they are
audible. The work started by building the corpus that did not exist — the first speech
corpus for CKD — then characterised what the disease does to the glottal source, and used
those features for automatic detection and severity estimation.

The later model fuses glottal and spectrogram representations in a transformer and carries
explanation with it, because a screening tool that cannot say which acoustic property drove
its output is not usable in a renal clinic.

Recordings were collected with Seoul National University Bundang Hospital. Patient audio is
not published; the figures here are silent visualisations.
```

`src/content/research/asd-severity.md`:

```markdown
---
title: "Automatic social-communication severity assessment for children with ASD"
order: 5
featured: false
venues: ["Interspeech 2024", "Interspeech 2025", "ICCHP 2024", "LREC-COLING 2024"]
status: published
dek: "The first Korean corpus of children with ASD, speech recognition adapted to it, and a cascaded model that reads segmental and suprasegmental evidence to predict clinician severity scores."
media:
  type: image
  src: /assets/images/research/asd-pipeline.png   # produced by scripts/encode-media.sh (Task 4)
  alt: "A cascaded pipeline diagram running from a child's speech through an adapted speech recogniser and segmental and suprasegmental feature extraction to a predicted severity score."
  caption: "The cascaded assessment pipeline. Each stage's output is both an input to the next and an explanation of it. Child speech is not published; the diagram shows system structure only."
---

Children with autism spectrum disorder are poorly served by speech recognisers trained on
typical adult speech, so the assessment system had to start one layer lower: a recogniser
adapted to this population, on a corpus built for it.

On top of that sits a cascaded multimodal model that predicts clinician-assigned social
communication severity from both what was said and how it was said. Keeping the stages
separate means each one can be inspected, which matters more here than an end-to-end
number would.

The severity-scoring system is the subject of a filed patent and of two registered software
works; the registrations are held by the SNU R&DB Foundation.
```

`src/content/research/evaluation-reliability.md`:

```markdown
---
title: "Evaluation and reliability of clinical machine learning"
order: 6
featured: false
venues: ["IEEE TCDS", "NeurIPS Datasets & Benchmarks (target)"]
status: submitted
dek: "An explainable dysgraphia-detection pipeline built around unbiased evaluation and feature attribution — and a follow-up asking how much of a reported clinical result is the protocol rather than the model."
media:
  type: image
  src: /assets/images/research/protocol-spread.svg   # hand-authored in Task 4; carries no numbers
  alt: "A schematic in which one fixed dataset fans out through four protocol choices and the reported scores land at scattered positions on an unlabelled axis."
  caption: "Schematic, not results: one cohort, several individually defensible protocols, and the spread in what gets reported. No values are shown — the measurements belong to work still under review."
---

Small clinical datasets give the analyst a great deal of freedom, and the freedom is mostly
invisible in the write-up. The submitted work builds a dysgraphia-detection pipeline whose
first commitment is unbiased evaluation, with feature attribution and exploratory subgroup
characterisation on top of it.

The follow-up takes the question directly: hold the data and the label fixed, vary only
choices a reviewer would wave through — the split scheme, the feature set, how
normalisation and hyperparameter selection are arranged — and measure how far the reported
number moves. Where it moves further than the improvements papers claim, the improvement
was never the finding.
```

`src/content/research/resources.md`:

```markdown
---
title: "Corpora and systems built"
order: 7
featured: false
venues: ["2 software registrations", "1 open code release"]
status: published
dek: "The first speech corpus for chronic kidney disease and the first Korean corpus of children with ASD; phonetic transcription toolkits for L1 and L2 Korean; and two systems registered with the Korea Copyright Commission."
media:
  type: image
  src: /assets/images/research/systems.png   # produced by scripts/encode-media.sh (Task 4)
  alt: "A schematic showing a raw pen file passing through feature extraction and a normative reference to produce an uncertainty-aware profile report."
  caption: "The handwriting-profiling reference implementation, from raw pen file to profile report. This is the one component released publicly."
links:
  - label: "handwriting-process-profiling"
    href: "https://github.com/jihyunmun/handwriting-process-profiling"
---

Several of these projects needed data or tooling that did not exist yet.

**Corpora.** The first speech corpus for chronic kidney disease, built with Seoul National
University Bundang Hospital, and the first Korean speech corpus of children with autism
spectrum disorder. Both are clinical collections and are not publicly redistributable.

**Toolkits.** Automatic phonetic transcription for L1 Korean and for L2 Korean learner
speech, built under National Information Society Agency projects.

**Open release.** The handwriting-profiling vocabulary, analysis code, and reference
implementation are public under MIT, with derived data under CC-BY-4.0. The hosted scoring
API is in preparation.

**Registered software.** Two works registered with the Korea Copyright Commission:
an automatic speech recognition system for semi-spontaneous speech of children with ASD
(C-2026-046494, registered 2026-09-17), and a social communication severity assessment
model for children with autism (C-2024-033498, registered 2024-09-25). Rights for both are
held by the SNU R&DB Foundation; developed by J. Mun.
```

- [ ] **Step 5: Write the four news entries**

`src/content/news/2026-09-preprint.md`:

```markdown
---
date: 2026-09-14
text: "Preprint and open code release for the handwriting-profiling instrument — arXiv:2609.15435, under review at *Behavior Research Methods*."
---
```

`src/content/news/2026-09-registration.md`:

```markdown
---
date: 2026-09-17
text: "ASD semi-spontaneous speech recognition system registered with the Korea Copyright Commission (C-2026-046494)."
---
```

`src/content/news/2026-01-postdoc.md`:

```markdown
---
date: 2026-01-01
text: "Joined Samovar, Télécom SudParis as a postdoctoral researcher."
---
```

`src/content/news/2025-08-phd.md`:

```markdown
---
date: 2025-08-04
text: "Ph.D. in Linguistics conferred, Seoul National University."
---
```

- [ ] **Step 6: Write `src/content/publications.yaml`**

```yaml
- id: interspeech-2025-ckd
  year: 2025
  title: "Speech-Based Automatic Chronic Kidney Disease Diagnosis via Transformer Fusion of Glottal and Spectrogram Features"
  authors: "Mun, J., Kim, S., & Chung, M."
  venue: "Interspeech 2025"
  type: conference
  pdf: /assets/pdfs/2025_interspeech_ckd.pdf
  thumb: /assets/images/2025_interspeech_ckd.png
  research: ckd-speech

- id: interspeech-2025-asd
  year: 2025
  title: "A Cascaded Multimodal Framework for Automatic Social Communication Severity Assessment in Children with Autism Spectrum Disorder"
  authors: "Mun, J., Kim, S., & Chung, M."
  venue: "Interspeech 2025"
  type: conference
  pdf: /assets/pdfs/2025_interspeech_asd.pdf
  thumb: /assets/images/2025_interspeech_asd.png
  research: asd-severity

- id: interspeech-2024-asd
  year: 2024
  title: "Developing an End-to-End Framework for Predicting the Social Communication Severity Scores of Children with Autism Spectrum Disorder"
  authors: "Mun, J., Kim, S., & Chung, M."
  venue: "Interspeech 2024"
  type: conference
  pdf: /assets/pdfs/2024_interspeech.pdf
  thumb: /assets/images/2024_interspeech.png
  research: language-models-assessment

- id: icchp-2024
  year: 2024
  title: "Automatic Speech Recognition and Assessment Systems Incorporated into Digital Therapeutics for Children with Autism Spectrum Disorder"
  authors: "Lee, S., Mun, J., Kim, S., Park, H., Yang, S., Kim, H., Noh, S., Kim, W., & Chung, M."
  venue: "ICCHP 2024"
  type: conference
  pdf: /assets/pdfs/2024_icchp.pdf
  thumb: /assets/images/2024_icchp.png
  research: asd-severity

- id: lrec-coling-2024
  year: 2024
  title: "Speech Corpus for Korean Children with Autism Spectrum Disorder: Towards Automatic Assessment Systems"
  authors: "Lee, S., Mun, J., Kim, S., & Chung, M."
  venue: "LREC-COLING 2024"
  type: conference
  pdf: /assets/pdfs/2024_lrec.pdf
  research: language-models-assessment

- id: interspeech-2023-ckd
  year: 2023
  title: "An Analysis of Glottal Features of Chronic Kidney Disease Speech and Its Application to CKD Detection"
  authors: "Mun, J., Kim, S., Kim, M. J., Ryu, J., Kim, S., & Chung, M."
  venue: "Interspeech 2023"
  type: conference
  pdf: /assets/pdfs/2023_interspeech.pdf
  research: ckd-speech

- id: cocosda-2022
  year: 2022
  title: "A Speech Corpus for Chronic Kidney Disease"
  authors: "Mun, J., Kim, S., Kim, M. J., Ryu, J., Kim, S., & Chung, M."
  venue: "Oriental COCOSDA 2022"
  type: conference
  pdf: /assets/pdfs/2022_cocosda.pdf
  research: ckd-speech

- id: pss-2022
  year: 2022
  title: "Automatic detection and severity prediction of chronic kidney disease using machine learning classifiers"
  authors: "Mun, J., Kim, S., Kim, M. J., Ryu, J., Kim, S., & Chung, M."
  venue: "Phonetics and Speech Sciences, 14(4), 45–56"
  type: journal
  pdf: /assets/pdfs/2022_phonetics-and-sciences.pdf
  research: ckd-speech

- id: pss-2021
  year: 2021
  title: "Acoustic analysis of Korean affricates produced by dysarthric speakers with cerebral palsy"
  authors: "Mun, J., Kim, S., & Chung, M."
  venue: "Phonetics and Speech Sciences, 13(2), 45–55"
  type: journal
  pdf: /assets/pdfs/2021_phonetics-and-sciences.pdf

- id: arxiv-2609-15435
  year: 2026
  title: "Profiling Handwriting-Process Deviations in Developmental Dysgraphia: An Open, Normatively-Referenced Instrument"
  authors: "Mun, J., & El-Yacoubi, M. A."
  venue: "Under review, Behavior Research Methods"
  type: preprint
  url: "https://arxiv.org/abs/2609.15435"
  code: "https://github.com/jihyunmun/handwriting-process-profiling"
  research: handwriting-profiling

- id: tcds-dysgraphia
  year: 2026
  title: "An Explainable Machine Learning Pipeline for Online-Handwriting-Based Dysgraphia Detection: Unbiased Evaluation, Feature Attribution, and Exploratory Subgroup Characterization"
  authors: "Mun, J., & El-Yacoubi, M. A."
  venue: "Under review, IEEE Transactions on Cognitive and Developmental Systems"
  type: preprint
  research: evaluation-reliability

- id: pipeline-lottery
  year: 2026
  title: "Decomposing reported performance in small-sample clinical ML"
  authors: "Mun, J., & El-Yacoubi, M. A."
  venue: "In preparation"
  type: in-preparation
  research: evaluation-reliability
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
npm test
```

Expected: 7 passing. If the build reports a schema error, the failing field is named in the message — fix the front matter, not the schema.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: research, news and publication content collections"
```

---

### Task 4: Media pipeline — hero clip and the six card figures

**Files:**
- Create: `scripts/encode-media.sh`
- Create: `public/assets/images/research/protocol-spread.svg` (hand-authored)
- Create (generated): `public/media/handwriting-surprise.{mp4,webm,jpg}`
- Create (generated): `public/assets/images/research/{profile-radar,lm-adaptation,ckd-spectrogram,asd-pipeline,systems}.png`
- Test: `tests/media.test.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: every `media.src` path referenced by the seven research entries in Task 3.

**Figure sources.** Five of the six card figures are downscaled from figures that already
exist; the sixth is drawn by hand because its measurements are still under review.

| Output | Source | Note |
|---|---|---|
| `profile-radar.png` | `$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/figure_group_profile.png` | 227 KB original |
| `lm-adaptation.png` | `public/assets/images/2024_interspeech.png` (already in repo) | 29 KB original |
| `ckd-spectrogram.png` | `public/assets/images/2025_interspeech_ckd.png` (already in repo) | 139 KB original |
| `asd-pipeline.png` | `public/assets/images/asd_model_final.png` (already in repo) | 533 KB — must shrink |
| `systems.png` | `$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/system_architecture.png` | 186 KB original |
| `protocol-spread.svg` | hand-authored in Step 3b | **no numbers** — the TCDS results are under review |

- [ ] **Step 1: Write the failing test**

Create `tests/media.test.mjs`:

```javascript
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
    for (const m of body.matchAll(/^\s+(?:src|webm|poster):\s*(\/\S+?)(?:\s|$)/gm)) {
      const s = await stat(join(pub, m[1].slice(1)));
      assert.ok(s.size > 0, `${m[1]} (from ${f}) is empty`);
      assert.ok(s.size <= 300 * 1024 || m[1].endsWith('.mp4') || m[1].endsWith('.webm'),
        `${m[1]} is ${Math.round(s.size / 1024)} KB — downscale it`);
    }
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tests/media.test.mjs
```

Expected: FAIL — ENOENT on `public/media/handwriting-surprise.mp4`.

- [ ] **Step 3: Write `scripts/encode-media.sh`**

```bash
#!/usr/bin/env bash
# Re-encode research source clips into web-ready assets in public/media/.
#
# Source clips live in the research workspace, not in this repo. Re-run this
# script when a source clip is re-rendered; commit the outputs.
set -euo pipefail

SRC_ROOT="${SRC_ROOT:-$HOME/Desktop/postdoc/projects}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$OUT"

# name | source path | speed-up factor
CLIPS=(
  "handwriting-surprise|$SRC_ROOT/dysgraphia/trajectory-viz/output/comparisons/diagramo_dictation_speed__speed.mp4|9"
)

for spec in "${CLIPS[@]}"; do
  IFS='|' read -r name src speed <<< "$spec"

  if [[ ! -f "$src" ]]; then
    echo "missing source for $name: $src" >&2
    exit 1
  fi

  echo "encoding $name (${speed}x)"

  ffmpeg -v error -y -i "$src" \
    -filter:v "setpts=PTS/${speed},fps=25" -an \
    -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p \
    -movflags +faststart "$OUT/$name.mp4"

  ffmpeg -v error -y -i "$src" \
    -filter:v "setpts=PTS/${speed},fps=25" -an \
    -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 \
    "$OUT/$name.webm"

  # Poster: the last frame, so the still shows the completed writing.
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$name.mp4")
  seek=$(awk -v d="$dur" 'BEGIN { printf "%.2f", (d > 0.2 ? d - 0.2 : 0) }')
  ffmpeg -v error -y -ss "$seek" -i "$OUT/$name.mp4" -frames:v 1 -q:v 4 "$OUT/$name.jpg"

  for f in "$OUT/$name.mp4" "$OUT/$name.webm" "$OUT/$name.jpg"; do
    bytes=$(wc -c < "$f")
    printf '  %-40s %6s KB\n' "$(basename "$f")" "$((bytes / 1024))"
    if (( bytes > 2097152 )); then
      echo "  ERROR: $(basename "$f") exceeds the 2 MB budget" >&2
      exit 1
    fi
  done
done

# ---------------------------------------------------------------- figures --
# Card figures are downscaled to a single web width. Re-rendering them properly
# (bigger tick labels, tighter axes, dark-mode-aware SVG) is follow-up work;
# this step only makes them the right size to ship.
FIGS="$(cd "$(dirname "$0")/.." && pwd)/public/assets/images/research"
REPO_IMG="$(cd "$(dirname "$0")/.." && pwd)/public/assets/images"
mkdir -p "$FIGS"

# name | source path
FIGURES=(
  "profile-radar|$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/figure_group_profile.png"
  "systems|$SRC_ROOT/dysgraphia/motor-domain-profiling/paper/figures/system_architecture.png"
  "lm-adaptation|$REPO_IMG/2024_interspeech.png"
  "ckd-spectrogram|$REPO_IMG/2025_interspeech_ckd.png"
  "asd-pipeline|$REPO_IMG/asd_model_final.png"
)

for spec in "${FIGURES[@]}"; do
  IFS='|' read -r name src <<< "$spec"

  if [[ ! -f "$src" ]]; then
    echo "missing figure source for $name: $src" >&2
    exit 1
  fi

  ffmpeg -v error -y -i "$src" \
    -vf "scale='min(1200,iw)':-2:flags=lanczos" \
    -compression_level 100 "$FIGS/$name.png"

  bytes=$(wc -c < "$FIGS/$name.png")
  printf '  %-40s %6s KB\n' "$name.png" "$((bytes / 1024))"
  if (( bytes > 307200 )); then
    echo "  ERROR: $name.png is over 300 KB; lower the scale width" >&2
    exit 1
  fi
done

echo "done"
```

- [ ] **Step 3b: Hand-author `public/assets/images/research/protocol-spread.svg`**

This card's real measurements are under review, so the figure states the shape of the
argument and shows no values. The axis is deliberately unlabelled.

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img"
     aria-label="One dataset fans out through four protocol choices; the reported scores land at scattered positions on an unlabelled axis.">
  <style>
    .lbl { font: 11px "IBM Plex Mono", monospace; fill: #8A9098; letter-spacing: .04em; }
    .rule { stroke: #DBDDD6; }
    .dot { fill: #1B2A6B; fill-opacity: .55; }
    .dot.hi { fill: #C0442F; fill-opacity: .7; }
    .box { fill: none; stroke: #DBDDD6; }
    @media (prefers-color-scheme: dark) {
      .lbl { fill: #6E747C; }
      .rule, .box { stroke: #2A2E35; }
      .dot { fill: #5B73D8; }
      .dot.hi { fill: #E46A52; }
    }
  </style>

  <text class="lbl" x="28" y="32">ONE COHORT, ONE LABEL</text>
  <rect class="box" x="28" y="176" width="96" height="44" rx="2"/>
  <text class="lbl" x="76" y="202" text-anchor="middle">dataset</text>

  <g class="rule" fill="none" stroke-width="1">
    <path d="M124 198 C 156 198, 160 96,  196 96"/>
    <path d="M124 198 C 156 198, 160 164, 196 164"/>
    <path d="M124 198 C 156 198, 160 232, 196 232"/>
    <path d="M124 198 C 156 198, 160 300, 196 300"/>
  </g>

  <g>
    <rect class="box" x="196" y="78"  width="148" height="34" rx="2"/>
    <rect class="box" x="196" y="146" width="148" height="34" rx="2"/>
    <rect class="box" x="196" y="214" width="148" height="34" rx="2"/>
    <rect class="box" x="196" y="282" width="148" height="34" rx="2"/>
    <text class="lbl" x="210" y="100">split scheme</text>
    <text class="lbl" x="210" y="168">feature set</text>
    <text class="lbl" x="210" y="236">normalisation</text>
    <text class="lbl" x="210" y="304">tuning protocol</text>
  </g>

  <line class="rule" x1="396" y1="340" x2="612" y2="340"/>
  <text class="lbl" x="396" y="362">reported performance →</text>

  <g>
    <circle class="dot"    cx="436" cy="95"  r="4"/>
    <circle class="dot"    cx="486" cy="95"  r="4"/>
    <circle class="dot hi" cx="580" cy="95"  r="4"/>
    <circle class="dot"    cx="462" cy="163" r="4"/>
    <circle class="dot"    cx="522" cy="163" r="4"/>
    <circle class="dot hi" cx="566" cy="163" r="4"/>
    <circle class="dot"    cx="448" cy="231" r="4"/>
    <circle class="dot"    cx="500" cy="231" r="4"/>
    <circle class="dot"    cx="538" cy="231" r="4"/>
    <circle class="dot"    cx="424" cy="299" r="4"/>
    <circle class="dot"    cx="506" cy="299" r="4"/>
    <circle class="dot hi" cx="592" cy="299" r="4"/>
  </g>

  <g class="rule" stroke-dasharray="2 4">
    <line x1="396" y1="70" x2="396" y2="326"/>
    <line x1="612" y1="70" x2="612" y2="326"/>
  </g>
  <text class="lbl" x="396" y="60">worse</text>
  <text class="lbl" x="612" y="60" text-anchor="end">better</text>
</svg>
```

- [ ] **Step 4: Run the encoder**

```bash
cd ~/jihyunmun.github.io
chmod +x scripts/encode-media.sh
npm run encode-media
```

Expected: three clip files plus five PNGs written, every printed size inside its budget
(the MP4 was 181 KB when this was measured). If `asd-pipeline.png` still exceeds 300 KB,
lower `min(1200,iw)` to `min(900,iw)` for that entry rather than raising the limit.

- [ ] **Step 5: Run the test to verify it passes**

```bash
node --test tests/media.test.mjs
```

Expected: 4 passing.

- [ ] **Step 6: Commit**

```bash
git add scripts/encode-media.sh public/media public/assets/images/research tests/media.test.mjs
git commit -m "feat: media pipeline for the hero clip and card figures"
```

---

### Task 5: `ResearchMedia` component

**Files:**
- Create: `src/components/ResearchMedia.astro`
- Modify: `src/pages/index.astro` (temporary harness, replaced in Task 7)
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: the `media` object shape from Task 3.
- Produces: `<ResearchMedia media={entry.data.media} ratio="16/7" | "5/3" loading="eager" | "lazy" />`. Renders `<figure>` → (`<video>` | `<img>`) + `<figcaption>`.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('video is poster-first and never preloads', async () => {
  const page = await html('index.html');
  const video = page.match(/<video[^>]*>/);
  assert.ok(video, 'no <video> element rendered');
  const tag = video[0];
  assert.match(tag, /\bmuted\b/, 'video is not muted');
  assert.match(tag, /\bplaysinline\b/, 'video is missing playsinline');
  assert.match(tag, /\bloop\b/, 'video is not looping');
  assert.match(tag, /preload="none"/, 'video preloads');
  assert.match(tag, /poster="[^"]+"/, 'video has no poster');
  assert.doesNotMatch(tag, /\bautoplay\b/, 'video autoplays unconditionally');
});

test('every figure carries a caption', async () => {
  const page = await html('index.html');
  const figures = page.match(/<figure[\s\S]*?<\/figure>/g) ?? [];
  assert.ok(figures.length > 0, 'no figures rendered');
  for (const f of figures) {
    assert.match(f, /<figcaption[\s\S]*?\S[\s\S]*?<\/figcaption>/, 'figure without caption');
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — no `<video>` element rendered.

- [ ] **Step 3: Write `src/components/ResearchMedia.astro`**

```astro
---
interface Media {
  type: 'video' | 'image';
  src: string;
  webm?: string;
  poster?: string;
  alt: string;
  caption: string;
}
interface Props {
  media: Media;
  ratio?: string;
  loading?: 'eager' | 'lazy';
}
const { media, ratio = '5 / 3', loading = 'lazy' } = Astro.props;
---
<figure class="media" style={`--ratio: ${ratio}`}>
  {media.type === 'video' ? (
    <video
      class="js-clip"
      poster={media.poster}
      aria-label={media.alt}
      muted
      loop
      playsinline
      preload="none"
      tabindex="0"
    >
      {media.webm && <source src={media.webm} type="video/webm" />}
      <source src={media.src} type="video/mp4" />
    </video>
  ) : (
    <img src={media.src} alt={media.alt} loading={loading} decoding="async" />
  )}
  <figcaption>{media.caption}</figcaption>
</figure>

<style>
  .media { margin: 0; }
  .media > video,
  .media > img {
    width: 100%;
    aspect-ratio: var(--ratio);
    object-fit: contain;
    background: var(--well);
    border: 1px solid var(--rule);
  }
  figcaption {
    font-family: var(--mono);
    font-size: 11px;
    line-height: 1.55;
    color: var(--faint);
    margin-top: 8px;
    max-width: 78ch;
  }
</style>

<script>
  // Plays only on intent: hover or focus on a pointer device, one pass into
  // view on touch. Never plays when the visitor asked for reduced motion.
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  for (const clip of document.querySelectorAll<HTMLVideoElement>('video.js-clip')) {
    if (calm.matches) continue;

    const play = () => { clip.play().catch(() => {}); };
    const stop = () => { clip.pause(); clip.currentTime = 0; clip.load(); };

    if (fine.matches) {
      clip.addEventListener('mouseenter', play);
      clip.addEventListener('focus', play);
      clip.addEventListener('mouseleave', stop);
      clip.addEventListener('blur', stop);
    } else {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          play();
          io.unobserve(e.target);
        }
      }, { threshold: 0.5 });
      io.observe(clip);
    }
  }
</script>
```

- [ ] **Step 4: Add a temporary harness to the index page**

Replace `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import ResearchMedia from '../components/ResearchMedia.astro';
import { getEntry } from 'astro:content';

const featured = await getEntry('research', 'handwriting-surprise');
if (!featured) throw new Error('handwriting-surprise entry missing');
---
<Base title="Jihyun Mun">
  <h1>Jihyun Mun</h1>
  <ResearchMedia media={featured.data.media} ratio="16 / 7" loading="eager" />
</Base>
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test
```

Expected: 9 passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: poster-first, motion-safe research media component"
```

---

### Task 6: `StatusBadge` and `ResearchCard`

**Files:**
- Create: `src/components/StatusBadge.astro`, `src/components/ResearchCard.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `ResearchMedia` from Task 5; the `research` schema from Task 3.
- Produces:
  - `<StatusBadge status={'published' | 'under-review' | 'submitted' | 'in-preparation'} />` → a `<span class="badge">` whose text is `Published` / `Under review` / `Submitted` / `In preparation`; `published` renders nothing.
  - `<ResearchCard entry={CollectionEntry<'research'>} featured={boolean} />`.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('non-published work is labelled', async () => {
  const page = await html('research/index.html');
  for (const label of ['Under review', 'Submitted', 'In preparation']) {
    assert.ok(page.includes(label), `status label "${label}" never appears`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `dist/research/index.html` does not exist yet.

- [ ] **Step 3: Write `src/components/StatusBadge.astro`**

```astro
---
interface Props { status: 'published' | 'under-review' | 'submitted' | 'in-preparation' }
const { status } = Astro.props;
const LABEL = {
  'published': null,
  'under-review': 'Under review',
  'submitted': 'Submitted',
  'in-preparation': 'In preparation',
} as const;
const label = LABEL[status];
---
{label && <span class="badge">{label}</span>}

<style>
  .badge {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: .05em;
    color: var(--fig-peak);
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 4: Write `src/components/ResearchCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import ResearchMedia from './ResearchMedia.astro';
import StatusBadge from './StatusBadge.astro';

interface Props {
  entry: CollectionEntry<'research'>;
  featured?: boolean;
}
const { entry, featured = false } = Astro.props;
const { title, venues, status, dek, media } = entry.data;
const href = `/research/${entry.id}/`;
---
<article class:list={['card', featured && 'featured']}>
  <a class="frame" href={href} aria-label={title}>
    <ResearchMedia
      media={media}
      ratio={featured ? '16 / 7' : '5 / 3'}
      loading={featured ? 'eager' : 'lazy'}
    />
  </a>
  <h3><a href={href}>{title}</a></h3>
  <p class="meta">
    {venues.map((v) => <span>{v}</span>)}
    <StatusBadge status={status} />
  </p>
  <p class="dek">{dek}</p>
</article>

<style>
  .card { display: block; }
  .frame { display: block; text-decoration: none; }
  h3 {
    font-family: var(--serif);
    font-size: 20px;
    line-height: 1.25;
    margin-top: 15px;
  }
  .featured h3 { font-size: 25px; letter-spacing: -.01em; }
  h3 a { text-decoration: none; }
  h3 a:hover { color: var(--accent); }
  .meta {
    display: flex; flex-wrap: wrap; gap: 10px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .05em;
    color: var(--faint); margin: 7px 0 0;
  }
  .dek {
    color: var(--soft);
    font-size: 14.5px;
    margin: 9px 0 0;
    max-width: 70ch;
  }
  .featured .dek { font-size: 15px; }
</style>
```

- [ ] **Step 5: Write `src/pages/research/index.astro`**

```astro
---
import Base from '../../layouts/Base.astro';
import ResearchCard from '../../components/ResearchCard.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('research', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order);
const [featured, ...rest] = entries;
---
<Base title="Research — Jihyun Mun" page="research">
  <p class="eyebrow sec">Research</p>
  <div class="feature"><ResearchCard entry={featured} featured /></div>
  <div class="grid">
    {rest.map((entry) => <ResearchCard entry={entry} />)}
  </div>
</Base>

<style>
  .sec { border-top: 1px solid var(--rule); padding-top: 12px; margin: 48px 0 30px; }
  .feature { margin-bottom: 76px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 56px 40px; }
  @media (max-width: 760px) { .grid { grid-template-columns: 1fr; gap: 44px; } }
</style>
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
npm test
```

Expected: 10 passing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: research card, status badge and research index"
```

---

### Task 7: Landing page

**Files:**
- Create: `src/components/NewsList.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `ResearchCard` (Task 6), `news` collection (Task 3).
- Produces: the landing page. `NewsList` takes `<NewsList limit={4} />` and renders newest first.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('landing page carries the positioning, contact and all seven cards', async () => {
  const page = await html('index.html');
  assert.ok(page.includes('Samovar, Télécom SudParis'), 'affiliation missing');
  assert.ok(page.includes('jihyun.mun@telecom-sudparis.eu'), 'new email missing');
  assert.ok(!page.includes('jhhh_1202@snu.ac.kr'), 'old SNU email still present');
  assert.ok(!/scholar\.google/i.test(page), 'Google Scholar link present');
  assert.ok(!page.includes('portrait.jpg'), 'portrait is referenced');

  const cards = page.match(/<article class="card/g) ?? [];
  assert.equal(cards.length, 7, `expected 7 research cards, found ${cards.length}`);
});

test('news shows four dated items, newest first', async () => {
  const page = await html('index.html');
  const times = [...page.matchAll(/<time datetime="(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]);
  assert.equal(times.length, 4, `expected 4 news items, found ${times.length}`);
  const sorted = [...times].sort().reverse();
  assert.deepEqual(times, sorted, 'news is not newest-first');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — affiliation not found on the index page.

- [ ] **Step 3: Write `src/components/NewsList.astro`**

```astro
---
import { getCollection } from 'astro:content';

interface Props { limit?: number }
const { limit = 4 } = Astro.props;

const items = (await getCollection('news'))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, limit);

const fmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit' });
const iso = (d: Date) => d.toISOString().slice(0, 10);
---
<section class="news" aria-labelledby="news-heading">
  <h2 id="news-heading" class="eyebrow">News</h2>
  <ol>
    {items.map((n) => (
      <li>
        <time datetime={iso(n.data.date)}>{fmt.format(n.data.date).replace('-', '.')}</time>
        <span set:html={n.data.text.replace(/\*(.+?)\*/g, '<em>$1</em>')} />
      </li>
    ))}
  </ol>
</section>

<style>
  .news { border-top: 1px solid var(--rule); padding-top: 14px; }
  ol { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 11px; }
  li {
    display: grid; grid-template-columns: 62px minmax(0, 1fr); gap: 10px;
    font-size: 13.5px; line-height: 1.45;
  }
  time {
    font-family: var(--mono); font-size: 11.5px; color: var(--faint);
    padding-top: 2px; font-variant-numeric: tabular-nums;
  }
</style>
```

- [ ] **Step 4: Write `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import ResearchCard from '../components/ResearchCard.astro';
import NewsList from '../components/NewsList.astro';
import { getCollection } from 'astro:content';

const entries = (await getCollection('research', ({ data }) => !data.draft))
  .sort((a, b) => a.data.order - b.data.order);
const [featured, ...rest] = entries;

const links = [
  { label: 'GitHub', href: 'https://github.com/jihyunmun' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jihyun-mun-b65a58142/' },
  { label: 'CV (PDF)', href: '/assets/pdfs/cv.pdf' },
  { label: 'Email', href: 'mailto:jihyun.mun@telecom-sudparis.eu' },
];
---
<Base title="Jihyun Mun">
  <header class="hero">
    <div>
      <h1>Making atypical speech and handwriting measurable.</h1>
      <p class="role">Postdoctoral Researcher · Samovar, Télécom SudParis, Institut Polytechnique de Paris</p>
      <p class="bio">
        I build <em>clinically reliable, interpretable</em> models for speech and handwriting
        produced by people with disorders, diseases and disabilities — chronic kidney disease,
        autism spectrum disorder, developmental dysgraphia. The work runs from corpus design and
        acoustic or kinematic analysis through modelling to the evaluation protocols that decide
        whether a clinical result is real.
      </p>
      <p class="links">
        {links.map((l) => <a href={l.href}>{l.label}</a>)}
      </p>
    </div>
    <NewsList limit={4} />
  </header>

  <p class="eyebrow sec">Selected research</p>
  <div class="feature"><ResearchCard entry={featured} featured /></div>
  <div class="grid">
    {rest.map((entry) => <ResearchCard entry={entry} />)}
  </div>
</Base>

<style>
  .hero {
    padding-block: 84px 52px;
    display: grid; gap: 28px;
    grid-template-columns: minmax(0, 1fr) 280px;
    align-items: start;
  }
  @media (max-width: 760px) {
    .hero { grid-template-columns: 1fr; padding-block: 52px 36px; }
  }
  h1 { font-size: clamp(38px, 6.4vw, 60px); line-height: 1.04; letter-spacing: -.02em; }
  .role {
    font-family: var(--mono); font-size: 13px; letter-spacing: .04em;
    color: var(--accent); margin: 18px 0 0;
  }
  .bio { max-width: 62ch; color: var(--soft); margin: 18px 0 0; font-size: 17px; }
  .bio em { color: var(--ink); font-style: normal; }
  .links {
    display: flex; flex-wrap: wrap; gap: 8px 14px; margin: 26px 0 0;
    font-family: var(--mono); font-size: 12.5px;
  }
  .links a {
    text-decoration: none; color: var(--soft);
    border-bottom: 1px solid var(--rule); padding-bottom: 2px;
  }
  .links a:hover { color: var(--accent); border-bottom-color: var(--accent); }
  .sec { border-top: 1px solid var(--rule); padding-top: 12px; margin: 0 0 30px; }
  .feature { margin-bottom: 76px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 56px 40px; }
  @media (max-width: 760px) { .grid { grid-template-columns: 1fr; gap: 44px; } }
</style>
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test
```

Expected: 12 passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: landing page with hero, news and selected research"
```

---

### Task 8: Research detail pages

**Files:**
- Create: `src/pages/research/[id].astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `research` collection, `ResearchMedia`, `StatusBadge`.
- Produces: one page per entry at `/research/<id>/`, matching the `href` that `ResearchCard` already emits.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('every research card links to a page that exists', async () => {
  const page = await html('index.html');
  const hrefs = [...new Set(
    [...page.matchAll(/href="\/research\/([a-z0-9-]+)\/"/g)].map((m) => m[1]),
  )];
  assert.equal(hrefs.length, 7, `expected 7 distinct detail links, found ${hrefs.length}`);
  for (const id of hrefs) {
    assert.ok(await exists(`research/${id}/index.html`), `/research/${id}/ was not built`);
  }
});

test('detail pages surface their external links', async () => {
  const page = await html('research/handwriting-profiling/index.html');
  assert.ok(page.includes('https://arxiv.org/abs/2609.15435'), 'arXiv link missing');
  assert.ok(
    page.includes('https://github.com/jihyunmun/handwriting-process-profiling'),
    'code link missing',
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `research/handwriting-surprise/index.html` was not built.

- [ ] **Step 3: Write `src/pages/research/[id].astro`**

```astro
---
import type { GetStaticPaths } from 'astro';
import Base from '../../layouts/Base.astro';
import ResearchMedia from '../../components/ResearchMedia.astro';
import StatusBadge from '../../components/StatusBadge.astro';
import { getCollection, render } from 'astro:content';

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getCollection('research', ({ data }) => !data.draft);
  return entries.map((entry) => ({ params: { id: entry.id }, props: { entry } }));
};

const { entry } = Astro.props;
const { title, venues, status, dek, media, links } = entry.data;
const { Content } = await render(entry);
---
<Base title={`${title} — Jihyun Mun`} description={dek} page="research">
  <article class="detail">
    <p class="eyebrow back"><a href="/research/">← Research</a></p>
    <h1>{title}</h1>
    <p class="meta">
      {venues.map((v) => <span>{v}</span>)}
      <StatusBadge status={status} />
    </p>
    <p class="dek">{dek}</p>

    <ResearchMedia media={media} ratio="16 / 7" loading="eager" />

    <div class="prose"><Content /></div>

    {links.length > 0 && (
      <p class="links">
        {links.map((l) => <a href={l.href}>{l.label} ↗</a>)}
      </p>
    )}
  </article>
</Base>

<style>
  .detail { padding-block: 48px 0; }
  .back { border-top: 1px solid var(--rule); padding-top: 12px; margin: 0 0 40px; }
  .back a { text-decoration: none; }
  h1 { font-size: clamp(30px, 4.6vw, 42px); line-height: 1.1; letter-spacing: -.015em; max-width: 24ch; }
  .meta {
    display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0 0;
    font-family: var(--mono); font-size: 11.5px; letter-spacing: .05em; color: var(--faint);
  }
  .dek { font-size: 18px; color: var(--soft); max-width: 68ch; margin: 20px 0 40px; }
  .prose { max-width: 66ch; margin-top: 44px; color: var(--ink); }
  .prose :global(p) { margin: 0 0 1.15em; }
  .prose :global(strong) { font-weight: 600; }
  .links {
    display: flex; flex-wrap: wrap; gap: 18px; margin-top: 40px;
    font-family: var(--mono); font-size: 12.5px;
  }
  .links a { color: var(--accent); text-decoration: none; border-bottom: 1px solid var(--rule); }
  .links a:hover { border-bottom-color: var(--accent); }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```

Expected: 14 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: research detail pages"
```

---

### Task 9: Publications page

**Files:**
- Create: `src/pages/publications.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `publications` collection (Task 3).
- Produces: `/publications/`, grouped by year descending, with author lists and PDF links.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('publications page lists every entry with authors and working PDFs', async () => {
  const page = await html('publications/index.html');

  const { readFile } = await import('node:fs/promises');
  const yaml = await readFile(
    new URL('../src/content/publications.yaml', import.meta.url).pathname, 'utf8',
  );
  const expected = (yaml.match(/^- id:/gm) ?? []).length;
  const rendered = (page.match(/<li class="pub"/g) ?? []).length;
  assert.equal(rendered, expected, `yaml has ${expected} entries, page renders ${rendered}`);

  assert.ok(page.includes('Lee, S., Mun, J.'), 'co-first-author entries are missing authors');

  for (const m of page.matchAll(/href="(\/assets\/pdfs\/[^"]+)"/g)) {
    assert.ok(await exists(m[1].slice(1)), `${m[1]} is linked but not built`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `dist/publications/index.html` does not exist.

- [ ] **Step 3: Write `src/pages/publications.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { getCollection } from 'astro:content';

const pubs = (await getCollection('publications'))
  .map((p) => p.data)
  .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

const years = [...new Set(pubs.map((p) => p.year))];
const TYPE = {
  conference: 'Conference',
  journal: 'Journal',
  preprint: 'Preprint',
  'in-preparation': 'In preparation',
} as const;
---
<Base title="Publications — Jihyun Mun" page="publications">
  <p class="eyebrow sec">Publications</p>
  {years.map((year) => (
    <section class="year">
      <h2>{year}</h2>
      <ol>
        {pubs.filter((p) => p.year === year).map((p) => (
          <li class="pub">
            <p class="title">{p.title}</p>
            <p class="authors">{p.authors}</p>
            <p class="meta">
              <span>{p.venue}</span>
              <span class="kind">{TYPE[p.type]}</span>
              {p.pdf && <a href={p.pdf}>PDF ↗</a>}
              {p.url && <a href={p.url}>arXiv ↗</a>}
              {p.code && <a href={p.code}>Code ↗</a>}
              {p.research && <a href={`/research/${p.research}/`}>Project →</a>}
            </p>
          </li>
        ))}
      </ol>
    </section>
  ))}
</Base>

<style>
  .sec { border-top: 1px solid var(--rule); padding-top: 12px; margin: 48px 0 40px; }
  .year { margin-bottom: 48px; }
  .year h2 {
    font-family: var(--mono); font-size: 12px; letter-spacing: .1em; color: var(--faint);
    font-weight: 500; border-bottom: 1px solid var(--rule); padding-bottom: 10px;
  }
  ol { list-style: none; margin: 0; padding: 0; }
  .pub { padding-block: 20px; border-bottom: 1px solid var(--rule); }
  .title { margin: 0; font-size: 16px; line-height: 1.4; max-width: 74ch; }
  .authors { margin: 6px 0 0; font-size: 14px; color: var(--soft); }
  .meta {
    display: flex; flex-wrap: wrap; gap: 14px; margin: 8px 0 0;
    font-family: var(--mono); font-size: 11px; letter-spacing: .04em; color: var(--faint);
  }
  .meta a { color: var(--accent); text-decoration: none; }
  .meta a:hover { text-decoration: underline; }
  .kind { color: var(--soft); }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```

Expected: 15 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: publications page"
```

---

### Task 10: CV page

**Files:**
- Create: `src/pages/cv.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: `/assets/pdfs/cv.pdf` (already in `public/`).
- Produces: `/cv/`. Content mirrors the 2026-09 CV PDF exactly: education, positions, funded projects, patents, software registrations, grants. No internship, no languages — those stay in the PDF only.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('CV page matches the PDF and attributes software rights correctly', async () => {
  const page = await html('cv/index.html');
  assert.ok(page.includes('/assets/pdfs/cv.pdf'), 'CV PDF is not linked');
  assert.ok(page.includes('C-2026-046494'), 'software registration missing');
  assert.ok(page.includes('C-2024-033498'), 'software registration missing');
  assert.ok(page.includes('SNU R&amp;DB Foundation') || page.includes('SNU R&DB Foundation'),
    'rights holder not named');
  assert.ok(page.includes('10-2024-0117393'), 'patent number missing');
  assert.ok(page.includes('Mar 2021 – Aug 2025'), 'PhD dates wrong');
  assert.ok(!page.includes('Feb 2026'), 'stale PhD conferral date present');
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `dist/cv/index.html` does not exist.

- [ ] **Step 3: Write `src/pages/cv.astro`**

```astro
---
import Base from '../layouts/Base.astro';

const education = [
  ['Integrated M.A./Ph.D., Linguistics, Seoul National University', 'Mar 2021 – Aug 2025'],
  ['B.A., Mechanical Engineering and B.A., Linguistics, Seoul National University', 'Mar 2015 – Feb 2021'],
];

const positions = [
  ['Postdoctoral Researcher, Samovar, Télécom SudParis, Institut Polytechnique de Paris', 'Jan 2026 – present'],
];

const projects = [
  ['Development of a Personalized Integrated System Combining Wearable Transcranial Magnetic Stimulation and Digital Therapeutics for Enhancing Communication in Children with Autism Spectrum Disorder',
   'Korean Ministry of Trade, Industry and Resources', '2025.04 – 2025.12'],
  ['Development of Digital Therapeutics to Improve Communication Skills of Autistic Patients',
   'Korean Institute for Information & Communication Technology Planning & Evaluation', '2022.09 – 2024.12'],
  ['Construction of a Cohort through Voice Banking of Chronic Kidney Disease Patients and Analysis of Voice Characteristics according to Renal Function',
   'Seoul National University Bundang Hospital', '2022.03 – 2024.02'],
  ['Acquiring and Utilizing Audio Big Data for Healthcare Service Design',
   'Korean Ministry of Science and ICT', '2021.03 – 2023.12'],
  ['Korean Speech Data for Western and Asian Language Users for Language Education',
   'Korean National Information Society Agency', '2022.09 – 2022.11'],
  ['Multilingual Speech Data Collection for L2 Korean Learners',
   'Korean National Information Society Agency', '2022.07 – 2022.11'],
  ['Development of Intelligent Tool-based Content Production and Enjoyment Support Technology Considering the Accessibility of the Weak in Social Communication',
   'Korean National Information Society Agency', '2021.03 – 2021.12'],
];

const software = [
  ['Automatic Speech Recognition System for Semi-spontaneous Speech of Children with Autism Spectrum Disorder',
   'Korea Copyright Commission, C-2026-046494', 'Registered 2026.09.17'],
  ['Social Communication Severity Assessment Model for Children with Autism',
   'Korea Copyright Commission, C-2024-033498', 'Registered 2024.09.25'],
];

const grants = [
  ['Subsequent generations of basic studies, Seoul National University', 'Spring – Fall 2024'],
  ['Travel Grant, College of Humanities, Seoul National University', 'LREC-COLING 2024'],
  ['Travel Grant, College of Humanities, Seoul National University', 'Interspeech 2023'],
  ['Subsequent generations of basic studies, Seoul National University', 'Spring – Fall 2023'],
  ['Son Joo-eun Creative Talent Scholarship, Seoul National University', 'Fall 2022'],
];
---
<Base title="CV — Jihyun Mun" page="cv">
  <header class="top">
    <p class="eyebrow sec">Curriculum vitae</p>
    <p class="lede">
      Jihyun Mun · Postdoctoral Researcher, Samovar, Télécom SudParis, Institut Polytechnique de Paris ·
      <a href="mailto:jihyun.mun@telecom-sudparis.eu">jihyun.mun@telecom-sudparis.eu</a>
    </p>
    <p><a class="pdf" href="/assets/pdfs/cv.pdf">Full CV (PDF) ↗</a></p>
  </header>

  <section>
    <h2 class="eyebrow">Positions</h2>
    <dl>{positions.map(([what, when]) => (<><dt>{what}</dt><dd>{when}</dd></>))}</dl>
  </section>

  <section>
    <h2 class="eyebrow">Education</h2>
    <dl>{education.map(([what, when]) => (<><dt>{what}</dt><dd>{when}</dd></>))}</dl>
  </section>

  <section>
    <h2 class="eyebrow">Funded projects</h2>
    <dl>
      {projects.map(([what, funder, when]) => (
        <>
          <dt>{what}<span class="funder">{funder}</span></dt>
          <dd>{when}</dd>
        </>
      ))}
    </dl>
  </section>

  <section>
    <h2 class="eyebrow">Patents</h2>
    <dl>
      <dt>
        Automated System for Predicting Social Communication Severity Scores of Children with
        Autism Spectrum Disorder and Method for Predicting Scores Using The Same
        <span class="funder">Application number 10-2024-0117393</span>
      </dt>
      <dd>2024</dd>
    </dl>
  </section>

  <section>
    <h2 class="eyebrow">Registered software</h2>
    <dl>
      {software.map(([what, where, when]) => (
        <>
          <dt>{what}<span class="funder">{where} · rights held by SNU R&DB Foundation; developed by J. Mun</span></dt>
          <dd>{when}</dd>
        </>
      ))}
    </dl>
  </section>

  <section>
    <h2 class="eyebrow">Grants and awards</h2>
    <dl>{grants.map(([what, when]) => (<><dt>{what}</dt><dd>{when}</dd></>))}</dl>
  </section>
</Base>

<style>
  .top { padding-block: 0 8px; }
  .sec { border-top: 1px solid var(--rule); padding-top: 12px; margin: 48px 0 24px; }
  .lede { font-size: 16px; color: var(--soft); max-width: 70ch; margin: 0; }
  .lede a { color: var(--accent); }
  .pdf {
    font-family: var(--mono); font-size: 12.5px; color: var(--accent);
    text-decoration: none; border-bottom: 1px solid var(--rule);
  }
  section { margin-top: 48px; }
  section > h2 { border-bottom: 1px solid var(--rule); padding-bottom: 10px; }
  dl {
    display: grid; grid-template-columns: minmax(0, 1fr) auto;
    gap: 0 24px; margin: 0;
  }
  @media (max-width: 640px) { dl { grid-template-columns: 1fr; } }
  dt { padding-block: 16px 0; font-size: 15px; line-height: 1.45; max-width: 74ch; }
  dd {
    margin: 0; padding-block: 16px 0; text-align: right;
    font-family: var(--mono); font-size: 11.5px; color: var(--faint);
    white-space: nowrap; font-variant-numeric: tabular-nums;
  }
  @media (max-width: 640px) { dd { text-align: left; padding-block: 4px 0; } }
  .funder {
    display: block; margin-top: 4px;
    font-family: var(--mono); font-size: 11px; color: var(--soft);
  }
</style>
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test
```

Expected: 16 passing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: CV page"
```

---

### Task 11: Redirect stubs for the old URLs

**Files:**
- Create: `src/pages/about.astro`, `src/pages/projects.astro`, `src/pages/patents.astro`, `src/pages/education.astro`, `src/pages/autism.astro`, `src/pages/ckd.astro`
- Create: `src/components/Redirect.astro`
- Test: `tests/site.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: six pages that each carry `<meta http-equiv="refresh">`, a canonical link to the destination, and a visible link for anyone whose browser does not follow the refresh.

- [ ] **Step 1: Write the failing test**

Append to `tests/site.test.mjs`:

```javascript
test('old URLs redirect to their new homes', async () => {
  const map = {
    'about': '/',
    'projects': '/cv/',
    'patents': '/cv/',
    'education': '/cv/',
    'autism': '/research/asd-severity/',
    'ckd': '/research/ckd-speech/',
  };
  for (const [from, to] of Object.entries(map)) {
    const page = await html(`${from}/index.html`);
    assert.match(page, new RegExp(`http-equiv="refresh"[^>]*url=${to.replace(/\//g, '\\/')}`),
      `/${from}/ does not refresh to ${to}`);
    assert.ok(page.includes(`href="${to}"`), `/${from}/ has no visible link to ${to}`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test
```

Expected: FAIL — `dist/about/index.html` does not exist.

- [ ] **Step 3: Write `src/components/Redirect.astro`**

```astro
---
interface Props { to: string; label: string }
const { to, label } = Astro.props;
const canonical = new URL(to, Astro.site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta http-equiv="refresh" content={`0; url=${to}`} />
    <link rel="canonical" href={canonical} />
    <title>Moved — Jihyun Mun</title>
    <style>
      body {
        margin: 0; min-height: 100%;
        display: grid; place-items: center; padding: 64px 24px;
        background: #F1F2EE; color: #15171B;
        font-family: "IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      @media (prefers-color-scheme: dark) { body { background: #101215; color: #E9E9E3; } }
      p { margin: 0; font-size: 16px; text-align: center; }
      a { color: #2A3C8F; }
      @media (prefers-color-scheme: dark) { a { color: #92A6F2; } }
    </style>
  </head>
  <body>
    <p>This page has moved. Continue to <a href={to}>{label}</a>.</p>
  </body>
</html>
```

- [ ] **Step 4: Write the six stub pages**

`src/pages/about.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/" label="the home page" />
```

`src/pages/projects.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/cv/" label="the CV" />
```

`src/pages/patents.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/cv/" label="the CV" />
```

`src/pages/education.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/cv/" label="the CV" />
```

`src/pages/autism.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/research/asd-severity/" label="the ASD assessment project" />
```

`src/pages/ckd.astro`:

```astro
---
import Redirect from '../components/Redirect.astro';
---
<Redirect to="/research/ckd-speech/" label="the CKD speech project" />
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npm test
```

Expected: 17 passing.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: redirect stubs for the previous URL structure"
```

---

### Task 12: Deploy workflow and pre-cutover verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Delete: `.github/workflows/ci.yaml`, `.github/workflows/demo_site.yml`
- Create: `tests/budget.test.mjs`

**Interfaces:**
- Consumes: the complete build.
- Produces: a workflow that builds and deploys `dist/` on every push to `master`; a size-budget test.

- [ ] **Step 1: Write the failing test**

Create `tests/budget.test.mjs`:

```javascript
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
```

- [ ] **Step 2: Run the test to verify it fails or passes**

```bash
npm test
```

If it passes immediately, that is a real result — record the measured numbers. If the poster JPEG is over 200 KB, lower its quality in `scripts/encode-media.sh` (raise `-q:v` from 4 toward 7) and re-run `npm run encode-media`.

- [ ] **Step 3: Replace the workflows**

```bash
cd ~/jihyunmun.github.io
git rm -q .github/workflows/ci.yaml .github/workflows/demo_site.yml
```

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Build
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 4: Run the full suite**

```bash
npm test
```

Expected: 23 passing across `site` (17), `media` (4) and `budget` (2) test files.

- [ ] **Step 5: Look at the site**

```bash
npm run preview
```

Open `http://localhost:4321/` and check, at 1440px and at 400px:

- the landing page shows the hero, four news items and seven cards with no horizontal scroll;
- the featured clip shows its poster at rest and plays on hover;
- `/research/`, `/research/handwriting-profiling/`, `/publications/`, `/cv/` all render;
- `/about/`, `/ckd/` redirect;
- the page is legible with the OS in dark mode and in light mode;
- with `prefers-reduced-motion` forced on, nothing plays by itself.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "ci: GitHub Pages deploy workflow and payload budget tests"
```

- [ ] **Step 7: Report before cutover — do not merge**

Cutover to `master` changes the live site and requires a GitHub settings change that only the repository owner can make (Settings → Pages → Source → **GitHub Actions**). Stop here and report:

- the measured initial payload in KB gzip;
- the encoded clip sizes;
- anything in the spec that the build does not yet satisfy.

Merging to `master` happens only on the owner's explicit instruction.

---

## Deferred — not part of this plan

Tracked in the spec §10; none of these block launch.

1. The arXiv manuscript's code-availability statement still reads `[repository URL]`. That is a paper fix, not a site fix.
2. `trajectory-viz` re-render with tighter axis limits and larger tick labels, to reclaim the dead space in the hero frame.
3. The five downscaled card figures ship at publication resolution, just smaller. Re-rendering them for the screen — larger tick labels, tighter axis limits, SVG output that follows the theme tokens — is the visual upgrade this launch does not wait for.
4. The pipeline-lottery scatter animation, once those experiments finish.
5. `LICENSE.txt` is the Hamilton theme's MIT licence. Decide separately whether it still applies.
