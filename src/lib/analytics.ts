import type { Order, LiveStats, PaymentTotals } from "@/types";

/** Resumo do progresso de pagamento de uma conta dividida. */
export interface SplitInfo {
  paidAmt: number;
  paidCount: number;
  total: number;
}

/** Calcula quanto já foi pago de um pedido com conta dividida. */
export const splitInfo = (o: Pick<Order, "splits">): SplitInfo => {
  const splits = o.splits ?? [];
  const paidShares = splits.filter((s) => s.method);
  return {
    paidAmt: paidShares.reduce((s, x) => s + x.amount, 0),
    paidCount: paidShares.length,
    total: splits.length,
  };
};

const emptyTotals = (): PaymentTotals => ({ credito: 0, debito: 0, pix: 0, usdc: 0 });

/**
 * Agrega faturamento e número de pedidos "ao vivo" a partir dos pedidos reais,
 * dentro da janela de tempo [since, until). Pedidos aguardando pagamento são ignorados.
 */
export function computeLive(orders: Order[], since = 0, until = Infinity): LiveStats {
  const valid = orders.filter(
    (o) => o.status !== "aguardando" && o.ts.getTime() >= since && o.ts.getTime() < until,
  );
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  const byPay = emptyTotals();
  valid.forEach((o) => {
    if (o.splits) {
      o.splits.forEach((s) => {
        if (s.method && s.method.id in byPay) {
          byPay[s.method.id as keyof PaymentTotals] += s.amount;
        }
      });
    } else if (o.payment.id in byPay) {
      byPay[o.payment.id as keyof PaymentTotals] += o.total;
    }
  });
  return { orders: valid.length, revenue, byPay };
}
