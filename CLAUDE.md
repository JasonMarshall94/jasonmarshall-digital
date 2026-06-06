# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use `pnpm` (not npm/yarn).

```sh
pnpm dev          # dev server at localhost:4321
pnpm build        # production build to ./dist/
pnpm preview      # preview production build locally
pnpm email:dev    # React Email dev server for previewing email templates
```

Type-check without building:
```sh
pnpm astro check
```

## Architecture

This is a personal portfolio/agency site built with **Astro 6**, deployed to **Netlify** via `@astrojs/netlify` adapter (SSR-capable).

### Key integrations
- **Tailwind CSS v4** via `@tailwindcss/vite` — configured entirely in `src/styles/global.css` using `@theme`, `@utility`, and `@layer` directives (no `tailwind.config.js`)
- **astro-icon** — SVG icons placed in `src/icons/` are auto-resolved
- **React** (`@astrojs/react`) — used for interactive components and email templates only
- **YAML** (`@rollup/plugin-yaml`) — imports `.yaml` files as JS modules

### Path aliases
- `@/*` → `src/*`
- `@/ui/*` → `src/components/ui/*`

### Content layer
Projects are Markdown files in `src/data/projects/`, typed via `src/content.config.ts`. The schema requires: `title`, `slug`, `excerpt`, `tags`, `postDate`, `isDraft`, `isFeatured`, `cover` (image), `coverAlt`, and optional `url`. Cover images live in `src/data/projects/images/`.

The `slug` field in frontmatter drives the URL; `getStaticPaths` in `src/pages/projects/_[slug].astro` maps `project.data.slug` to the route param.

### Server actions
`src/actions/index.ts` exports a `send` action (form-accepting) that uses **Resend** (`RESEND_API_KEY` env var) to send transactional email. Email templates live in `src/emails/` as React Email TSX components.

### Global site data
- `src/data/siteData.ts` — default page `title` and `description` consumed by `BaseLayout`
- `src/data/siteGlobals.yaml` — contact info and external URLs (imported as a module anywhere needed)
- `src/data/navLinks.json` — navigation link definitions

### Styling conventions
Custom design tokens are defined in `src/styles/global.css` under `@theme`. Reusable utility classes (`btn`, `btn-primary`, `label`, `nav-link`, `gridlines`, `float-in`, `marquee`, etc.) are defined there with `@utility` and should be extended there — not in component `<style>` blocks — when they need to be shared. The `.container` utility is also defined there (max-width 1200px, centered).

The design language is dark/monochrome: `--color-dark-grey` (#121212) background, `--color-text` (#e0e0e0), `--color-accent` (#b0b0b0), with JetBrains Mono as the sole typeface loaded via Fontsource.

### Disabled route
`src/pages/projects/_[slug].astro` — the leading underscore disables this route in Astro. Individual project pages are not live; the underscore is intentional.
