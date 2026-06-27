import { useState } from "react";
import { ChevronDown, Clock, MapPin, TrendingUp, Users } from "lucide-react";
import { CATEGORY_NAMES, CAT_COLORS, CAT_EMOJI, MEDAL } from "@/data/categories";
import { PAYMENTS } from "@/data/payments";
import { money } from "@/lib/format";
import type { CategoryName, MenuItem, Order, Payment, PaymentId } from "@/types";

export interface KpisProps {
  orders: Order[];
  menu: MenuItem[];
}

type Period = "hoje" | "7d" | "30d" | "tudo";
type ItemCatFilter = "Todos" | CategoryName;
type RankMetric = "qty" | "rev";

interface PayEntry {
  o: Order;
  amount: number;
  parts?: number;
  people?: number;
  split: boolean;
}

interface PaySummary extends Payment {
  total: number;
  count: number;
  entries: PayEntry[];
  share: number;
}

interface ItemRank {
  name: string;
  qty: number;
  rev: number;
  cat: string;
}

interface PieSegment {
  cat: string;
  val: number;
  frac: number;
  color: string;
  dash: string;
  offset: number;
}

const PERIODS: { id: Period; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "tudo", label: "Tudo" },
];

/** Painel de indicadores do estabelecimento: faturamento, pagamentos, ranking e categorias. */
export function Kpis({ orders, menu }: KpisProps) {
  const [open, setOpen] = useState<PaymentId | null>(null);
  const [period, setPeriod] = useState<Period>("hoje");
  const [itemCat, setItemCat] = useState<ItemCatFilter>("Todos");

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const now = Date.now();
  const minTs =
    period === "hoje"
      ? startToday.getTime()
      : period === "7d"
        ? now - 7 * 86400000
        : period === "30d"
          ? now - 30 * 86400000
          : 0;
  const data = orders.filter((o) => o.ts.getTime() >= minTs && o.status !== "aguardando");

  const producao = data.filter((o) => o.status === "producao").length;
  const fat = data.reduce((s, o) => s + o.total, 0);
  const ticket = data.length ? fat / data.length : 0;

  const byPay: PaySummary[] = PAYMENTS.map((p) => {
    let total = 0;
    let count = 0;
    const entries: PayEntry[] = [];
    data.forEach((o) => {
      if (o.splits) {
        const shares = o.splits.filter((s) => s.method && s.method.id === p.id);
        if (shares.length) {
          const amt = shares.reduce((s, x) => s + x.amount, 0);
          total += amt;
          count += shares.length;
          entries.push({
            o,
            amount: amt,
            parts: shares.length,
            people: o.splits.length,
            split: true,
          });
        }
      } else if (o.payment.id === p.id) {
        total += o.total;
        count += 1;
        entries.push({ o, amount: o.total, split: false });
      }
    });
    entries.sort((a, b) => b.o.ts.getTime() - a.o.ts.getTime());
    return { ...p, total, count, entries, share: fat ? (total / fat) * 100 : 0 };
  });
  const maxPay = Math.max(...byPay.map((p) => p.total), 1);

  // Categoria de cada item (resolvida pelo cardápio).
  const catOf = (name: string): string => menu.find((m) => m.name === name)?.cat || "Outros";

  // Itens mais vendidos — filtro por categoria + rankings por quantidade e faturamento.
  const itemMap: Record<string, ItemRank> = {};
  data.forEach((o) =>
    o.items.forEach((it) => {
      const c = catOf(it.name);
      if (itemCat !== "Todos" && c !== itemCat) return;
      const e = itemMap[it.name] || (itemMap[it.name] = { name: it.name, qty: 0, rev: 0, cat: c });
      e.qty += it.qty;
      e.rev += it.qty * it.price;
    }),
  );
  const ranked = Object.values(itemMap);
  const topByQty = [...ranked].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const topByRev = [...ranked].sort((a, b) => b.rev - a.rev).slice(0, 5);
  const maxQty = Math.max(...topByQty.map((i) => i.qty), 1);
  const maxRev = Math.max(...topByRev.map((i) => i.rev), 1);

  // Vendas por categoria (gráfico de pizza).
  const catSales: Record<string, number> = {};
  data.forEach((o) =>
    o.items.forEach((it) => {
      const c = catOf(it.name);
      catSales[c] = (catSales[c] || 0) + it.qty * it.price;
    }),
  );
  const catEntries = Object.entries(catSales).sort((a, b) => b[1] - a[1]);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0) || 1;
  const CIRC = 2 * Math.PI * 42;
  let acc = 0;
  const catSegs: PieSegment[] = catEntries.map(([cat, val]) => {
    const frac = val / catTotal;
    const len = frac * CIRC;
    const seg: PieSegment = {
      cat,
      val,
      frac,
      color: CAT_COLORS[cat] || "#94a3b8",
      dash: `${len} ${CIRC - len}`,
      offset: -acc,
    };
    acc += len;
    return seg;
  });

  const RankList = ({
    list,
    max,
    metric,
  }: {
    list: ItemRank[];
    max: number;
    metric: RankMetric;
  }) =>
    list.length === 0 ? (
      <p className="text-slate-400 text-sm text-center py-4">
        Sem vendas nesta categoria no período.
      </p>
    ) : (
      <div className="space-y-3">
        {list.map((it, k) => {
          const primary = metric === "qty" ? `${it.qty} un` : money(it.rev);
          const secondary = metric === "qty" ? money(it.rev) : `${it.qty} un`;
          const val = metric === "qty" ? it.qty : it.rev;
          return (
            <div key={it.name}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="w-6 text-center text-base">{MEDAL[k] || `${k + 1}º`}</span>{" "}
                  {it.name}
                </span>
                <span className="text-slate-500 text-xs shrink-0 pl-2">
                  <b className="text-slate-800 text-sm">{primary}</b> · {secondary}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-8">
                <div
                  className={`h-full rounded-full transition-all ${metric === "qty" ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${(val / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );

  const Stat = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: string | number;
    color: string;
  }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );

  return (
    <div>
      <div className="flex gap-1 bg-white rounded-xl p-1 mb-4 shadow-sm">
        {PERIODS.map((pr) => (
          <button
            key={pr.id}
            onClick={() => {
              setPeriod(pr.id);
              setOpen(null);
              setItemCat("Todos");
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${period === pr.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}
          >
            {pr.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Faturamento" value={money(fat)} color="text-cyan-600" />
        <Stat label="Pedidos" value={data.length} color="text-slate-800" />
        <Stat label="Ticket médio" value={money(ticket)} color="text-violet-600" />
        <Stat label="Em produção" value={producao} color="text-amber-500" />
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-slate-400">
          Nenhum pedido neste período.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">Vendas por categoria</h2>
            <div className="flex items-center gap-5">
              <svg viewBox="0 0 100 100" className="w-32 h-32 shrink-0 -rotate-90">
                {catSegs.map((s) => (
                  <circle
                    key={s.cat}
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="16"
                    strokeDasharray={s.dash}
                    strokeDashoffset={s.offset}
                  />
                ))}
              </svg>
              <div className="flex-1 space-y-2 min-w-0">
                {catSegs.map((s) => (
                  <div key={s.cat} className="flex items-center justify-between text-sm gap-2">
                    <span className="flex items-center gap-2 text-slate-700 min-w-0">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ background: s.color }}
                      />{" "}
                      <span className="truncate">
                        {CAT_EMOJI[s.cat as CategoryName] || ""} {s.cat}
                      </span>
                    </span>
                    <span className="text-slate-500 text-xs shrink-0">
                      <b className="text-slate-800 text-sm">{(s.frac * 100).toFixed(0)}%</b> ·{" "}
                      {money(s.val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-sm text-slate-600">
                Vendas por método de pagamento
              </h2>
              <span className="text-[11px] text-slate-400">toque para detalhar</span>
            </div>
            <div className="divide-y divide-slate-100">
              {byPay.map((p) => {
                const Icon = p.icon;
                const isOpen = open === p.id;
                return (
                  <div key={p.id} className="py-3 first:pt-1">
                    <button
                      onClick={() => setOpen(isOpen ? null : p.id)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-center text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-slate-700 font-medium">
                          <span
                            className={`w-7 h-7 rounded-full ${p.color} text-white flex items-center justify-center shrink-0`}
                          >
                            <Icon size={14} />
                          </span>
                          {p.label}
                          <span className="text-slate-400 font-normal hidden sm:inline">
                            · {p.count} pgto{p.count !== 1 ? "s" : ""}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="font-bold">{money(p.total)}</span>
                          <ChevronDown
                            size={16}
                            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${p.color} rounded-full transition-all`}
                            style={{ width: `${(p.total / maxPay) * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 w-9 text-right">
                          {p.share.toFixed(0)}%
                        </span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        {p.entries.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2 text-center">
                            Nenhum pedido pago com {p.label} neste período.
                          </p>
                        ) : (
                          p.entries.map((e, k) => (
                            <div
                              key={k}
                              className="bg-slate-50 rounded-xl p-3 flex items-start justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-700">
                                  Pedido #{String(e.o.id).padStart(3, "0")}
                                  {e.o.customerName ? ` · ${e.o.customerName}` : ""}
                                </p>
                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin size={11} /> {e.o.location} · <Clock size={11} />{" "}
                                  {e.o.ts.toLocaleString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                <div className="mt-1.5">
                                  {e.split ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-pink-100 text-pink-700 font-medium px-2 py-0.5 rounded-full">
                                      <Users size={10} /> Conta dividida · {e.parts} de {e.people}{" "}
                                      pessoa{e.people !== 1 ? "s" : ""}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-slate-200 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                                      Pagamento único · {e.o.payment.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-slate-800">{money(e.amount)}</p>
                                {e.split && (
                                  <p className="text-[10px] text-slate-400">
                                    de {money(e.o.total)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="font-semibold text-sm text-slate-600 mb-3">Itens mais vendidos</h2>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {(["Todos", ...CATEGORY_NAMES] as ItemCatFilter[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setItemCat(c)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${itemCat === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {c === "Todos" ? "Todos" : `${CAT_EMOJI[c]} ${c}`}
                </button>
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <Users size={12} className="text-amber-500" /> Por quantidade
            </p>
            <RankList list={topByQty} max={maxQty} metric="qty" />
            <div className="h-px bg-slate-100 my-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-emerald-500" /> Por faturamento
            </p>
            <RankList list={topByRev} max={maxRev} metric="rev" />
          </div>
        </>
      )}
    </div>
  );
}
