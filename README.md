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

`npm run encode-media` re-encodes source clips and figures into `public/`.
Source paths are listed at the top of `scripts/encode-media.sh`.
