import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export const collections = {
  projects: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "src/data/projects",
    }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        slug: z.string(),
        excerpt: z.string(),
        tags: z.array(z.string()),
        postDate: z.date(),
        isDraft: z.boolean(),
        cover: image(),
        coverAlt: z.string(),
        url: z.url().optional(),
      }),
  }),
};
