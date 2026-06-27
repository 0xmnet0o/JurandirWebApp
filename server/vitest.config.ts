import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  // Testes de integração batem no Supabase real: timeout maior e arquivos em
  // série (evita burst de signups/logins em paralelo que dispara rate limit).
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup-env.ts"],
    testTimeout: 20000,
    fileParallelism: false,
  },
});
