import { describe, expect, it } from "vitest";
import { parseCorsOrigins } from "@/lib/cors";

describe("parseCorsOrigins", () => {
  it("retorna true (libera tudo) quando vazio/undefined", () => {
    expect(parseCorsOrigins(undefined)).toBe(true);
    expect(parseCorsOrigins("")).toBe(true);
  });
  it("divide por vírgula e remove espaços", () => {
    expect(parseCorsOrigins("https://a.com, https://b.com")).toEqual(["https://a.com", "https://b.com"]);
  });
});
