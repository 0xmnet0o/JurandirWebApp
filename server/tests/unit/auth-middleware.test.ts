import { describe, expect, it } from "vitest";
import { extractBearer } from "@/middleware/auth";

describe("extractBearer", () => {
  it("extrai o token do header Authorization", () => {
    expect(extractBearer("Bearer abc.def.ghi")).toBe("abc.def.ghi");
  });
  it("retorna null sem header ou formato inválido", () => {
    expect(extractBearer(undefined)).toBeNull();
    expect(extractBearer("Token xyz")).toBeNull();
  });
});
