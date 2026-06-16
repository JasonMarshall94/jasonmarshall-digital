// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import yaml from "@rollup/plugin-yaml";

import icon from "astro-icon";

import netlify from "@astrojs/netlify";

import react from "@astrojs/react";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://jasonmarshall.digital",
  output: "static",

  vite: {
    plugins: [tailwindcss(), yaml()],
  },

  integrations: [
    icon(),
    react(),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
  ],

  fonts: [
    {
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      provider: fontProviders.fontsource(),
      fallbacks: ["monospace"],
    },
  ],

  adapter: netlify(),
});