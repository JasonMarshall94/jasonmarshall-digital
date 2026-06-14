# Jason Marshall Digital

Personal portfolio and agency site for Jason Marshall Digital. Built with Astro 6, Tailwind CSS v4, and deployed to Netlify.

## Stack

- **Astro 6** — static site generation (`output: "static"`)
- **Tailwind CSS v4** — utility-first styling via `@tailwindcss/vite`, configured in `src/styles/global.css`
- **Netlify** — hosting and deployment via `@astrojs/netlify` adapter
- **Resend** — transactional email for contact form submissions
- **React** — email templates only (`src/emails/`)
- **astro-icon** — SVG icon system from `src/icons/`

## Commands

All commands use `pnpm`.

| Command           | Action                                        |
| :---------------- | :-------------------------------------------- |
| `pnpm dev`        | Start dev server at `localhost:4321`          |
| `pnpm build`      | Build production site to `./dist/`            |
| `pnpm preview`    | Preview production build locally              |
| `pnpm email:dev`  | Start React Email preview server             |
| `pnpm astro check`| Type-check without building                  |

## Project Structure

```
src/
├── actions/          # Astro server actions (contact form → Resend)
├── components/
│   ├── global/       # Site-wide shell (Nav, Footer, Logo)
│   ├── ui/           # Reusable primitives (SectionHeading, CopyChip)
│   └── *.astro       # Page section components
├── data/
│   ├── projects/     # Markdown project files + cover images
│   ├── navLinks.json # Navigation link definitions
│   ├── siteData.yaml # Site title, description, contact info, URLs
│   └── stackItems.ts # Technology list for the marquee
├── emails/           # React email templates (server-side only)
├── icons/            # SVG icons auto-resolved by astro-icon
├── layouts/          # BaseLayout
├── pages/            # index.astro, projects/index.astro
└── styles/           # global.css — Tailwind theme + shared utilities
```

## Environment Variables

| Variable         | Description                  |
| :--------------- | :--------------------------- |
| `RESEND_API_KEY` | API key from resend.com      |

Create a `.env` file at the project root:

```sh
RESEND_API_KEY=re_your_key_here
```

## Content

Projects are Markdown files in `src/data/projects/`. Each file requires the following frontmatter:

```yaml
title: Project Name
slug: project-name
excerpt: Short description
tags: [WordPress, Astro]
postDate: 2024-01-01
isDraft: false
isFeatured: true
cover: ./images/project-cover.jpg
coverAlt: Description of the cover image
url: https://example.com  # optional
```

- `isFeatured: true` — appears on the homepage grid
- `isDraft: true` — hidden from all listings
- Cover images live in `src/data/projects/images/`
