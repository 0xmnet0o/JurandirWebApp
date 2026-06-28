import { useState, type Dispatch, type SetStateAction } from "react";
import { Check, Clock, LayoutDashboard, MapPin, MessageSquare, Printer, User } from "lucide-react";
import { money } from "@/lib/format";
import { splitInfo } from "@/lib/analytics";
import type { Order, OrderStatus, Restaurant } from "@/types";
import { PrintModal } from "./PrintModal";

export interface PedidosProps {
  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  restaurant: Restaurant;
}

type Filter = "todos" | OrderStatus;

interface Badge {
  label: string;
  cls: string;
}

const badgeFor = (o: Order): Badge =>
  o.status === "aguardando"
    ? { label: "Pagamento incompleto", cls: "bg-rose-100 text-rose-700" }
    : o.status === "producao"
      ? { label: "Em produção", cls: "bg-amber-100 text-amber-700" }
      : { label: "Entregue", cls: "bg-emerald-100 text-emerald-700" };

/** Fila de pedidos do estabelecimento, agrupada por status. */
export function Pedidos({ orders, setOrders, restaurant }: PedidosProps) {
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<Filter>("todos");

  const setStatus = (id: number, status: OrderStatus) =>
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));

  const aguardando = orders.filter((o) => o.status === "aguardando");
  const producao = orders.filter((o) => o.status === "producao");
  const entregues = orders.filter((o) => o.status === "entregue");

  const Card = ({ o }: { o: Order }) => {
    const incomplete = o.status === "aguardando";
    const info = o.splits ? splitInfo(o) : null;
    const badge = badgeFor(o);
    return (
      <div
        className={`bg-white rounded-2xl p-4 shadow-sm ${incomplete ? "ring-1 ring-rose-200" : ""}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-800">
            Pedido #{String(o.id).padStart(3, "0")}
            <span className="ml-2 font-mono text-xs font-medium text-slate-400">{o.code}</span>
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <div className="flex gap-3 flex-wrap text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <MapPin size={12} /> {o.location}
          </span>
          {o.customerName && (
            <span className="flex items-center gap-1 font-semibold text-cyan-600">
              <User size={12} /> {o.customerName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />{" "}
            {o.ts.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="space-y-1 mb-3">
          {o.items.map((i, k) => (
            <div key={k} className="flex justify-between text-sm">
              <span>
                {i.qty}× {i.name}
              </span>
              <span className="text-slate-400">{money(i.price * i.qty)}</span>
            </div>
          ))}
        </div>
        {o.note && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2.5 py-2 text-xs mb-3 flex gap-1.5">
            <MessageSquare size={14} className="shrink-0 mt-0.5" />{" "}
            <span>
              <b>Obs:</b> {o.note}
            </span>
          </div>
        )}
        {incomplete && info && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-3">
            <div className="flex justify-between text-xs text-rose-700 font-medium mb-1">
              <span>
                {info.paidCount} de {info.total} pessoas pagaram
              </span>
              <span>
                {money(info.paidAmt)} de {money(o.total)}
              </span>
            </div>
            <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full"
                style={{ width: `${(info.paidAmt / o.total) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-rose-600 mt-1.5">
              ⏳ Não enviado à cozinha até o pagamento ser concluído.
            </p>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>
            {incomplete ? (
              <span className="font-bold text-rose-600">{money(info?.paidAmt ?? 0)}</span>
            ) : (
              <span className="font-bold text-cyan-600">{money(o.total)}</span>
            )}
            <span className="text-xs text-slate-400 ml-2">
              {incomplete ? `recebido · ${o.payment.label}` : `via ${o.payment.label}`}
            </span>
          </div>
          {!incomplete && (
            <div className="flex gap-2">
              <button
                onClick={() => setPrintOrder(o)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 active:scale-95"
              >
                <Printer size={14} /> Imprimir
              </button>
              {o.status === "producao" && (
                <button
                  onClick={() => setStatus(o.id, "entregue")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium flex items-center gap-1 active:scale-95"
                >
                  <Check size={14} /> Entregue
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: "todos", label: "Todos", n: orders.length },
    { id: "aguardando", label: "Aguardando", n: aguardando.length },
    { id: "producao", label: "Em produção", n: producao.length },
    { id: "entregue", label: "Entregue", n: entregues.length },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {filters.map((ff) => (
          <button
            key={ff.id}
            onClick={() => setFilter(ff.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === ff.id ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
          >
            {ff.label}{" "}
            <span className={filter === ff.id ? "text-white/60" : "text-slate-400"}>({ff.n})</span>
          </button>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <LayoutDashboard size={40} className="mx-auto mb-3 opacity-40" />
          <p>Nenhum pedido ainda.</p>
        </div>
      )}

      {(filter === "todos" || filter === "aguardando") && aguardando.length > 0 && (
        <>
          <h2 className="font-semibold text-sm text-rose-600 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Aguardando pagamento
            ({aguardando.length})
          </h2>
          <div className="space-y-3 mb-6">
            {aguardando.map((o) => (
              <Card key={o.id} o={o} />
            ))}
          </div>
        </>
      )}
      {(filter === "todos" || filter === "producao") && producao.length > 0 && (
        <>
          <h2 className="font-semibold text-sm text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Em produção (
            {producao.length})
          </h2>
          <div className="space-y-3 mb-6">
            {producao.map((o) => (
              <Card key={o.id} o={o} />
            ))}
          </div>
        </>
      )}
      {(filter === "todos" || filter === "entregue") && entregues.length > 0 && (
        <>
          <h2 className="font-semibold text-sm text-slate-500 mb-2">
            Entregues ({entregues.length})
          </h2>
          <div className="space-y-3 opacity-70">
            {entregues.map((o) => (
              <Card key={o.id} o={o} />
            ))}
          </div>
        </>
      )}
      {orders.length > 0 &&
        ((filter === "aguardando" && aguardando.length === 0) ||
          (filter === "producao" && producao.length === 0) ||
          (filter === "entregue" && entregues.length === 0)) && (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhum pedido neste status.
          </div>
        )}

      {printOrder && (
        <PrintModal
          order={printOrder}
          restaurantName={restaurant.name}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </div>
  );
}
