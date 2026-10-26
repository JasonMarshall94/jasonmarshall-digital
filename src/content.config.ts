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

const SERVICES_QUERY = `*[_type == "service" && defined(slug.current)] | order(order asc){
  title,
  "slug": slug.current,
  order,
  summary,
  heading,
  intro,
  included,
  body,
  faqs[]{ question, answer },
  "relatedProjects": relatedProjects[]->slug.current,
  seo
}`;

const PAGES_QUERY = `*[_type == "page" && defined(slug.current)]{
  title,
  "slug": slug.current,
  heading,
  intro,
  body,
  seo
}`;

const seoSchema = z
  .object({
    title: z.string().nullish(),
    description: z.string().nullish(),
  })
  .nullish();

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

  services: defineCollection({
    loader: async () => {
      const services =
        await sanity.fetch<Array<{ slug: string }>>(SERVICES_QUERY);
      if (!services.length) throw new Error("Sanity: no services returned");
      return services.map((s) => ({ id: s.slug, ...s }));
    },
    schema: z.object({
      title: z.string(),
      slug: z.string(),
      order: z.number(),
      summary: z.string(),
      heading: z.string(),
      intro: z.string(),
      included: z.array(z.string()).nullish(),
      body: z.array(z.any()).nullish(),
      faqs: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .nullish(),
      // Project slugs (ids in the `projects` collection); drafts resolve to null
      relatedProjects: z
        .array(z.string().nullable())
        .nullish()
        .transform((a) => (a ?? []).filter((x): x is string => !!x)),
      seo: seoSchema,
    }),
  }),

  pages: defineCollection({
    loader: async () => {
      const pages = await sanity.fetch<Array<{ slug: string }>>(PAGES_QUERY);
      return pages.map((p) => ({ id: p.slug, ...p }));
    },
    schema: z.object({
      title: z.string(),
      slug: z.string(),
      heading: z.string(),
      intro: z.string().nullish(),
      body: z.array(z.any()).nullish(),
      seo: seoSchema,
    }),
  }),
};
