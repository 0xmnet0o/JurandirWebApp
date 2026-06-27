import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Coins,
  Mail,
  MapPin,
  MessageCircle,
  QrCode,
  Smartphone,
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
  {
    icon: QrCode,
    t: "Escaneie o QR Code",
    d: "Na sua mesa ou guarda-sol, aponte a câmera e abra o cardápio do local na hora.",
  },
  {
    icon: UtensilsCrossed,
    t: "Monte seu pedido",
    d: "Navegue pelo cardápio com fotos, escolha os itens e adicione observações.",
  },
  {
    icon: Smartphone,
    t: "Pague pelo celular",
    d: "Pix, cartão, parcelado ou stablecoin. Divida a conta com os amigos sem complicação.",
  },
];

const BENEFITS: { icon: LucideIcon; t: string; d: string }[] = [
  {
    icon: Sun,
    t: "Sem espera pelo garçom",
    d: "Peça e pague direto do seu lugar — o pedido cai na cozinha na hora.",
  },
  {
    icon: Users,
    t: "Conta dividida flexível",
    d: "Cada um paga sua parte do jeito que quiser, mesmo que em momentos diferentes.",
  },
  {
    icon: Coins,
    t: "Pagamento moderno",
    d: "Pix, crédito em até 6x e stablecoin (USDC) — menos taxa, sem estorno.",
  },
  {
    icon: TrendingUp,
    t: "Gestão completa",
    d: "Para o estabelecimento: cardápio, pedidos, KPIs e impressão automática na cozinha.",
  },
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

/** Site institucional (pedeai.com.br): hero, como funciona, finder e captação de leads. */
export function Landing({ onEnter, onForEstablishment }: LandingProps) {
  const { establishments } = useStore();
  const ativos = establishments.filter((e) => e.status === "ativo");
  const cities = Array.from(new Set(ativos.map((e) => e.city)));

  const [city, setCity] = useState("");
  const [bairro, setBairro] = useState("");
  const bairros = city
    ? Array.from(
        new Set(
          ativos
            .filter((e) => e.city === city)
            .map((e) => e.neighborhood)
            .filter(Boolean),
        ),
      )
    : [];
  const results = city
    ? ativos.filter((e) => e.city === city && (!bairro || e.neighborhood === bairro))
    : [];
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

  return (
    <div className="bg-white">
      {/* HERO */}
      <div className="relative bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full text-sm font-medium mb-5">
            <Sun size={15} className="text-amber-300" /> Pedidos por QR Code para bares e
            restaurantes de praia
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Peça da sua espreguiçadeira.
            <br />O garçom é o seu celular.
          </h1>
          <p className="text-white/90 text-lg mt-5 max-w-2xl mx-auto">
            O PedeAí transforma o atendimento na areia: o cliente escaneia o QR Code, pede e paga
            pelo celular — sem fila, sem espera e sem complicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={scrollToFinder}
              className="bg-white text-cyan-700 font-bold px-6 py-3.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <MapPin size={18} /> Encontrar perto de mim
            </button>
            <button
              onClick={openLead}
              className="bg-cyan-700/40 backdrop-blur border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Store size={18} /> Tenho um estabelecimento
            </button>
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-800">
          Como funciona
        </h2>
        <p className="text-slate-500 text-center mt-2">Três passos, do guarda-sol à cozinha.</p>
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {STEPS.map((s, k) => {
            const Icon = s.icon;
            return (
              <div key={k} className="bg-slate-50 rounded-3xl p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} />
                </div>
                <div className="text-xs font-bold text-cyan-600 mb-1">PASSO {k + 1}</div>
                <h3 className="font-bold text-slate-800">{s.t}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-snug">{s.d}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* BENEFÍCIOS */}
      <div className="bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-slate-800">
            Por que PedeAí
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            {BENEFITS.map((b, k) => {
              const Icon = b.icon;
              return (
                <div key={k} className="bg-white rounded-3xl p-5 flex gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{b.t}</h3>
                    <p className="text-sm text-slate-500 mt-1 leading-snug">{b.d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FINDER */}
      <div id="finder" className="max-w-4xl mx-auto px-6 py-14">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            Estabelecimentos perto de você
          </h2>
          <p className="text-slate-500 mt-2">
            Selecione sua cidade e bairro para ver onde o PedeAí já está.
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-3xl p-5 sm:p-6">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                <MapPin size={13} className="text-cyan-500" /> Cidade
              </label>
              <select
                value={city}
                onChange={(e) => pickCity(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500"
              >
                <option value="">Selecione sua cidade…</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-1">
                <MapPin size={13} className="text-cyan-500" /> Bairro
              </label>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                disabled={!city}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-cyan-500 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <option value="">{city ? "Todos os bairros" : "Escolha a cidade primeiro"}</option>
                {bairros.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            {!city ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                <MapPin size={32} className="mx-auto mb-3 opacity-40" />
                Escolha uma cidade para ver os estabelecimentos disponíveis.
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Nenhum estabelecimento neste filtro ainda. Em breve! 🌊
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">
                  {results.length}{" "}
                  {results.length === 1
                    ? "estabelecimento encontrado"
                    : "estabelecimentos encontrados"}
                  {bairro ? ` em ${bairro}` : ""}:
                </p>
                <div className="space-y-2">
                  {results.map((e) => (
                    <div
                      key={e.id}
                      className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl shrink-0">
                        🏖️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{e.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin size={11} /> {e.neighborhood} · {e.city}
                        </p>
                      </div>
                      <button
                        onClick={onEnter}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 shrink-0"
                      >
                        Ver cardápio
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  No app real, cada estabelecimento abre o próprio cardápio. Nesta demo, todos levam
                  ao cardápio do Quiosque do Mar.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CTA ESTABELECIMENTO + FOOTER */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Tem um bar ou restaurante na praia?
          </h2>
          <p className="text-slate-300 mt-2 max-w-xl mx-auto">
            Atenda mais mesas com menos garçons, receba na hora e tenha controle total das vendas.
          </p>
          <button
            onClick={openLead}
            className="mt-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-3.5 rounded-xl active:scale-95 transition inline-flex items-center gap-2"
          >
            <Store size={18} /> Quero o PedeAí no meu negócio
          </button>
          <p className="mt-3 text-sm text-slate-400">
            Já é parceiro?{" "}
            <button onClick={onForEstablishment} className="text-cyan-400 font-medium underline">
              Acessar o painel
            </button>
          </p>
          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-sm">
            <span className="flex items-center gap-2 font-bold text-white">
              <Sun size={18} className="text-amber-400" /> PedeAí
            </span>
            <span>www.pedeai.com.br · © {new Date().getFullYear()} PedeAí</span>
          </div>
        </div>
      </div>

      {lead && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
          onClick={() => setLead(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4">
                  <Check size={36} />
                </div>
                <h2 className="text-xl font-bold">Recebemos seu interesse!</h2>
                <p className="text-slate-500 text-sm mt-2">
                  Seus dados foram preparados para envio ao nosso time comercial. Em breve entramos
                  em contato pelo WhatsApp ou e-mail informado.
                </p>
                <button
                  onClick={() => setLead(null)}
                  className="mt-5 w-full bg-slate-900 text-white font-semibold py-3 rounded-xl active:scale-95"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <Store size={20} className="text-cyan-500" /> Quero o PedeAí
                  </h2>
                  <button onClick={() => setLead(null)} aria-label="Fechar">
                    <X size={22} className="text-slate-400" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Preencha os dados do seu estabelecimento. Nosso time comercial entra em contato.
                </p>
                <label className="text-xs font-medium text-slate-500">
                  Nome do estabelecimento *
                </label>
                <input
                  value={lead.name}
                  onChange={(e) => updLead("name", e.target.value)}
                  className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                  placeholder="Ex: Quiosque do Sol"
                />
                <label className="text-xs font-medium text-slate-500">Responsável *</label>
                <input
                  value={lead.owner}
                  onChange={(e) => updLead("owner", e.target.value)}
                  className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                  placeholder="Seu nome"
                />
                <label className="text-xs font-medium text-slate-500">Cidade / UF</label>
                <input
                  value={lead.city}
                  onChange={(e) => updLead("city", e.target.value)}
                  className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                  placeholder="Ex: Maringá/PR"
                />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <MessageCircle size={12} className="text-emerald-500" /> WhatsApp *
                    </label>
                    <input
                      value={lead.whatsapp}
                      onChange={(e) => updLead("whatsapp", e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Mail size={12} className="text-cyan-500" /> E-mail *
                    </label>
                    <input
                      value={lead.email}
                      onChange={(e) => updLead("email", e.target.value)}
                      className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                      placeholder="voce@email.com"
                    />
                  </div>
                </div>
                <label className="text-xs font-medium text-slate-500">
                  Tipo de estabelecimento
                </label>
                <select
                  value={lead.type}
                  onChange={(e) => updLead("type", e.target.value)}
                  className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
                >
                  <option>Quiosque de praia</option>
                  <option>Bar</option>
                  <option>Restaurante</option>
                  <option>Food truck</option>
                  <option>Outro</option>
                </select>
                <label className="text-xs font-medium text-slate-500">
                  Mensagem <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={lead.message}
                  onChange={(e) => updLead("message", e.target.value)}
                  rows={2}
                  className="w-full mt-1 mb-4 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none"
                  placeholder="Conte um pouco sobre seu negócio…"
                />
                {leadValid ? (
                  <a
                    href={leadMailto}
                    onClick={() => setSent(true)}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Mail size={18} /> Enviar para o time PedeAí
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full bg-slate-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Mail size={18} /> Enviar para o time PedeAí
                  </button>
                )}
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Os campos com * são obrigatórios. Enviamos para {LEADS_EMAIL}.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
