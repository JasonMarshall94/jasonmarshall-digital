import type { SiteSettings } from "@/lib/sanity";

/** E.164-style phone for schema.org, assuming US numbers (484-844-1169 -> +1-484-844-1169). */
const toTelephone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10
    ? `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
    : phone;
};

/**
 * schema.org JSON-LD for the homepage: the business (ProfessionalService, a
 * LocalBusiness subtype) and the website it publishes. Built from Site Settings.
 */
export function homepageJsonLd(settings: SiteSettings, site: URL) {
  const url = site.href;
  const business: Record<string, unknown> = {
    "@type": "ProfessionalService",
    "@id": `${url}#business`,
    name: settings.title,
    url,
    description: settings.description,
    email: settings.email,
    telephone: toTelephone(settings.phone),
    image: new URL("/og-image.png", site).href,
  };
  if (settings.city || settings.region) {
    business.address = {
      "@type": "PostalAddress",
      ...(settings.city && { addressLocality: settings.city }),
      ...(settings.region && { addressRegion: settings.region }),
      addressCountry: "US",
    };
    if (settings.city) business.areaServed = settings.city;
  }
  if (settings.githubUrl) business.sameAs = [settings.githubUrl];

  return {
    "@context": "https://schema.org",
    "@graph": [
      business,
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: settings.title,
        publisher: { "@id": `${url}#business` },
      },
    ],
  };
}
