import type { CardInfo, PaymentId } from "@/types";

const BRANDS = ["Visa", "Mastercard", "Elo", "Amex"];

/** Indica se o método de pagamento é cartão (crédito/débito). */
export const isCardMethod = (id: PaymentId): boolean => id === "credito" || id === "debito";

/**
 * Gera um cartão MASCARADO fictício para a demo (bandeira + 4 últimos).
 * NUNCA representa um número de cartão real — em produção, bandeira/últimos
 * dígitos vêm do gateway (Asaas), que jamais entrega o PAN completo.
 */
export function generateDemoCard(): CardInfo {
  const b = crypto.getRandomValues(new Uint8Array(3));
  const brand = BRANDS[b[0] % BRANDS.length];
  const last4 = String(1000 + (((b[1] << 8) | b[2]) % 9000));
  return { brand, last4 };
}

/** Formata o cartão mascarado para exibição (ex.: "Visa •••• 4242"). */
export const formatCard = (card?: CardInfo): string =>
  card ? `${card.brand} •••• ${card.last4}` : "—";
