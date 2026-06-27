export interface LineItem {
  name: string;
  qty: number;
  price: number;
}

export interface Totals {
  total: number;
  fee: number;
  grandTotal: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Soma os itens (subtotal) e aplica a taxa percentual da plataforma. */
export function computeTotals(items: LineItem[], feePct: number): Totals {
  const total = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const fee = round2((total * feePct) / 100);
  return { total, fee, grandTotal: round2(total + fee) };
}
