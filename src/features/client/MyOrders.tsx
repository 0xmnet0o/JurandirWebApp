import { useState } from "react";
import { Check, Clock, LayoutDashboard, MapPin, Store, UtensilsCrossed } from "lucide-react";
import { PAYMENTS } from "@/data/payments";
import { money } from "@/lib/format";
import { splitInfo } from "@/lib/analytics";
import type { Order, Payment, Restaurant } from "@/types";

export interface MyOrdersProps {
  myOrders: Order[];
  restaurant: Restaurant;
  payShare: (orderId: number, idx: number, method: Payment) => void;
  onBack: () => void;
}

interface StatusBadge {
  label: string;
  cls: string;
}

const statusInfo = (o: Order): StatusBadge =>
  o.status === "aguardando"
    ? { label: "Pendente", cls: "bg-rose-100 text-rose-700" }
    : o.status === "producao"
      ? { label: "Pago", cls: "bg-amber-100 text-amber-700" }
      : { label: "Entregue", cls: "bg-emerald-100 text-emerald-700" };

/** Lista de pedidos feitos pelo cliente na visita, com a opção de completar pagamentos divididos. */
export function MyOrders({ myOrders, restaurant, payShare, onBack }: MyOrdersProps) {
  const [exp, setExp] = useState<number | null>(null);

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-10">
      <div className="px-1 mb-4">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={onBack}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5"
          >
            <UtensilsCrossed size={15} /> Cardápio
          </button>
          <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white flex items-center justify-center gap-1.5">
            <LayoutDashboard size={15} /> Meus pedidos
            {myOrders.length > 0 ? ` (${myOrders.length})` : ""}
          </button>
        </div>
      </div>
      <h1 className="text-xl font-bold mb-1 px-1">Meus pedidos</h1>
      {restaurant && (
        <p className="text-sm text-slate-400 mb-4 px-1 flex items-center gap-1">
          <Store size={13} /> {restaurant.name}
        </p>
      )}

      {myOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <LayoutDashboard size={40} className="mx-auto mb-3 opacity-40" />
          <p>Você ainda não fez pedidos nesta visita.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => {
            const si = statusInfo(o);
            const info = splitInfo(o);
            const incomplete = o.status === "aguardando";
            const isExp = exp === o.id;
            return (
              <div
                key={o.id}
                className={`bg-white rounded-2xl p-4 shadow-sm ${incomplete ? "ring-1 ring-rose-200" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">
                    Pedido #{String(o.id).padStart(3, "0")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${si.cls}`}>
                    {si.label}
                  </span>
                </div>
                {restaurant && (
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-1">
                    <Store size={11} className="text-cyan-500" /> {restaurant.name}
                  </div>
                )}
                <div className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                  <MapPin size={11} /> {o.location} · <Clock size={11} />{" "}
                  {o.ts.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="space-y-1 mb-2">
                  {o.items.map((i, k) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span>
                        {i.qty}× {i.name}
                      </span>
                      <span className="text-slate-400">{money(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-sm">
                  <span>Total</span>
                  <span className="text-cyan-600">{money(o.total)}</span>
                </div>

                {incomplete && o.splits && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>
                        {info.paidCount} de {info.total} pagaram
                      </span>
                      <span>
                        {money(info.paidAmt)} de {money(o.total)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(info.paidAmt / o.total) * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setExp(isExp ? null : o.id)}
                      className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 text-sm"
                    >
                      {isExp ? "Ocultar" : "Completar pagamento"}
                    </button>
                    {isExp && (
                      <div className="mt-3 space-y-2">
                        {o.splits.map((s, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-xl p-2.5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium flex items-center gap-1.5">
                                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </span>{" "}
                                Amigo {idx + 1}
                              </span>
                              {s.method ? (
                                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                  <Check size={13} /> Pago ·{" "}
                                  {s.method.id === "usdc" ? "USDC" : s.method.label}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">{money(s.amount)}</span>
                              )}
                            </div>
                            {!s.method && (
                              <div className="grid grid-cols-4 gap-1.5">
                                {PAYMENTS.map((p) => {
                                  const Icon = p.icon;
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => payShare(o.id, idx, p)}
                                      className="py-1.5 rounded-lg bg-slate-50 hover:bg-cyan-50 border border-slate-200 flex flex-col items-center gap-0.5 active:scale-90"
                                    >
                                      <Icon size={15} className="text-slate-600" />
                                      <span className="text-[9px] text-slate-500 leading-none text-center">
                                        {p.id === "usdc" ? "USDC" : p.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {o.status === "producao" && (
                  <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <Clock size={12} /> Sendo preparado na cozinha
                  </p>
                )}
                {o.status === "entregue" && (
                  <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                    <Check size={12} /> Entregue no seu lugar
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
