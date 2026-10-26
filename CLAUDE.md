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

This is a personal portfolio/agency site built with **Astro 7**, explicitly set to `output: "static"` (SSG). Deployed to **Netlify** via `@astrojs/netlify` adapter, which handles the contact form action as a Netlify Function.

### Key integrations
- **Tailwind CSS v4** via `@tailwindcss/vite` — configured entirely in `src/styles/global.css` using `@theme`, `@utility`, and `@layer` directives (no `tailwind.config.js`)
- **astro-icon** — SVG icons placed in `src/icons/` are auto-resolved by name (e.g. `<Icon name="github" />` → `src/icons/github.svg`)
- **React** (`@astrojs/react`) — used for email templates only (`src/emails/`). No React components are used in the browser; no `client:*` directives exist in the project
- **Sanity** (`@sanity/client`, `@sanity/image-url`) — headless CMS for projects, services, pages and site settings, fetched at build time. Rich text is rendered with `astro-portabletext`. See *Content (Sanity)* below
- **GSAP** — used for scroll-driven and entry animations in Hero (`SplitText`), About, and Services (`ScrollTrigger`). All animations are gated with `gsap.matchMedia()` on `prefers-reduced-motion: no-preference`
- **Partytown** (`@astrojs/partytown`) — offloads third-party scripts to a web worker. Configured with `forward: ["dataLayer.push", "gtag"]` in `astro.config.mjs`. Google Analytics (`G-ZMTW1L1YJX`) is loaded via Partytown in `BaseLayout.astro` using `type="text/partytown"` script tags. Do NOT use Partytown for Cloudflare Turnstile — it requires DOM access unavailable in workers.
- **Prettier** — configured via `.prettierrc` with `prettier-plugin-astro` and `prettier-plugin-tailwindcss`

### Path aliases
- `@/*` → `src/*`
- `@/ui/*` → `src/components/ui/*`
- `@/global/*` → `src/components/global/*`

### Component organisation
- `src/components/` — page section components (Hero, About, Services, Contact, ContactForm, ProjectCard, ProjectsGrid, ProjectsArchive, StackMarquee, CTA)
- `src/components/global/` — site-wide shell components (Nav, Footer, Logo)
- `src/components/ui/` — reusable primitives (SectionHeading, CopyChip, ThemeToggle)
- `src/components/content/` — CMS page building blocks: `PageHero` (breadcrumb trail + H1 + intro, used by inner pages), `RichText` (Portable Text in a `prose-site` wrapper; `RichLink` opens external links in a new tab, `RichImage` renders Sanity images at 16:9)

### Content (Sanity)
Projects, services, pages and site settings live in **Sanity** (project `3x5s0bg9`, dataset `production`, public-read). The Studio is a **separate repo** in the sibling folder `../studio-jason-marshall-digital/` (schemas in `schemaTypes/`), hosted by Sanity via `sanity deploy`. Content is fetched **at build time only** — publishing in Sanity does nothing until the site is rebuilt.

