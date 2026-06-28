import { useMemo, useState } from "react";
import { CreditCard, MapPin, Search, X } from "lucide-react";
import { money } from "@/lib/format";
import { formatCard } from "@/lib/card";
import type { Order, PaymentId, Restaurant } from "@/types";

export interface BacklogProps {
  orders: Order[];
  restaurant: Restaurant;
}

const METHOD_LABEL: Record<PaymentId, string> = {
  credito: "Crédito",
  debito: "Débito",
  pix: "Pix",
  usdc: "USDC",
  split: "Dividido",
};

const pad = (n: number) => String(n).padStart(2, "0");
const localYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Deriva "Cidade" e "UF" a partir do endereço do estabelecimento (ex.: "… Itajaí/SC"). */
function cityUF(address: string): { city: string; uf: string } {
  const tail = (address.split(",").pop() ?? "").trim(); // "Itajaí/SC"
  const [city = "—", uf = "—"] = tail.split("/").map((s) => s.trim());
  return { city, uf };
}

interface Row {
  order: Order;
  estab: string;
  city: string;
  uf: string;
  method: PaymentId;
  methodLabel: string;
  itemsText: string;
}

/**
 * Backlog de auditoria da plataforma: todas as compras com data/hora,
 * estabelecimento, cartão (mascarado), código do pedido, cidade, estado, método
 * e itens. Filtros por estabelecimento, dia, item, cartão e método + busca.
 */
export function Backlog({ orders, restaurant }: BacklogProps) {
  const { city, uf } = cityUF(restaurant.address);

  const rows: Row[] = useMemo(
    () =>
      orders
        .map((order) => ({
          order,
          estab: restaurant.name,
          city,
          uf,
          method: order.payment.id,
          methodLabel: order.payment.label,
          itemsText: order.items.map((i) => `${i.qty}× ${i.name}`).join(", "),
        }))
        .sort((a, b) => b.order.ts.getTime() - a.order.ts.getTime()),
    [orders, restaurant.name, city, uf],
  );

  const [estab, setEstab] = useState("");
  const [method, setMethod] = useState("");
  const [day, setDay] = useState("");
  const [item, setItem] = useState("");
  const [card, setCard] = useState("");
  const [q, setQ] = useState("");

  const estabs = useMemo(() => Array.from(new Set(rows.map((r) => r.estab))), [rows]);

  const filtered = rows.filter((r) => {
    if (estab && r.estab !== estab) return false;
    if (method && r.method !== method) return false;
    if (day && localYMD(r.order.ts) !== day) return false;
    if (item && !r.itemsText.toLowerCase().includes(item.toLowerCase())) return false;
    if (card) {
      const c = `${r.order.card?.brand ?? ""} ${r.order.card?.last4 ?? ""}`.toLowerCase();
      if (!c.includes(card.toLowerCase())) return false;
    }
    if (q) {
      const hay = [
        r.order.code,
        r.estab,
        r.city,
        r.uf,
        r.methodLabel,
        r.itemsText,
        formatCard(r.order.card),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const hasFilter = estab || method || day || item || card || q;
  const clear = () => {
    setEstab("");
    setMethod("");
    setDay("");
    setItem("");
    setCard("");
    setQ("");
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

  return (
    <div>
      <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4">
        <h2 className="font-semibold flex items-center gap-1.5">
          <Search size={16} className="text-amber-400" /> Backlog de auditoria
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Registro de todas as compras da plataforma para verificação dos administradores. O cartão
          é exibido mascarado (bandeira + 4 últimos), nunca o número completo.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500">Estabelecimento</label>
            <select value={estab} onChange={(e) => setEstab(e.target.value)} className={inputCls + " mt-1 bg-white"}>
              <option value="">Todos</option>
              {estabs.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Método de pagamento</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls + " mt-1 bg-white"}>
              <option value="">Todos</option>
              {(Object.keys(METHOD_LABEL) as PaymentId[]).map((id) => (
                <option key={id} value={id}>
                  {METHOD_LABEL[id]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Dia</label>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Item</label>
            <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Ex: Caipirinha" className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Cartão (bandeira / 4 últimos)</label>
            <input value={card} onChange={(e) => setCard(e.target.value)} placeholder="Ex: 4242 ou Visa" className={inputCls + " mt-1"} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Busca livre</label>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código, item, cidade…" className={inputCls + " mt-1"} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {filtered.length} de {rows.length} compra{rows.length !== 1 ? "s" : ""}
          </span>
          {hasFilter && (
            <button onClick={clear} className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
              <X size={13} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400 text-sm">
          Nenhuma compra encontrada com os filtros atuais.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Data / Hora</th>
                <th className="px-4 py-3 font-medium">Estabelecimento</th>
                <th className="px-4 py-3 font-medium">Cidade / UF</th>
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Cartão</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((r) => (
                <tr key={r.order.id} className="align-top hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {r.order.ts.toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">{r.estab}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-slate-400" /> {r.city} · {r.uf}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">{r.order.code}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {r.order.card ? (
                      <span className="flex items-center gap-1">
                        <CreditCard size={13} className="text-slate-400" /> {formatCard(r.order.card)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.methodLabel}</td>
                  <td className="px-4 py-3 text-slate-500 min-w-[200px]">{r.itemsText}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-700">
                    {money(r.order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
