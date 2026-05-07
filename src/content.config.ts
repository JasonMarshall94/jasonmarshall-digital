import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export const collections = {
  projects: defineCollection({
    loader: glob({
      pattern: "**/*.md",
      base: "src/data/projects",
    }),
    schema: z.object({
      title: z.string(),
      excerpt: z.string(),
    }),
  }),
};
