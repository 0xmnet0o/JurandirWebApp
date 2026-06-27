import { useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Check,
  Clock,
  Coins,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  TrendingUp,
  UtensilsCrossed,
  Users,
  X,
} from "lucide-react";
import { useStore } from "@/store/context";
import { LEADS_EMAIL } from "@/lib/format";

export interface LandingProps {
  onEnter: () => void;
  onForEstablishment: () => void;
}

interface LeadForm {
  name: string;
  owner: string;
  city: string;
  whatsapp: string;
  email: string;
  type: string;
  message: string;
}

const STEPS: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: QrCode, t: "Escaneie o QR Code", d: "No guarda-sol ou na mesa, aponte a câmera e abra o cardápio do local na hora." },
  { icon: UtensilsCrossed, t: "Monte seu pedido", d: "Navegue pelo cardápio com fotos, escolha os itens e deixe suas observações." },
  { icon: Smartphone, t: "Pague pelo celular", d: "Pix, cartão, parcelado ou stablecoin. Divida a conta com os amigos sem complicação." },
];

const BENEFITS: { icon: LucideIcon; t: string; d: string }[] = [
  { icon: Sun, t: "Sem espera pelo garçom", d: "Peça e pague do seu lugar — o pedido cai na cozinha na hora." },
  { icon: Users, t: "Conta dividida flexível", d: "Cada um paga sua parte do jeito que quiser, mesmo em momentos diferentes." },
  { icon: Coins, t: "Pagamento moderno", d: "Pix, crédito em até 6x e stablecoin (USDC) — menos taxa, sem estorno." },
  { icon: TrendingUp, t: "Gestão completa", d: "Para o estabelecimento: cardápio, pedidos, KPIs e impressão na cozinha." },
];

const STATS: { n: string; l: string }[] = [
  { n: "0", l: "filas no caixa" },
  { n: "<1min", l: "do QR ao pedido" },
  { n: "4", l: "formas de pagar" },
  { n: "100%", l: "pé na areia" },
];

const blankLead = (): LeadForm => ({
  name: "",
  owner: "",
  city: "",
  whatsapp: "",
  email: "",
  type: "Quiosque de praia",
  message: "",
});

// Atmosfera do hero: brilho de pôr do sol sobre o azul do oceano.
const heroBg: CSSProperties = {
  backgroundImage:
    "radial-gradient(120% 90% at 78% -10%, #FFC24B 0%, #FF8A5B 22%, #EF5130 40%, rgba(239,81,48,0) 68%), linear-gradient(180deg, #0C6A70 0%, #0A3437 100%)",
};

