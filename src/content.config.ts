import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { sanity } from "@/lib/sanity";

const PROJECTS_QUERY = `*[_type == "project" && defined(slug.current)]{
  title,
  "slug": slug.current,
  excerpt,
  tags,
  postDate,
  isFeatured,
  cover{ asset, crop, hotspot, alt },
  url,
  body,
  seoTitle,
  seoDescription
}`;

export const collections = {
  // Published projects from Sanity (drafts are excluded by the client's
  // `published` perspective). An empty result fails the build rather than
  // shipping an empty projects page.
  projects: defineCollection({
    loader: async () => {
      const projects =
        await sanity.fetch<Array<{ slug: string }>>(PROJECTS_QUERY);
      if (!projects.length) throw new Error("Sanity: no projects returned");
      return projects.map((p) => ({ id: p.slug, ...p }));
    },
    schema: z.object({
      title: z.string(),
      slug: z.string(),
      excerpt: z.string(),
      tags: z.array(z.string()),
      postDate: z.coerce.date(),
      isFeatured: z.boolean().nullish().transform(Boolean),
      cover: z.object({
        asset: z.object({ _ref: z.string() }),
        crop: z.any().optional(),
        hotspot: z.any().optional(),
        alt: z.string(),
      }),
      url: z.url().nullish(),
      body: z.array(z.any()).nullish(),
      seoTitle: z.string().nullish(),
      seoDescription: z.string().nullish(),
    }),
  }),
};
