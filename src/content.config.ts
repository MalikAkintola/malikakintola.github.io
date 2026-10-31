// The shape of every content file on the site. If a file is missing a field or has a typo,
// the build stops and names the file and the field, so a broken page is never published.
import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { mediumFeed } from './lib/medium';

// src/content/profile.yaml: name, contact details, summary, education and skills.
const profile = defineCollection({
  loader: file('src/content/profile.yaml'),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    location: z.string(),
    availability: z.string(),
    email: z.email(),
    phone: z.string().optional(),
    showPhoneOnResume: z.boolean().default(false),
    linkedin: z.url(),
    github: z.url(),
    medium: z.url(),
    twitter: z.url(),
    tagline: z.string().max(120),
    heroFact: z.string().max(140),
    bio: z.string(),
    featuredArticles: z.array(z.string()).default([]),
    resumeSummary: z.string(),
    education: z.object({
      degree: z.string(),
      school: z.string(),
      years: z.string(),
      grade: z.string(),
      award: z.string().optional(),
      coursework: z.string().optional(),
    }),
    skills: z.array(z.object({ group: z.string(), items: z.array(z.string()) })),
  }),
});

// src/content/experience.yaml: jobs, teaching and volunteering, newest first.
const experience = defineCollection({
  loader: file('src/content/experience.yaml'),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    kind: z.enum(['work', 'volunteer']),
    start: z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM, for example 2025-07'),
    end: z.union([z.literal('present'), z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM or present')]),
    location: z.string().optional(),
    points: z.array(z.string()).min(1),
  }),
});

// src/content/certifications.yaml
const certifications = defineCollection({
  loader: file('src/content/certifications.yaml'),
  schema: z.object({
    name: z.string(),
    short: z.string(),
    issuer: z.string(),
    code: z.string().optional(),
    year: z.number().int(),
    url: z.url(),
  }),
});

// src/content/projects/<project>/index.md, with the project's pictures in the same folder.
const projects = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().max(240),
      discipline: z.string(),
      year: z.number().int(),
      order: z.number(),
      featured: z.boolean().default(false),
      finding: z.string().max(14),
      findingNote: z.string().max(140),
      tools: z.array(z.string()).min(1),
      cover: image(),
      coverAlt: z.string(),
      coverPosition: z.string().default('50% 50%'),
      gallery: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),
      dashboard: z.url().optional(),
      article: z.url().optional(),
      repo: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

// Medium articles, read from the Medium feed at build time (see src/lib/medium.ts).
const writing = defineCollection({
  loader: mediumFeed('malikola223'),
  schema: z.object({ title: z.string(), url: z.url(), date: z.coerce.date(), excerpt: z.string().optional() }),
});

export const collections = { profile, experience, certifications, projects, writing };
