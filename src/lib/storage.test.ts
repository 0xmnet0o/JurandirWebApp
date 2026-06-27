import { beforeEach, describe, expect, it } from "vitest";
import {
  STORAGE_KEY,
  clearPersisted,
  iconForPayment,
  loadPersisted,
  savePersisted,
} from "./storage";
import { pay } from "@/data/payments";
import { INITIAL_RESTAURANT } from "@/data/restaurant";
import type { Order } from "@/types";
import type { PersistedState } from "./storage";

const sampleState = (): Omit<PersistedState, "version"> => ({
  menu: [],
  establishments: [],
  restaurant: INITIAL_RESTAURANT,
  orderSeq: 5,
  orders: [
    {
      id: 1,
      location: "Mesa 1",
      status: "producao",
      ts: new Date("2026-01-15T12:00:00Z"),
      payment: pay("pix"),
      items: [{ name: "X", qty: 1, price: 10 }],
      total: 10,
      splits: [
        { method: pay("pix"), amount: 5 },
        { method: null, amount: 5 },
      ],
    } as Order,
  ],
});

describe("storage", () => {
  beforeEach(() => clearPersisted());

  it("retorna null quando não há nada salvo", () => {
    expect(loadPersisted()).toBeNull();
  });

  it("faz round-trip revivendo Date e reanexando o ícone do pagamento", () => {
    savePersisted(sampleState());
    const loaded = loadPersisted();
    expect(loaded).not.toBeNull();
    const order = loaded!.orders[0];
    expect(order.ts).toBeInstanceOf(Date);
    expect(order.ts.getTime()).toBe(new Date("2026-01-15T12:00:00Z").getTime());
    // O ícone do lucide é um componente forwardRef (objeto), reanexado pelo id.
    expect(order.payment.icon).toBeDefined();
    expect(order.payment.icon).toBe(iconForPayment("pix"));
    expect(order.splits?.[0].method?.icon).toBe(iconForPayment("pix"));
    expect(order.splits?.[1].method).toBeNull();
    expect(loaded!.orderSeq).toBe(5);
    expect(loaded!.version).toBe(1);
  });

  it("descarta estado com versão incompatível", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, orders: [] }));
    expect(loadPersisted()).toBeNull();
  });

  it("descarta JSON corrompido sem lançar", () => {
    localStorage.setItem(STORAGE_KEY, "{não é json}");
    expect(loadPersisted()).toBeNull();
  });
});
