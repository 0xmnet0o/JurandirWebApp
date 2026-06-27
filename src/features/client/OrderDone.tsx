import { Check, Clock, MapPin, MessageSquare, User } from "lucide-react";
import { money } from "@/lib/format";
import { splitInfo } from "@/lib/analytics";
import type { Order } from "@/types";

export interface OrderDoneProps {
  order: Order;
  onNew: () => void;
  onMyOrders: () => void;
}

/** Tela de confirmação exibida após finalizar (ou pagar parcialmente) um pedido. */
export function OrderDone({ order, onNew, onMyOrders }: OrderDoneProps) {
  const incomplete = order.status === "aguardando";
  const info = order.splits ? splitInfo(order) : null;
  const paidAmt = info?.paidAmt ?? 0;

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div
        className={`w-20 h-20 rounded-full ${incomplete ? "bg-amber-500" : "bg-emerald-500"} text-white flex items-center justify-center mx-auto mb-5 shadow-lg`}
      >
        {incomplete ? <Clock size={44} /> : <Check size={44} />}
      </div>
      <h1 className="text-2xl font-bold">
        {incomplete
          ? "Pagamento parcial recebido"
          : order.customerName
            ? `Tudo certo, ${order.customerName}!`
            : "Pagamento confirmado!"}
      </h1>
      <p className="text-slate-500 mt-1">
        {incomplete
          ? "Seu pedido vai para a cozinha assim que todos pagarem."
          : "Seu pedido já foi enviado para a cozinha."}
      </p>

      <div className="bg-white rounded-2xl p-5 shadow-sm mt-6 text-left">
        <div className="flex justify-between flex-wrap gap-y-1 text-sm text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {order.location}
          </span>
          {order.customerName && (
            <span className="flex items-center gap-1">
              <User size={13} /> {order.customerName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} />{" "}
            {order.ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {order.items.map((i, k) => (
          <div key={k} className="flex justify-between py-1 text-sm">
            <span>
              {i.qty}× {i.name}
            </span>
            <span className="font-medium">{money(i.price * i.qty)}</span>
          </div>
        ))}
        {incomplete && info && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>
                {info.paidCount} de {info.total} pagaram
              </span>
              <span>
                {money(info.paidAmt)} de {money(order.total)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(info.paidAmt / order.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {order.note && (
          <div className="mt-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-1.5 text-xs flex gap-1.5">
            <MessageSquare size={13} className="shrink-0 mt-0.5" /> <span>{order.note}</span>
          </div>
        )}
        {order.fee && order.fee > 0 && !incomplete && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de serviço PedeAí ({order.feePct}%)</span>
              <span>{money(order.fee)}</span>
            </div>
          </div>
        )}
        <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 font-bold">
          <span>{incomplete ? "Pago até agora" : `Pago via ${order.payment.label}`}</span>
          <span className={incomplete ? "text-amber-600" : "text-emerald-600"}>
            {incomplete ? money(paidAmt) : money(order.total + (order.fee || 0))}
          </span>
        </div>
      </div>

      <button
        onClick={onMyOrders}
        className="mt-5 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition"
      >
        {incomplete ? "Completar pagamento" : "Ver meus pedidos"}
      </button>
      <button
        onClick={onNew}
        className="mt-3 w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition"
      >
        Fazer outro pedido
      </button>
    </div>
  );
}
