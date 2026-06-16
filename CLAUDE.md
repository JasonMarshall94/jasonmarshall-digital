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

This is a personal portfolio/agency site built with **Astro 6**, explicitly set to `output: "static"` (SSG). Deployed to **Netlify** via `@astrojs/netlify` adapter, which handles the contact form action as a Netlify Function.

### Key integrations
- **Tailwind CSS v4** via `@tailwindcss/vite` — configured entirely in `src/styles/global.css` using `@theme`, `@utility`, and `@layer` directives (no `tailwind.config.js`)
- **astro-icon** — SVG icons placed in `src/icons/` are auto-resolved by name (e.g. `<Icon name="github" />` → `src/icons/github.svg`)
- **React** (`@astrojs/react`) — used for email templates only (`src/emails/`). No React components are used in the browser; no `client:*` directives exist in the project
- **YAML** (`@rollup/plugin-yaml`) — imports `.yaml` files as JS modules
- **GSAP** — used for scroll-driven and entry animations in Hero (`SplitText`), About, and Services (`ScrollTrigger`). All animations are gated with `gsap.matchMedia()` on `prefers-reduced-motion: no-preference`
- **Prettier** — configured via `.prettierrc` with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`

### Path aliases
- `@/*` → `src/*`
- `@/ui/*` → `src/components/ui/*`
- `@/global/*` → `src/components/global/*`

### Component organisation
- `src/components/` — page section components (Hero, About, Services, Contact, ContactForm, ProjectCard, ProjectsGrid, ProjectsArchive, StackMarquee, CTA)
- `src/components/global/` — site-wide shell components (Nav, Footer, Logo)
- `src/components/ui/` — reusable primitives (SectionHeading, CopyChip)

### Content layer
Projects are Markdown files in `src/data/projects/`, typed via `src/content.config.ts`. The schema requires: `title`, `slug`, `excerpt`, `tags`, `postDate`, `isDraft`, `isFeatured`, `cover` (image), `coverAlt`, and optional `url`. Cover images live in `src/data/projects/images/`.

`ProjectsGrid` (homepage) filters to `isFeatured: true && isDraft: false`. `ProjectsArchive` (projects page) shows all non-draft projects.

The `slug` field in frontmatter drives the URL; `getStaticPaths` in `src/pages/projects/_[slug].astro` maps `project.data.slug` to the route param.

### Server actions
`src/actions/index.ts` exports a `send` action (`accept: "form"`) that validates fields with Zod and uses **Resend** (`RESEND_API_KEY` env var) to send email to `contact@jasonmarshall.digital`. The active email template is `src/emails/AdminNotification.tsx` — a plain React component with inline styles (no React Email component library). `ThankYou.tsx`, `theme.tsx`, and `theme-fonts.tsx` also exist in `src/emails/` but are unused scaffolding; `ThankYou.tsx` does use the React Email component library (`react-email`) if it's ever wired up.

### Global site data
- `src/data/siteData.yaml` — site title, description, contact email/phone, and GitHub URL; imported wherever global data is needed
- `src/data/navLinks.json` — nav link definitions with shape `{ title, slug, pageHref? }[]`; `pageHref` is an optional override for the non-home href (e.g. Work → `/projects`)
- `src/data/stackItems.ts` — `string[]` of technology names used by `StackMarquee`

### Navigation
`src/components/global/Nav.astro` includes a desktop nav and a mobile off-canvas drawer. The drawer slides in from the right and is driven entirely by a `data-open` attribute on the `<header>` — no framework needed. Hamburger → × animation uses `group-data-[open=true]/nav` Tailwind variants. The `inert` attribute is applied to `<main>` when the drawer is open.

### Styling conventions
Custom design tokens are defined in `src/styles/global.css` under `@theme`. Reusable utility classes are defined with `@utility` and should be extended there — not in component `<style>` blocks — when shared. Key utilities:

- `btn` / `btn-primary` — outline and filled button styles
- `label` — small uppercase tracking label
- `nav-link` — underline-on-hover nav anchor
- `hide-mobile` — `display: none` at ≤720px
- `hide-desktop` — `display: none` at ≥721px
- `gridlines`, `float-in`, `marquee`, `scroll-fade-mask`, `pulse-dot`, `blink`
- `.container` — max-width 1200px, centered

The design language is dark/monochrome: `--color-dark-grey` (#121212) background, `--color-text` (#e0e0e0), `--color-accent` (#b0b0b0), with JetBrains Mono as the sole typeface. The font is configured via Astro's built-in font API (`fontProviders.fontsource()` in `astro.config.mjs`) and loaded with `<Font cssVariable="--font-jetbrains-mono" preload />` in `BaseLayout.astro`.

### 404 page
`src/pages/404.astro` — Astro outputs this as `404.html`; Netlify serves it automatically for unknown routes. Uses the same Hero-section design language (gridlines, blinking cursor, `float-in` staggered entry). The page wraps Nav + main + Footer in a `flex min-h-svh flex-col` div (with `flex-1 flex flex-col` on `<main>` and `flex-1` on the section) to pin the footer to the bottom of the viewport.

### Disabled route
`src/pages/projects/_[slug].astro` — the leading underscore disables this route in Astro. Individual project pages are not live; the underscore is intentional.
