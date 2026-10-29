// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import netlify from "@astrojs/netlify";

import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://jasonmarshall.digital",
  output: "static",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    icon(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
  ],

  fonts: [
    {
      name: "Geist",
      cssVariable: "--font-geist",
      provider: fontProviders.fontsource(),
      weights: [400, 500, 600],
      fallbacks: ["system-ui", "sans-serif"],
    },
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.fontsource(),
      weights: [400, 500],
      fallbacks: ["monospace"],
    },
  ],

  adapter: netlify(),
});