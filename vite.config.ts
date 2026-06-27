/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Em produção o app é servido em https://<user>.github.io/JurandirWebApp/.
  // No dev (`command === "serve"`) mantemos a raiz.
  base: command === "build" ? "/JurandirWebApp/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/components/**"],
    },
  },
}));
