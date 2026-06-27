import { describe, expect, it } from "vitest";
import { parseCorsOrigins } from "@/lib/cors";

describe("parseCorsOrigins", () => {
  it("libera tudo (true) quando vazio/undefined fora de produção", () => {
    expect(parseCorsOrigins(undefined)).toBe(true);
    expect(parseCorsOrigins("")).toBe(true);
  });
  it("fail-closed em produção quando não configurado (nega cross-origin)", () => {
    expect(parseCorsOrigins(undefined, true)).toEqual([]);
    expect(parseCorsOrigins("", true)).toEqual([]);
  });
  it("divide por vírgula e remove espaços (em qualquer ambiente)", () => {
    expect(parseCorsOrigins("https://a.com, https://b.com")).toEqual(["https://a.com", "https://b.com"]);
    expect(parseCorsOrigins("https://a.com", true)).toEqual(["https://a.com"]);
  });
});
