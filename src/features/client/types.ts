import type { MenuItem, Payment, Split } from "@/types";

/** Uma linha do carrinho: o item do cardápio acrescido da quantidade. */
export type CartLine = MenuItem & { qty: number };

/** Passos da jornada do cliente dentro da área de pedido. */
export type ClientStep = "qr" | "menu" | "checkout" | "done" | "myorders";

/** Assinatura para finalizar um pedido (pagamento total ou dividido). */
export type FinishOrder = (payment: Payment, splits?: Split[]) => void;
