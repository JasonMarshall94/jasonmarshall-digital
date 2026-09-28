import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

// Project id and dataset are public (the dataset is public-read), so no env
// vars are needed. Content is fetched at build time only.
export const sanity = createClient({
  projectId: "3x5s0bg9",
  dataset: "production",
  apiVersion: "2025-01-01",
  // Bypass the API CDN so a deploy right after publishing never sees stale data
  useCdn: false,
  perspective: "published",
});

const builder = createImageUrlBuilder(sanity);

export interface SanityImage {
  asset: { _ref: string };
  crop?: { top: number; bottom: number; left: number; right: number };
  hotspot?: { x: number; y: number; height: number; width: number };
}

/**
 * Responsive src/srcset for a Sanity image cropped to a fixed aspect ratio.
 * Honours the crop and hotspot set in the Studio; format is negotiated by the CDN.
 */
export function imageSrcset(image: SanityImage, widths: number[], aspect: number) {
  const url = (w: number) =>
    builder
      .image(image)
      .width(w)
      .height(Math.round(w / aspect))
      .fit("crop")
      .auto("format")
      .quality(80)
      .url();
  const largest = Math.max(...widths);
  return {
    src: url(largest),
    srcset: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    width: largest,
    height: Math.round(largest / aspect),
  };
}

interface SiteSettingsDoc {
  title: string;
  description: string;
  email: string;
  phone: string;
  githubUrl?: string;
}

let settings: Promise<SiteSettingsDoc> | undefined;

/** Site Settings singleton, fetched once per build. Fails the build if missing. */
export async function getSiteSettings() {
  settings ??= sanity
    .fetch<SiteSettingsDoc | null>(
      `*[_id == "siteSettings"][0]{title, description, email, phone, githubUrl}`,
    )
    .then((doc) => {
      if (!doc) throw new Error("Sanity: Site Settings document is missing");
      return doc;
    });
  return settings;
}
