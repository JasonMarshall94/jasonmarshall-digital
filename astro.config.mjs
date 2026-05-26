// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import yaml from "@rollup/plugin-yaml";

import icon from "astro-icon";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  security: { csp: true },

  vite: {
    plugins: [tailwindcss(), yaml()],
  },

  integrations: [icon()],

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