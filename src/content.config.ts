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
