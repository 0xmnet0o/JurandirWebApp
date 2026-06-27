import { describe, expect, it } from "vitest";
import { computeTotals } from "@/domain/money";

describe("computeTotals", () => {
  it("soma itens e calcula a taxa", () => {
    const r = computeTotals(
      [
        { name: "A", qty: 2, price: 10 },
        { name: "B", qty: 1, price: 5 },
      ],
      8,
    );
    expect(r.total).toBe(25);
    expect(r.fee).toBe(2);
    expect(r.grandTotal).toBe(27);
  });

  it("taxa 0 quando fee_pct é 0", () => {
    const r = computeTotals([{ name: "A", qty: 1, price: 10 }], 0);
    expect(r.fee).toBe(0);
    expect(r.grandTotal).toBe(10);
  });
});
