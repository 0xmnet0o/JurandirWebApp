import { useState } from "react";
import {
  Edit3,
  Globe,
  Instagram,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Percent,
  Phone,
  Plus,
  ScrollText,
  Shield,
  Store,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useStore } from "@/store/context";
import { ADMIN_PERIODS } from "@/data/adminPeriods";
import { computeLive } from "@/lib/analytics";
import { money } from "@/lib/format";
import { MEDAL } from "@/data/categories";
import type { Establishment, EstablishmentForm, PaymentMethodId, PaymentTotals } from "@/types";
import { AdminLogin } from "./AdminLogin";
import { EstablishmentEditor } from "./EstablishmentEditor";
import { Backlog } from "./Backlog";

type AdminTab = "dashboard" | "faturamento" | "cadastros" | "taxas" | "backlog";
type PeriodId = (typeof ADMIN_PERIODS)[number]["id"];

const TABS: { id: AdminTab; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "faturamento", label: "Faturamento", icon: TrendingUp },
  { id: "cadastros", label: "Cadastros", icon: Store },
  { id: "taxas", label: "Taxas", icon: Percent },
  { id: "backlog", label: "Backlog", icon: ScrollText },
];

const PAY_META: Record<PaymentMethodId, { label: string; color: string }> = {
  credito: { label: "Crédito", color: "bg-blue-500" },
  debito: { label: "Débito", color: "bg-emerald-500" },
  pix: { label: "Pix", color: "bg-teal-500" },
  usdc: { label: "USDC", color: "bg-violet-500" },
};
const PAY_KEYS = Object.keys(PAY_META) as PaymentMethodId[];

// Sazonalidade de praia (verão alto, inverno baixo), por mês (jan..dez).
const SEASON = [1.9, 1.8, 1.5, 1.1, 0.9, 0.8, 0.95, 0.9, 0.85, 1.0, 1.3, 2.0];

const clampFee = (v: string | number): number =>
  Math.max(0, Math.min(30, parseFloat(String(v).replace(",", ".")) || 0));

const emptyForm = (): EstablishmentForm => ({
  name: "",
  owner: "",
  city: "",
  neighborhood: "",
  plan: "Básico",
  feePct: "8",
  user: "",
  password: "",
  phone: "",
  email: "",
  website: "",
  whatsapp: "",
  instagram: "",
});

const toForm = (e: Establishment): EstablishmentForm => ({
  id: e.id,
  name: e.name,
  owner: e.owner,
  city: e.city,
  neighborhood: e.neighborhood || "",
  plan: e.plan,
  feePct: String(e.feePct),
  user: e.user || "",
  password: e.password || "",
  phone: e.phone || "",
  email: e.email || "",
  website: e.website || "",
  whatsapp: e.whatsapp || "",
  instagram: e.instagram || "",
});

