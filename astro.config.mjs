// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jihyunmun.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
