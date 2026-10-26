import type { SiteSettings } from "@/lib/sanity";

/** E.164-style phone for schema.org, assuming US numbers (484-844-1169 -> +1-484-844-1169). */
const toTelephone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10
    ? `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone;
};

const businessId = (site: URL) => `${site.href}#business`;

/** The business (ProfessionalService, a LocalBusiness subtype), built from Site Settings. */
export function businessNode(settings: SiteSettings, site: URL) {
  const node: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": businessId(site),
    name: settings.title,
    url: site.href,
    description: settings.description,
    email: settings.email,
    telephone: toTelephone(settings.phone),
    image: new URL("/og-image.png", site).href,
  };
  if (settings.city || settings.region) {
    node.address = {
      "@type": "PostalAddress",
      ...(settings.city && { addressLocality: settings.city }),
      ...(settings.region && { addressRegion: settings.region }),
      addressCountry: "US",
    };
  }
  const areas = settings.areaServed?.length
    ? settings.areaServed
    : settings.city
      ? [settings.city]
      : [];
  if (areas.length) node.areaServed = areas;
  if (settings.githubUrl) node.sameAs = [settings.githubUrl];
  return node;
}

/** Wraps nodes in a single JSON-LD document. */
export const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

/** Homepage: the business and the website it publishes. */
export function homepageJsonLd(settings: SiteSettings, site: URL) {
  return graph(businessNode(settings, site), {
    "@type": "WebSite",
    "@id": `${site.href}#website`,
    url: site.href,
    name: settings.title,
    publisher: { "@id": businessId(site) },
  });
}

/** Breadcrumb trail, starting at Home. Items are [name, path]. */
export function breadcrumbNode(items: [string, string][], site: URL) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"], ...items].map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: new URL(path, site).href,
    })),
  };
}

/** A service offered by the business. */
export function serviceNode(
  service: { name: string; description: string; path: string },
  settings: SiteSettings,
  site: URL,
) {
  return {
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: new URL(service.path, site).href,
    provider: { "@id": businessId(site) },
    ...(settings.areaServed?.length && { areaServed: settings.areaServed }),
  };
}

/** FAQ list — eligible for FAQ rich results. */
export function faqNode(faqs: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