/** Painel administrativo da plataforma PedeAí (GMV, fees, cadastros e taxas). */
export function Admin() {
  const { orders, establishments, setEstablishments, restaurant, setRestaurant } = useStore();
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [reg, setReg] = useState<EstablishmentForm | null>(null);
  const [period, setPeriod] = useState<PeriodId>("mes");
  const [del, setDel] = useState<Establishment | null>(null);

  const nowD = new Date();
  const [month, setMonth] = useState(
    `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, "0")}`,
  );

  if (!logged) return <AdminLogin onLogin={() => setLogged(true)} />;

  // Opções do dropdown: últimos 12 meses.
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const raw = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return { value, label: raw.charAt(0).toUpperCase() + raw.slice(1) };
  });

  const seasonFactor = (mIdx: number) => SEASON[mIdx] / SEASON[nowD.getMonth()];

  const pmeta = ADMIN_PERIODS.find((p) => p.id === period) ?? ADMIN_PERIODS[3];
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const now = Date.now();
  const inMes = period === "mes";
  const [my, mm] = month.split("-").map(Number);
  const monthStart = new Date(my, mm - 1, 1).getTime();
  const monthEnd = new Date(my, mm, 1).getTime();
  const sinceTs = period === "dia" ? startToday.getTime() : now - pmeta.days * 86400000;

  const ests: Establishment[] = establishments.map((e) => {
    if (e.id === "live") {
      const lv = inMes ? computeLive(orders, monthStart, monthEnd) : computeLive(orders, sinceTs);
      return {
        ...e,
        ...lv,
        feePct: restaurant.platformFee || 0,
        phone: restaurant.phone,
        email: restaurant.email,
        website: restaurant.website,
        whatsapp: restaurant.whatsapp,
        instagram: restaurant.instagram,
      };
    }
    let f: number;
    if (inMes) {
      const estSince = new Date(e.since).getTime();
      f = monthEnd <= estSince ? 0 : seasonFactor(mm - 1);
    } else {
      f = pmeta.factor;
    }
    const byPay: PaymentTotals = {
      credito: e.byPay.credito * f,
      debito: e.byPay.debito * f,
      pix: e.byPay.pix * f,
      usdc: e.byPay.usdc * f,
    };
    return { ...e, orders: Math.round(e.orders * f), revenue: e.revenue * f, byPay };
  });

  // Base mensal estável (independe do período) — usada na aba de Taxas.
  const liveFull = computeLive(orders);
  const estsMes: Establishment[] = establishments.map((e) =>
    e.id === "live" ? { ...e, ...liveFull, feePct: restaurant.platformFee || 0 } : e,
  );

  const ativos = ests.filter((e) => e.status === "ativo");
  const gmv = ests.reduce((s, e) => s + e.revenue, 0);
  const feeRev = ests.reduce((s, e) => s + (e.revenue * (e.feePct || 0)) / 100, 0);
  const totalOrders = ests.reduce((s, e) => s + e.orders, 0);
  const ticket = totalOrders ? gmv / totalOrders : 0;
  const byPay: PaymentTotals = { credito: 0, debito: 0, pix: 0, usdc: 0 };
  ests.forEach((e) => PAY_KEYS.forEach((k) => (byPay[k] += e.byPay?.[k] || 0)));
  const payTotal = PAY_KEYS.reduce((s, k) => s + byPay[k], 0) || 1;
  const usdcShare = (byPay.usdc / payTotal) * 100;
  const top = [...ests]
    .filter((e) => e.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  const maxRev = Math.max(...top.map((e) => e.revenue), 1);

  const setFee = (id: string, v: string) => {
    const val = clampFee(v);
    setEstablishments((list) => list.map((e) => (e.id === id ? { ...e, feePct: val } : e)));
    if (id === "live") setRestaurant((r) => ({ ...r, platformFee: val }));
  };

  const toPayload = (data: EstablishmentForm) => ({
    name: data.name,
    owner: data.owner,
    city: data.city || "—",
    neighborhood: data.neighborhood,
    plan: data.plan,
    feePct: clampFee(data.feePct),
    user: data.user,
    password: data.password,
    phone: data.phone,
    email: data.email,
    website: data.website,
    whatsapp: data.whatsapp,
    instagram: data.instagram,
  });

  const saveEst = (data: EstablishmentForm) => {
    if (data.id) {
      const id = data.id;
      setEstablishments((list) =>
        list.map((e) => (e.id === id ? { ...e, ...toPayload(data) } : e)),
      );
      if (id === "live") {
        setRestaurant((r) => ({
          ...r,
          name: data.name,
          phone: data.phone,
          email: data.email,
          website: data.website,
          whatsapp: data.whatsapp,
          instagram: data.instagram,
          platformFee: clampFee(data.feePct),
        }));
      }
      setReg(null);
    } else {
      setEstablishments((list) => [
        ...list,
        {
          id: "e" + Date.now(),
          status: "ativo",
          since: new Date().toISOString().slice(0, 10),
          orders: 0,
          revenue: 0,
          byPay: { credito: 0, debito: 0, pix: 0, usdc: 0 },
          ...toPayload(data),
        },
      ]);
      setReg(null);
      setTab("cadastros");
    }
  };

  const delEst = (id: string) => {
    setEstablishments((list) => list.filter((e) => e.id !== id));
    setDel(null);
  };

  const PeriodPills = () => (
    <div className="mb-4">
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
        {ADMIN_PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${period === p.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {inMes && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-400 shrink-0">Mês:</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500"
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const Stat = ({
    label,
    value,
    sub,
    color,
  }: {
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-slate-800"}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Shield size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Painel da plataforma</h1>
            <p className="text-slate-400 text-xs">PedeAí · administração</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded-full font-medium">
            {ativos.length} ativos
          </span>
          <button
            onClick={() => setLogged(false)}
            className="text-slate-400 text-sm flex items-center gap-1"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-white rounded-xl p-1 mb-5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition ${tab === t.id ? "bg-cyan-500 text-white" : "text-slate-500"}`}
            >
              <Icon size={16} /> <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === "dashboard" && (
        <>
          <PeriodPills />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <Stat
              label="GMV da plataforma"
              value={money(gmv)}
              sub="faturamento somado dos clientes"
              color="text-cyan-600"
            />
            <Stat
              label="Receita de fees"
              value={money(feeRev)}
              sub="o que o PedeAí fatura"
              color="text-emerald-600"
            />
            <Stat
              label="Pedidos totais"
              value={totalOrders.toLocaleString("pt-BR")}
              color="text-slate-800"
            />
            <Stat label="Ticket médio" value={money(ticket)} color="text-violet-600" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <Stat
              label="Estabelecimentos"
              value={ests.length}
              sub={`${ativos.length} ativos · ${ests.length - ativos.length} pendente(s)`}
            />
            <Stat
              label="% via USDC"
              value={`${usdcShare.toFixed(1)}%`}
              sub="movimento em stablecoin"
              color="text-violet-600"
            />
            <Stat
              label="Fee médio"
              value={`${(ests.reduce((s, e) => s + (e.feePct || 0), 0) / ests.length).toFixed(1)}%`}
            />
            <Stat label="GMV/estab. ativo" value={money(ativos.length ? gmv / ativos.length : 0)} />
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm mb-4">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">
              Movimento por método de pagamento (plataforma)
            </h2>
            <div className="space-y-3">
              {PAY_KEYS.map((k) => {
                const v = byPay[k];
                return (
                  <div key={k}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-slate-700 font-medium">
                        <span className={`w-3 h-3 rounded-sm ${PAY_META[k].color}`} />{" "}
                        {PAY_META[k].label}
                      </span>
                      <span className="font-semibold">
                        {money(v)}{" "}
                        <span className="text-slate-400 font-normal text-xs">
                          · {((v / payTotal) * 100).toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${PAY_META[k].color} rounded-full transition-all`}
                        style={{ width: `${(v / payTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="font-semibold text-sm text-slate-600 mb-4">
              Top estabelecimentos por faturamento
            </h2>
            <div className="space-y-3">
              {top.map((e, k) => (
                <div key={e.id}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="flex items-center gap-2 text-slate-700 font-medium">
                      <span className="w-6 text-center text-base">{MEDAL[k] || `${k + 1}º`}</span>{" "}
                      {e.name}
                      {e.id === "live" && (
                        <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">
                          ao vivo
                        </span>
                      )}
                    </span>
                    <span className="text-slate-500 text-xs shrink-0 pl-2">
                      <b className="text-slate-800 text-sm">{money(e.revenue)}</b> · fee{" "}
                      {money((e.revenue * (e.feePct || 0)) / 100)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden ml-8">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: `${(e.revenue / maxRev) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === "faturamento" && (
        <>
          <PeriodPills />
          <h2 className="font-semibold text-slate-600 mb-3">
            Faturamento por estabelecimento{" "}
            <span className="text-slate-400 font-normal text-xs">· no período</span>
          </h2>
          <div className="space-y-2">
            {ests.map((e) => (
              <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                      {e.name}
                      {e.id === "live" && (
                        <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">
                          ao vivo
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {e.owner} · {e.city}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${e.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {e.status === "ativo" ? "Ativo" : "Pendente"}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-slate-50 rounded-lg py-2">
                    <p className="text-[11px] text-slate-400">Faturamento</p>
                    <p className="font-bold text-sm text-cyan-600">{money(e.revenue)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg py-2">
                    <p className="text-[11px] text-slate-400">Pedidos</p>
                    <p className="font-bold text-sm text-slate-700">
                      {e.orders.toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg py-2">
                    <p className="text-[11px] text-slate-400">Fee ({e.feePct}%)</p>
                    <p className="font-bold text-sm text-emerald-600">
                      {money((e.revenue * (e.feePct || 0)) / 100)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "cadastros" && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-slate-600">
              {ests.length} estabelecimentos cadastrados
            </h2>
            <button
              onClick={() => setReg(emptyForm())}
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-3 py-2 rounded-xl flex items-center gap-1 active:scale-95"
            >
              <Plus size={16} /> Cadastrar
            </button>
          </div>
          <div className="space-y-2">
            {ests.map((e) => (
              <div key={e.id} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <button
                      onClick={() => setReg(toForm(e))}
                      className="font-semibold text-sm truncate flex items-center gap-1.5 text-left hover:text-cyan-600 transition"
                    >
                      {e.name} <Edit3 size={12} className="text-slate-300 shrink-0" />
                      {e.id === "live" && (
                        <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">
                          ao vivo
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-slate-400">
                      {e.owner} · {e.neighborhood ? `${e.neighborhood}, ` : ""}
                      {e.city} · Plano {e.plan}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${e.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {e.status === "ativo" ? "Ativo" : "Pendente"}
                    </span>
                    {e.id !== "live" && (
                      <button
                        onClick={() => setDel(e)}
                        aria-label={`Excluir ${e.name}`}
                        className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 active:scale-90"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                  {e.user && (
                    <span className="flex items-center gap-1">
                      <User size={11} className="text-slate-400" /> {e.user}
                    </span>
                  )}
                  {e.password && (
                    <span className="flex items-center gap-1">
                      <Lock size={11} className="text-slate-400" />{" "}
                      {"•".repeat(Math.min(8, String(e.password).length))}
                    </span>
                  )}
                  {e.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={11} className="text-slate-400" /> {e.phone}
                    </span>
                  )}
                  {e.whatsapp && (
                    <span className="flex items-center gap-1">
                      <MessageCircle size={11} className="text-emerald-500" /> {e.whatsapp}
                    </span>
                  )}
                  {e.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={11} className="text-slate-400" /> {e.email}
                    </span>
                  )}
                  {e.website && (
                    <span className="flex items-center gap-1">
                      <Globe size={11} className="text-slate-400" /> {e.website}
                    </span>
                  )}
                  {e.instagram && (
                    <span className="flex items-center gap-1">
                      <Instagram size={11} className="text-pink-500" /> {e.instagram}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "taxas" && (
        <>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-4">
            <h2 className="font-semibold text-violet-900 mb-1 flex items-center gap-1.5">
              <Percent size={16} /> Fee do PedeAí por estabelecimento
            </h2>
            <p className="text-sm text-violet-800/80">
              Defina a taxa cobrada sobre cada venda. Ela aparece para o cliente no checkout, somada
              ao subtotal. Alterar a taxa do <b>Quiosque do Mar</b> reflete na hora no app do
              cliente.
            </p>
          </div>
          <div className="space-y-2">
            {estsMes.map((e) => (
              <div
                key={e.id}
                className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate flex items-center gap-1.5">
                    {e.name}
                    {e.id === "live" && (
                      <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold px-1.5 py-0.5 rounded-full">
                        ao vivo
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400">
                    Receita de fee estimada (mês):{" "}
                    <b className="text-emerald-600">{money((e.revenue * (e.feePct || 0)) / 100)}</b>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    value={e.feePct}
                    onChange={(ev) => setFee(e.id, ev.target.value.replace(/[^0-9.,]/g, ""))}
                    inputMode="decimal"
                    className="w-16 px-2 py-2 rounded-lg border border-slate-200 text-sm text-right focus:border-cyan-500 outline-none"
                  />
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "backlog" && <Backlog orders={orders} restaurant={restaurant} />}

      {reg && <EstablishmentEditor initial={reg} onSave={saveEst} onClose={() => setReg(null)} />}

      {del && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDel(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-full max-w-xs"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h2 className="font-bold text-center">Excluir estabelecimento?</h2>
            <p className="text-sm text-slate-500 text-center mt-1">
              <b>{del.name}</b> será removido da plataforma. Esta ação não pode ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => setDel(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl active:scale-95 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => delEst(del.id)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl active:scale-95 text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