- `src/lib/sanity.ts` — the client (`perspective: "published"`, `useCdn: false`), `imageSrcset()` for responsive Sanity CDN images (honours Studio crop/hotspot; format negotiated by the CDN), and `getSiteSettings()` (the `siteSettings` singleton, memoised per build). Project id/dataset are public, so there are no Sanity env vars.
- `src/content.config.ts` — the `projects` collection uses an inline loader that queries Sanity; components still use `getCollection("projects")`. Fields: `title`, `slug`, `excerpt`, `tags`, `postDate`, `isFeatured`, `cover` (`{asset, crop, hotspot, alt}`), optional `url`, `location`, `services` (`{title, slug}[]` resolved from Sanity service references), `body` (Portable Text case study), `seoTitle`, `seoDescription`. Drafts never reach the site (published perspective). The loader throws on zero projects and `getSiteSettings()` throws if the singleton is missing, so a broken CMS fails the build instead of shipping empty pages.
- `services` collection (Sanity `service`): `title`, `slug`, `order`, `summary` (overview card), `heading` (H1), `intro`, `included[]`, `body`, `faqs[]`, `relatedProjects` (project slugs = `projects` collection ids), `seo{title,description}`. Rendered at `/services/` (`src/pages/services/index.astro`, cards sorted by `order`) and `/services/<slug>/`.
- `pages` collection (Sanity `page`): `title`, `slug`, `heading`, `intro`, `body`, `seo`. `src/pages/[slug].astro` renders each at `/<slug>/` (e.g. `/about/`) except reserved slugs that have their own routes; the `services` page document supplies the heading/intro/SEO for `/services/`. Add new reserved slugs inside that file's `getStaticPaths` (it can't see module scope).
- SEO titles: `seo.title` is used as the **full** `<title>` when set; otherwise `"<title> — <site title>"`.
- `ProjectsGrid` (homepage) shows `isFeatured` projects; `ProjectsArchive` (projects page) shows all. `ProjectCard` links to the project's case study and renders covers with `imageSrcset()` at 16:9 — `cdn.sanity.io` is allowed in the CSP `img-src` in `netlify.toml`.
- **Deploys:** the Studio's *Deploy* tool writes the `deployTrigger` document; a Sanity webhook filtered to `_type == "deployTrigger"` calls the Netlify build hook (the hook URL lives only in the webhook config, never in the public Studio bundle).
- Case studies: `src/pages/projects/[slug].astro` renders `/projects/<slug>/` — hero with "Visit live site", full-width cover, body, a "Project details" panel (location, year, tech, linked services, live URL), up to 3 more projects and the CTA. JSON-LD: `CreativeWork` (`caseStudyNode`) + breadcrumbs.
- Contact: `src/pages/contact.astro` renders `/contact/` from the `contact` page document (hero) plus `<Contact heading={false} />`. All "Start a project" / "Get in touch" links point to `/contact/`; only the homepage hero button scrolls to the `#contact` section. JSON-LD: `ContactPage`.

### Server actions
`src/actions/index.ts` exports a `send` action (`accept: "form"`) that validates fields with Zod and uses **Resend** (`RESEND_API_KEY` env var) to send email to `contact@jasonmarshall.digital`. The active email template is `src/emails/AdminNotification.tsx` — a plain React component with inline styles (no React Email component library). `ThankYou.tsx`, `theme.tsx`, and `theme-fonts.tsx` also exist in `src/emails/` but are unused scaffolding; `ThankYou.tsx` does use the React Email component library (`react-email`) if it's ever wired up.

