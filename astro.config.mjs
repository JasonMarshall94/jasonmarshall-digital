// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import yaml from "@rollup/plugin-yaml";

import icon from "astro-icon";

import netlify from "@astrojs/netlify";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://jasonmarshall.digital",
  output: "static",
  security: { csp: true },

  vite: {
    plugins: [tailwindcss(), yaml()],
  },

  integrations: [icon(), react()],

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