/** Site institucional (pedeai.com.br): hero, como funciona, finder e captação de leads. */
export function Landing({ onEnter, onForEstablishment }: LandingProps) {
  const { establishments } = useStore();
  const ativos = establishments.filter((e) => e.status === "ativo");
  const cities = Array.from(new Set(ativos.map((e) => e.city)));

  const [city, setCity] = useState("");
  const [bairro, setBairro] = useState("");
  const bairros = city
    ? Array.from(new Set(ativos.filter((e) => e.city === city).map((e) => e.neighborhood).filter(Boolean)))
    : [];
  const results = city ? ativos.filter((e) => e.city === city && (!bairro || e.neighborhood === bairro)) : [];
  const pickCity = (c: string) => {
    setCity(c);
    setBairro("");
  };
  const scrollToFinder = () => {
    document.getElementById("finder")?.scrollIntoView({ behavior: "smooth" });
  };

  const [lead, setLead] = useState<LeadForm | null>(null);
  const [sent, setSent] = useState(false);
  const openLead = () => {
    setLead(blankLead());
    setSent(false);
  };
  const updLead = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) =>
    setLead((p) => (p ? { ...p, [k]: v } : p));

  const leadValid = lead && lead.name && lead.owner && lead.whatsapp && lead.email;
  const leadMailto = lead
    ? `mailto:${LEADS_EMAIL}?subject=${encodeURIComponent(`Novo interesse PedeAí — ${lead.name}`)}&body=${encodeURIComponent(
        `Estabelecimento: ${lead.name}\nResponsável: ${lead.owner}\nCidade/UF: ${lead.city}\nWhatsApp: ${lead.whatsapp}\nE-mail: ${lead.email}\nTipo: ${lead.type}\n\nMensagem:\n${lead.message || "—"}`,
      )}`
    : "";

  const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

  return (
    <div className="font-body bg-sand-100 text-ink">
      {/* ===== HERO ===== */}
      <header className="grain relative overflow-hidden text-white" style={heroBg}>
        {/* sol decorativo */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sun-400/30 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* coluna texto */}
            <div>
              <span
                className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur"
                style={delay(0)}
              >
                <Sparkles size={14} className="text-sun-400" /> Pedidos por QR Code · pé na areia
              </span>

              <h1
                className="animate-fade-up text-balance mt-6 font-display text-5xl font-normal leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
                style={delay(0.08)}
              >
                Peça da sua espreguiçadeira.
                <span className="block text-sun-400">O garçom é o seu celular.</span>
              </h1>

              <p
                className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-white/85"
                style={delay(0.16)}
              >
                O PedeAí transforma o atendimento na praia: o cliente escaneia o QR Code, pede e paga
                pelo celular — sem fila, sem espera e sem complicação.
              </p>

              <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row" style={delay(0.24)}>
                <button
                  onClick={scrollToFinder}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-coral-500 px-7 py-4 text-base font-bold text-white shadow-glow transition hover:bg-coral-600 active:scale-95"
                >
                  <MapPin size={18} /> Encontrar perto de mim
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={openLead}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-95"
                >
                  <Store size={18} /> Tenho um estabelecimento
                </button>
              </div>

              <dl className="animate-fade-up mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4" style={delay(0.32)}>
                {STATS.map((s) => (
                  <div key={s.l}>
                    <dt className="font-display text-3xl text-sun-400">{s.n}</dt>
                    <dd className="mt-0.5 text-xs leading-tight text-white/70">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* coluna visual: cartão de pedido flutuante */}
            <div className="animate-fade-up relative mx-auto hidden w-full max-w-xs lg:block" style={delay(0.4)}>
              <div className="animate-float rounded-[28px] bg-white p-5 pt-7 text-ink shadow-soft">
                <div className="flex items-center justify-between pl-10">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ocean-700">
                    <MapPin size={13} className="text-coral-500" /> Guarda-sol nº 14
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Pago
                  </span>
                </div>
                <div className="mt-4 space-y-2.5 text-sm">
                  {[
                    ["🍹", "2× Caipirinha", "R$ 44,00"],
                    ["🍤", "Porção de Camarão", "R$ 68,00"],
                    ["🥥", "Água de Coco", "R$ 10,00"],
                  ].map(([e, n, v]) => (
                    <div key={n} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-ink/80">
                        <span>{e}</span> {n}
                      </span>
                      <span className="font-semibold text-ink/60">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-sand-200 pt-3">
                  <span className="text-xs text-ink/50">Total</span>
                  <span className="font-display text-xl text-ocean-700">R$ 122,00</span>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  <Check size={14} /> Enviado para a cozinha
                </div>
              </div>
              {/* selo QR */}
              <div className="absolute -left-5 -top-6 flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl bg-ocean-900 shadow-soft ring-4 ring-white/20">
                <QrCode size={32} className="text-sun-400" />
              </div>
            </div>
          </div>
        </div>

        {/* borda ondulada inferior */}
        <svg viewBox="0 0 1440 60" className="block w-full text-sand-100" preserveAspectRatio="none" aria-hidden>
          <path
            fill="currentColor"
            d="M0,32 C240,64 480,0 720,16 C960,32 1200,64 1440,28 L1440,60 L0,60 Z"
          />
        </svg>
      </header>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-coral-500">Como funciona</p>
          <h2 className="mt-2 font-display text-4xl text-ocean-800 sm:text-5xl">Do guarda-sol à cozinha em 3 toques</h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, k) => {
            const Icon = s.icon;
            return (
              <div
                key={k}
                className="group relative rounded-3xl border border-sand-200 bg-white p-7 shadow-soft transition hover:-translate-y-1"
              >
                <span className="absolute right-6 top-6 font-display text-5xl text-sand-200">{k + 1}</span>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-800 text-sun-400 transition group-hover:scale-105">
                  <Icon size={26} />
                </div>
                <h3 className="mt-5 font-display text-2xl text-ink">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-ink/65">{s.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== BENEFÍCIOS ===== */}
      <section className="bg-sand-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-coral-500">Por que PedeAí</p>
              <h2 className="mt-2 font-display text-4xl text-ocean-800 sm:text-5xl text-balance">
                Mais drinks servidos, menos correria.
              </h2>
              <p className="mt-4 leading-relaxed text-ink/65">
                Pensado para o ritmo da praia: o cliente resolve tudo pelo celular e a sua equipe foca
                em preparar e entregar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((b, k) => {
                const Icon = b.icon;
                return (
                  <div key={k} className="flex gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral-500/10 text-coral-600">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink">{b.t}</h3>
                      <p className="mt-1 text-sm leading-snug text-ink/60">{b.d}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINDER ===== */}
      <section id="finder" className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-coral-500">Perto de você</p>
          <h2 className="mt-2 font-display text-4xl text-ocean-800 sm:text-5xl">Encontre um quiosque PedeAí</h2>
          <p className="mt-3 text-ink/60">Selecione sua cidade e bairro para ver onde já estamos.</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-ocean-800/10 bg-ocean-900 p-6 text-white shadow-soft sm:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                <MapPin size={13} className="text-sun-400" /> Cidade
              </span>
              <select
                value={city}
                onChange={(e) => pickCity(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none backdrop-blur focus:border-sun-400"
              >
                <option value="" className="text-ink">
                  Selecione sua cidade…
                </option>
                {cities.map((c) => (
                  <option key={c} value={c} className="text-ink">
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                <MapPin size={13} className="text-sun-400" /> Bairro
              </span>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={!city}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none backdrop-blur focus:border-sun-400 disabled:opacity-50"
              >
                <option value="" className="text-ink">
                  {city ? "Todos os bairros" : "Escolha a cidade primeiro"}
                </option>
                {bairros.map((b) => (
                  <option key={b} value={b} className="text-ink">
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-6">
            {!city ? (
              <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-sm text-white/60">
                <MapPin size={30} className="mx-auto mb-3 text-sun-400/60" />
                Escolha uma cidade para ver os estabelecimentos disponíveis.
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 py-12 text-center text-sm text-white/60">
                Nenhum estabelecimento neste filtro ainda. Em breve! 🌊
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-white/70">
                  {results.length} {results.length === 1 ? "encontrado" : "encontrados"}
                  {bairro ? ` em ${bairro}` : ""}:
                </p>
                <div className="space-y-2.5">
                  {results.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-4 rounded-2xl bg-white/95 p-3.5 text-ink transition hover:bg-white"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sun-400 to-coral-500 text-xl">
                        🏖️
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-lg text-ocean-800">{e.name}</p>
                        <p className="flex items-center gap-1 text-xs text-ink/50">
                          <MapPin size={11} /> {e.neighborhood} · {e.city}
                        </p>
                      </div>
                      <button
                        onClick={onEnter}
                        className="shrink-0 rounded-full bg-coral-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coral-600 active:scale-95"
                      >
                        Ver cardápio
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-[11px] text-white/45">
                  Nesta demo, todos levam ao cardápio do Quiosque do Mar.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== CTA DONO + FOOTER ===== */}
      <footer className="grain relative overflow-hidden text-white" style={heroBg}>
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-coral-500/30 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider">
            <Store size={14} className="text-sun-400" /> Para estabelecimentos
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-display text-4xl leading-tight sm:text-5xl">
            Tem um bar ou quiosque na praia?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Atenda mais mesas com menos garçons, receba na hora e tenha controle total das vendas.
          </p>
          <button
            onClick={openLead}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-coral-500 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:bg-coral-600 active:scale-95"
          >
            Quero o PedeAí no meu negócio
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-4 text-sm text-white/70">
            Já é parceiro?{" "}
            <button onClick={onForEstablishment} className="font-semibold text-sun-400 underline underline-offset-2">
              Acessar o painel
            </button>
          </p>

          <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row">
            <span className="flex items-center gap-2 font-display text-lg text-white">
              <Sun size={18} className="text-sun-400" /> PedeAí
            </span>
            <span>www.pedeai.com.br · © {new Date().getFullYear()} PedeAí</span>
          </div>
        </div>
      </footer>

      {/* ===== MODAL DE LEAD ===== */}
      {lead && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setLead(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-sand-50 p-6 text-ink sm:rounded-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={36} />
                </div>
                <h2 className="font-display text-2xl">Recebemos seu interesse!</h2>
                <p className="mt-2 text-sm text-ink/60">
                  Preparamos seus dados para o nosso time comercial. Em breve entramos em contato pelo
                  WhatsApp ou e-mail informado.
                </p>
                <button
                  onClick={() => setLead(null)}
                  className="mt-5 w-full rounded-full bg-ocean-800 py-3 font-semibold text-white active:scale-95"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-2xl">
                    <Store size={20} className="text-coral-500" /> Quero o PedeAí
                  </h2>
                  <button onClick={() => setLead(null)} aria-label="Fechar">
                    <X size={22} className="text-ink/40" />
                  </button>
                </div>
                <p className="mb-4 text-xs text-ink/50">
                  Preencha os dados do seu estabelecimento. Nosso time comercial entra em contato.
                </p>

                {[
                  { k: "name" as const, label: "Nome do estabelecimento *", ph: "Ex: Quiosque do Sol" },
                  { k: "owner" as const, label: "Responsável *", ph: "Seu nome" },
                  { k: "city" as const, label: "Cidade / UF", ph: "Ex: Itajaí/SC" },
                ].map((f) => (
                  <label key={f.k} className="mb-3 block">
                    <span className="text-xs font-medium text-ink/60">{f.label}</span>
                    <input
                      value={lead[f.k]}
                      onChange={(e) => updLead(f.k, e.target.value)}
                      placeholder={f.ph}
                      className="mt-1 w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral-500"
                    />
                  </label>
                ))}

                <div className="mb-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="flex items-center gap-1 text-xs font-medium text-ink/60">
                      <MessageCircle size={12} className="text-emerald-500" /> WhatsApp *
                    </span>
                    <input
                      value={lead.whatsapp}
                      onChange={(e) => updLead("whatsapp", e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="mt-1 w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral-500"
                    />
                  </label>
                  <label className="block">
                    <span className="flex items-center gap-1 text-xs font-medium text-ink/60">
                      <Mail size={12} className="text-ocean-600" /> E-mail *
                    </span>
                    <input
                      value={lead.email}
                      onChange={(e) => updLead("email", e.target.value)}
                      placeholder="voce@email.com"
                      className="mt-1 w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral-500"
                    />
                  </label>
                </div>

                <label className="mb-3 block">
                  <span className="text-xs font-medium text-ink/60">Tipo de estabelecimento</span>
                  <select
                    value={lead.type}
                    onChange={(e) => updLead("type", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral-500"
                  >
                    <option>Quiosque de praia</option>
                    <option>Bar</option>
                    <option>Restaurante</option>
                    <option>Food truck</option>
                    <option>Outro</option>
                  </select>
                </label>

                <label className="mb-4 block">
                  <span className="text-xs font-medium text-ink/60">
                    Mensagem <span className="font-normal text-ink/40">(opcional)</span>
                  </span>
                  <textarea
                    value={lead.message}
                    onChange={(e) => updLead("message", e.target.value)}
                    rows={2}
                    placeholder="Conte um pouco sobre seu negócio…"
                    className="mt-1 w-full resize-none rounded-xl border border-sand-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-coral-500"
                  />
                </label>

                {leadValid ? (
                  <a
                    href={leadMailto}
                    onClick={() => setSent(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-coral-500 py-3 font-bold text-white transition hover:bg-coral-600 active:scale-95"
                  >
                    <Mail size={18} /> Enviar para o time PedeAí
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-sand-300 py-3 font-bold text-white"
                  >
                    <Mail size={18} /> Enviar para o time PedeAí
                  </button>
                )}
                <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-ink/40">
                  <Clock size={11} /> Campos com * são obrigatórios. Enviamos para {LEADS_EMAIL}.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