### Contact form spam protection
**Cloudflare Turnstile** is integrated into `ContactForm.astro`. The widget uses `data-appearance="interaction-only"` (invisible unless a challenge is required) and `data-theme="auto"` (follows the visitor's OS colour scheme). The Turnstile script is lazy-loaded on first form `focusin` to avoid any page-load web vitals impact. Server-side token verification happens in the `send` action before the email is sent, using `TURNSTILE_SECRET_KEY` (env var set in Netlify). The submit handler guards against submission before the token is ready. Required env vars: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`.

### Global site data
- Site title, default meta description, contact email/phone, GitHub URL and location (`city`, `region`, `areaServed[]` — the business is in West Chester, PA, serving Philadelphia and the surrounding area) come from the Sanity `siteSettings` singleton via `getSiteSettings()`. The About section's "Based" fact and the privacy policy read the location from it.

### SEO
- `BaseLayout.astro` props: `title`, `description`, `ogImage`, `noindex` (emits `robots: noindex` instead of a canonical — used by the 404), `jsonLd` (rendered as `application/ld+json`). Every other page gets `<link rel="canonical">` built from `Astro.site` + pathname; `og:url` uses the same URL.
- Homepage `<title>` = Site Settings `homeTitle` (falls back to `title`); `/projects` description = `projectsDescription` (falls back to `description`). Other page titles append the plain site `title`.
- `src/lib/structuredData.ts` has node builders combined with `graph(...)`: `businessNode` (`ProfessionalService` from Site Settings, incl. address and `areaServed`), `homepageJsonLd`, `breadcrumbNode`, `serviceNode` and `faqNode`. Inner pages include `businessNode` so `provider` `@id` references resolve on the same page.
- Internal links to the projects page use `/projects/` (trailing slash) — Netlify 301s `/projects` → `/projects/`.
- `src/data/navLinks.json` — nav link definitions with shape `{ title, slug, pageHref?, href? }[]`. `href` = a real page used on every page (Services → `/services/`, About → `/about/`); without it the link targets the homepage section `#slug`, with `pageHref` overriding the off-home link (Work → `/projects/`). Page links get their active state (and `aria-current`) server-side from the path; only `#section` links are highlighted on scroll.
- `src/data/stackItems.ts` — `string[]` of technology names used by `StackMarquee`

### Navigation
`src/components/global/Nav.astro` includes a desktop nav and a mobile off-canvas drawer. The drawer slides in from the right and is driven entirely by a `data-open` attribute on the `<header>` — no framework needed. Hamburger → × animation uses `group-data-[open=true]/nav` Tailwind variants. The `inert` attribute is applied to `<main>` when the drawer is open.

### Styling conventions
Custom design tokens are defined in `src/styles/global.css` under `@theme`. Reusable utility classes are defined with `@utility` and should be extended there — not in component `<style>` blocks — when shared. Key utilities:

- `btn` / `btn-primary` — outline and filled button styles
- `label` — small uppercase tracking label
- `prose-site` — long-form text styling (headings, lists, links, images) for CMS rich text and the privacy policy
- `nav-link` — underline-on-hover nav anchor
- `hide-mobile` — `display: none` at ≤720px
- `hide-desktop` — `display: none` at ≥721px
- `gridlines`, `float-in`, `marquee`, `scroll-fade-mask`, `pulse-dot`, `blink`
- `.container` — max-width 1200px, centered

The design language is monochrome with light and dark themes, using JetBrains Mono as the sole typeface. The font is configured via Astro's built-in font API (`fontProviders.fontsource()` in `astro.config.mjs`) and loaded with `<Font cssVariable="--font-jetbrains-mono" preload />` in `BaseLayout.astro`.

### Light / dark theme
Every `--color-*` token in `@theme` is a `light-dark(<light>, <dark>)` pair, so utilities like `text-text` or `bg-dark-grey/70` switch automatically. Token names date from the dark-only design: `dark-grey` is the **page background** (white in light mode) and `text` is the foreground. Never hard-code hex/rgba colours in components — add a token (e.g. `success`, `error`) or a `:root` variable (e.g. `--glow`, `--gridline`) instead. All text tokens meet WCAG AA (4.5:1) against `dark-grey`, `card` and `deep` in both themes; re-check contrast when changing them.

- Default follows the OS via `color-scheme: light dark` on `:root` — works without JS.
- `ThemeToggle.astro` (in the nav, visible on all breakpoints) sets `data-theme="light|dark"` on `<html>` and stores it in `localStorage.theme`. If the new choice matches the OS setting, the attribute and storage are cleared so the site resumes following the OS.
- An `is:inline` script at the top of `<head>` in `BaseLayout.astro` applies the stored choice before first paint (no flash).
- A custom `light:` Tailwind variant (defined in `global.css`) targets the effective light theme — explicit or OS — e.g. the sun/moon icon swap.

### Privacy policy
`src/pages/privacy.astro` (`/privacy/`, linked from the footer and under the contact form) describes the site's actual data flows: contact form → Netlify Function → Turnstile → Resend email (not stored in Sanity), Google Analytics cookies, Cloudflare (proxy, Web Analytics, email obfuscation), Netlify logs, Sanity image CDN, and the `theme` localStorage key. **Update the policy and its `lastUpdated` date whenever a change adds a third-party service, cookie, storage key or form field.**

### 404 page
`src/pages/404.astro` — Astro outputs this as `404.html`; Netlify serves it automatically for unknown routes. Uses the same Hero-section design language (gridlines, blinking cursor, `float-in` staggered entry). The page wraps Nav + main + Footer in a `flex min-h-svh flex-col` div (with `flex-1 flex flex-col` on `<main>` and `flex-1` on the section) to pin the footer to the bottom of the viewport.
