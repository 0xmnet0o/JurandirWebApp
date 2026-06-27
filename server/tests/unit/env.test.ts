import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

describe("parseEnv", () => {
  it("lança quando falta SUPABASE_URL", () => {
    expect(() => parseEnv({ PORT: "3333" })).toThrow();
  });

  it("usa PORT padrão 3333 quando ausente", () => {
    const env = parseEnv({
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_ANON_KEY: "a",
      SUPABASE_SERVICE_ROLE_KEY: "s",
    });
    expect(env.PORT).toBe(3333);
    expect(env.SUPABASE_URL).toBe("https://x.supabase.co");
  });
});
