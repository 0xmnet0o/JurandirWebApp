import type { LucideIcon } from "lucide-react";
import { Users } from "lucide-react";
import { PAYMENTS } from "@/data/payments";
import type { Establishment, MenuItem, Order, Payment, PaymentId, Restaurant } from "@/types";

/** Chave (versionada) usada no localStorage. */
export const STORAGE_KEY = "pedeai:state:v1";
const VERSION = 1;

/** Snapshot serializável do estado global do app. */
export interface PersistedState {
  version: number;
  menu: MenuItem[];
  orders: Order[];
  restaurant: Restaurant;
  establishments: Establishment[];
  orderSeq: number;
}

/**
 * Resolve o ícone de um método de pagamento pelo `id`. O ícone é um componente
 * React (função) e por isso não sobrevive ao JSON — precisa ser reanexado ao ler.
 */
export const iconForPayment = (id: PaymentId): LucideIcon =>
  id === "split" ? Users : (PAYMENTS.find((p) => p.id === id)?.icon ?? Users);

/** Reanexa o ícone (perdido na serialização) a um método de pagamento. */
export const revivePayment = (p: Payment): Payment => ({ ...p, icon: iconForPayment(p.id) });

/** Revive um pedido vindo do JSON: `ts` vira Date e os ícones voltam aos pagamentos. */
export const reviveOrder = (o: Order): Order => ({
  ...o,
  ts: new Date(o.ts),
  payment: revivePayment(o.payment),
  splits: o.splits?.map((s) => ({ ...s, method: s.method ? revivePayment(s.method) : null })),
});

/** Lê o estado persistido do localStorage, ou `null` se ausente/inválido/versão diferente. */
export function loadPersisted(): PersistedState | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as PersistedState;
    if (data.version !== VERSION) return null;
    return { ...data, orders: data.orders.map(reviveOrder) };
  } catch {
    return null;
  }
}

/**
 * Grava o estado no localStorage. Funções (como `icon`) são naturalmente
 * descartadas pelo `JSON.stringify` e reidratadas em {@link loadPersisted}.
 */
export function savePersisted(state: Omit<PersistedState, "version">): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, ...state }));
  } catch {
    // Cota cheia ou modo privado: persistência é um "nice-to-have", então ignoramos.
  }
}

/** Remove o estado persistido (útil para um "resetar demo"). */
export function clearPersisted(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
