import { describe, expect, it } from "vitest";
import { computeLive, splitInfo } from "./analytics";
import { pay } from "@/data/payments";
import type { Order } from "@/types";

const baseOrder = (over: Partial<Order>): Order => ({
  id: 1,
  code: "PED-TEST0001",
  location: "Mesa 1",
  status: "producao",
  ts: new Date(),
  payment: pay("pix"),
  items: [{ name: "X", qty: 1, price: 10 }],
  total: 10,
  ...over,
});

describe("computeLive", () => {
  it("ignora pedidos aguardando pagamento", () => {
    const orders = [
      baseOrder({ id: 1, status: "aguardando", total: 100 }),
      baseOrder({ id: 2, status: "producao", total: 100, payment: pay("pix") }),
    ];
    const live = computeLive(orders);
    expect(live.orders).toBe(1);
    expect(live.revenue).toBe(100);
    expect(live.byPay.pix).toBe(100);
  });

  it("soma o valor das partes pagas em contas divididas", () => {
    const orders = [
      baseOrder({
        id: 3,
        status: "entregue",
        total: 60,
        payment: { id: "split", label: "Dividido", icon: pay("pix").icon, color: "bg-pink-500" },
        splits: [
          { method: pay("pix"), amount: 30 },
          { method: pay("usdc"), amount: 30 },
        ],
      }),
    ];
    const live = computeLive(orders);
    expect(live.revenue).toBe(60);
    expect(live.byPay.pix).toBe(30);
    expect(live.byPay.usdc).toBe(30);
  });

  it("respeita a janela de tempo [since, until)", () => {
    const old = new Date("2020-01-01").getTime();
    const recent = new Date("2026-01-01").getTime();
    const orders = [
      baseOrder({ id: 4, ts: new Date(old), total: 10 }),
      baseOrder({ id: 5, ts: new Date(recent), total: 20 }),
    ];
    const live = computeLive(orders, recent - 1000);
    expect(live.orders).toBe(1);
    expect(live.revenue).toBe(20);
  });
});

describe("splitInfo", () => {
  it("conta apenas as partes com método definido", () => {
    const info = splitInfo({
      splits: [
        { method: pay("pix"), amount: 30 },
        { method: null, amount: 30 },
      ],
    });
    expect(info).toEqual({ paidAmt: 30, paidCount: 1, total: 2 });
  });

  it("lida com pedido sem splits", () => {
    expect(splitInfo({})).toEqual({ paidAmt: 0, paidCount: 0, total: 0 });
  });
});
