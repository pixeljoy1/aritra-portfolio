import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    oneLiner: z.string(),
    year: z.enum(['2024-25', '2025-26', '2026-27']),
    semesters: z.array(z.string()),
    course: z.string(),
    disciplines: z.array(z.enum(['game-environment', 'ux-systems', 'motion-lighting', 'foundations', 'research-writing'])),
    status: z.enum(['featured', 'standard', 'archive']),
    tools: z.array(z.string()).default([]),
    role: z.string(),
    duration: z.string().optional(),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
    links: z.record(z.string()).default({}),
    simulatedData: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const years = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/years' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    groups: z.array(z.object({
      semester: z.string(),
      topic: z.string(),
      items: z.array(z.object({
        title: z.string(),
        course: z.string().optional(),
        work: z.string().optional(),   // case-study slug
        note: z.string().optional(),
      })),
    })),
  }),
});

export const collections = { work, years };
