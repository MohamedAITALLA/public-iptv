import { defineCollection, z } from 'astro:content';

// Typed frontmatter for future articles (Phase 1: schema only, zero articles written).
// See docs/adding-articles.md for the per-article checklist.
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(120),
    description: z.string().min(130).max(165),
    slug: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string(),
    cluster: z.string(),
    pillar: z.boolean().default(false),
    primaryKeyword: z.string(),
    supportingKeywords: z.array(z.string()).default([]),
    relatedSlugs: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    draft: z.boolean().default(false),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { blog };
