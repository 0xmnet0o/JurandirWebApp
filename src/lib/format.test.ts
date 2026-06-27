import { describe, expect, it } from "vitest";
import { isPromo, money, pct } from "./format";

describe("money", () => {
  it("formata com prefixo R$ e vírgula decimal", () => {
    expect(money(22)).toBe("R$ 22,00");
    expect(money(1234.5)).toBe("R$ 1234,50");
    expect(money(0)).toBe("R$ 0,00");
  });
});

describe("isPromo", () => {
  it("é true quando há preço 'de' maior que o atual", () => {
    expect(isPromo({ price: 22, oldPrice: 28 })).toBe(true);
  });
  it("é false sem oldPrice ou quando oldPrice não é maior", () => {
    expect(isPromo({ price: 22 })).toBe(false);
    expect(isPromo({ price: 22, oldPrice: 22 })).toBe(false);
    expect(isPromo({ price: 22, oldPrice: 10 })).toBe(false);
  });
});

describe("pct", () => {
  it("calcula o percentual de desconto arredondado", () => {
    expect(pct({ price: 21, oldPrice: 28 })).toBe(25);
    expect(pct({ price: 50, oldPrice: 100 })).toBe(50);
  });
});
