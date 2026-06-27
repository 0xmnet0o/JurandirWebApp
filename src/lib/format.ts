import type { MenuItem } from "@/types";

/** Número de WhatsApp comercial do suporte (a definir). */
export const SUPPORT_WA = "5547999999999";

/** E-mail comercial para receber leads (a definir). */
export const LEADS_EMAIL = "comercial@pedeai.com.br";

/** Formata um valor numérico como moeda brasileira (R$ 0,00). */
export const money = (v: number): string => "R$ " + v.toFixed(2).replace(".", ",");

/** Indica se o item está em promoção (tem preço "de" maior que o atual). */
export const isPromo = (i: Pick<MenuItem, "price" | "oldPrice">): boolean =>
  i.oldPrice != null && i.oldPrice > i.price;

/** Percentual de desconto de um item em promoção. */
export const pct = (i: Pick<MenuItem, "price" | "oldPrice">): number =>
  Math.round((1 - i.price / (i.oldPrice as number)) * 100);

/** Link de WhatsApp do suporte já com a mensagem pré-preenchida. */
export const waHref = (name: string): string =>
  `https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent(
    `Olá! Sou do ${name} e preciso de suporte no PedeAí.`,
  )}`;
