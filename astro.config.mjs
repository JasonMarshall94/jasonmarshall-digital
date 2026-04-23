// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  security: { csp: true },
  vite: {
    plugins: [tailwindcss()],
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
});
