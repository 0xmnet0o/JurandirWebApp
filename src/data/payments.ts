import { Banknote, CreditCard, Coins, Smartphone } from "lucide-react";
import type { Payment, PaymentId } from "@/types";

/** Métodos de pagamento oferecidos no checkout. */
export const PAYMENTS: Payment[] = [
  { id: "credito", label: "Crédito", icon: CreditCard, color: "bg-blue-500" },
  { id: "debito", label: "Débito", icon: Banknote, color: "bg-emerald-500" },
  { id: "pix", label: "Pix", icon: Smartphone, color: "bg-teal-500" },
  { id: "usdc", label: "Stablecoin (USDC)", icon: Coins, color: "bg-violet-500" },
];

/** Busca um método de pagamento pelo id. Lança se não existir (uso interno com ids fixos). */
export const pay = (id: PaymentId): Payment => {
  const found = PAYMENTS.find((p) => p.id === id);
  if (!found) throw new Error(`Método de pagamento desconhecido: ${id}`);
  return found;
};
