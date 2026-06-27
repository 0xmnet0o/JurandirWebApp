import { useState } from "react";
import { ArrowLeft, Check, Clock, MapPin, MessageSquare, Minus, Plus, Users } from "lucide-react";
import { Img } from "@/components/Img";
import { catGrad } from "@/data/categories";
import { PAYMENTS, pay } from "@/data/payments";
import { money } from "@/lib/format";
import type { MenuItem, Payment } from "@/types";
import type { CartLine, FinishOrder } from "./types";

export interface CheckoutProps {
  cart: CartLine[];
  total: number;
  fee: number;
  feePct: number;
  note: string;
  setNote: (note: string) => void;
  menu: MenuItem[];
  location: string;
  add: (item: MenuItem) => void;
  onBack: () => void;
  onPay: FinishOrder;
}

type CheckoutMode = "full" | "split";

/** Tela de confirmação e pagamento: à vista (com parcelas) ou conta dividida. */
export function Checkout({
  cart,
  total,
  fee,
  feePct,
  note,
  setNote,
  menu,
  location,
  add,
  onBack,
  onPay,
}: CheckoutProps) {
  const [mode, setMode] = useState<CheckoutMode>("full");
  const [sel, setSel] = useState<Payment["id"] | null>(null);
  const [parc, setParc] = useState(1);
  const [paying, setPaying] = useState(false);
  const [people, setPeople] = useState(2);
  const [paid, setPaid] = useState<(Payment | null)[]>([null, null]);

  const cartIds = cart.map((c) => c.id);
  const desserts = menu
    .filter((i) => i.cat === "Sobremesas" && !cartIds.includes(i.id))
    .slice(0, 4);

  const grand = total + (fee || 0);
  const maxParc = Math.max(1, Math.min(6, Math.floor(grand / 20)));
  const parcels = Array.from({ length: maxParc }, (_, i) => i + 1);
  const share = total / people;
  const nPaid = paid.filter(Boolean).length;
  const allPaid = nPaid === people;

  const setPpl = (n: number) => {
    setPeople(n);
    setPaid(Array(n).fill(null));
  };
  const payPerson = (idx: number, method: Payment | null) =>
    setPaid((p) => p.map((m, i) => (i === idx ? method : m)));
  const pickPay = (id: Payment["id"]) => {
    setSel(id);
    if (id !== "credito") setParc(1);
  };

  const finishFull = () => {
    if (!sel) return;
    setPaying(true);
    const base = pay(sel);
    const payment: Payment =
      sel === "credito" && parc > 1
        ? { ...base, label: `Crédito ${parc}x de ${money(grand / parc)}` }
        : base;
    setTimeout(() => onPay(payment), 1400);
  };
  const finishSplit = () => {
    setPaying(true);
    const splits = paid.map((m) => ({ method: m, amount: share }));
    const payment: Payment = {
      id: "split",
      label: allPaid ? `Dividido · ${people} pessoas` : `Dividido · ${nPaid}/${people} pagos`,
      icon: Users,
      color: "bg-pink-500",
    };
    setTimeout(() => onPay(payment, splits), 1400);
  };

  return (
    <div className="max-w-md mx-auto px-5 py-5 pb-28">
      <button onClick={onBack} className="flex items-center gap-1 text-slate-500 text-sm mb-4">
        <ArrowLeft size={16} /> Voltar ao cardápio
      </button>
      <h1 className="text-xl font-bold mb-4">Confirmar pedido</h1>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <MapPin size={12} /> {location}
        </p>
        {cart.map((i) => (
          <div key={i.id} className="flex justify-between py-1.5 text-sm">
            <span className="text-slate-600">
              {i.qty}× {i.name}
            </span>
            <span className="font-medium">{money(i.price * i.qty)}</span>
          </div>
        ))}
        {fee > 0 ? (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span className="flex items-center gap-1">
                Taxa de serviço PedeAí{" "}
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-medium">
                  {feePct}%
                </span>
              </span>
              <span>{money(fee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-1.5 border-t border-slate-100">
              <span>Total a pagar</span>
              <span className="text-cyan-600">{money(grand)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 font-bold">
            <span>Total</span>
            <span className="text-cyan-600">{money(total)}</span>
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full mb-4 bg-white border-2 border-cyan-500 text-cyan-600 font-semibold py-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 hover:bg-cyan-50"
      >
        <Plus size={18} /> Continuar adicionando mais itens
      </button>

      {desserts.length > 0 && (
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
            🍦 Que tal um doce pra fechar?
          </h3>
          <p className="text-xs text-rose-700/70 mb-3">Toque no + para adicionar ao pedido</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {desserts.map((i) => (
              <div
                key={i.id}
                className="w-32 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm"
              >
                <Img
                  src={i.photo}
                  emoji={i.emoji}
                  gradient={catGrad(i.cat)}
                  className="w-full h-20"
                />
                <div className="p-2">
                  <p className="text-xs font-semibold leading-tight truncate">{i.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-cyan-600">{money(i.price)}</span>
                    <button
                      onClick={() => add(i)}
                      aria-label={`Adicionar ${i.name}`}
                      className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <label className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mb-2">
          <MessageSquare size={15} className="text-cyan-500" /> Observação do pedido{" "}
          <span className="text-slate-400 font-normal text-xs">(opcional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="Ex: caipirinha sem açúcar, carne ao ponto, alergia a camarão, entregar rápido…"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none"
        />
        <p className="text-[11px] text-slate-400 mt-1 text-right">{note.length}/200</p>
      </div>

      <div className="flex gap-1 bg-slate-200 rounded-xl p-1 mb-3">
        <button
          onClick={() => setMode("full")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode === "full" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
        >
          Pagar tudo
        </button>
        <button
          onClick={() => setMode("split")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1.5 ${mode === "split" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
        >
          <Users size={15} /> Dividir conta
        </button>
      </div>

      {mode === "full" ? (
        <>
          <h2 className="font-semibold text-sm mb-2 text-slate-600">Forma de pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENTS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => pickPay(p.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition ${sel === p.id ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full ${p.color} text-white flex items-center justify-center`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{p.label}</span>
                </button>
              );
            })}
          </div>
          {sel === "credito" && (
            <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-slate-600 mb-2">Em quantas vezes?</h3>
              <div className="grid grid-cols-3 gap-2">
                {parcels.map((n) => (
                  <button
                    key={n}
                    onClick={() => setParc(n)}
                    className={`py-2 rounded-xl border-2 flex flex-col items-center transition ${parc === n ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                  >
                    <span className="font-bold text-sm">{n}x</span>
                    <span className="text-xs text-slate-600">{money(total / n)}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      {n === 1 ? "à vista" : "sem juros"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Parcela mínima de R$ 20,00 · parcelamento sem juros
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm text-slate-600">Quantos amigos?</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => people > 2 && setPpl(people - 1)}
                aria-label="Menos pessoas"
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active:scale-90"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold w-4 text-center">{people}</span>
              <button
                onClick={() => people < 8 && setPpl(people + 1)}
                aria-label="Mais pessoas"
                className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Dividido igualmente · <b className="text-cyan-600">{money(share)}</b> por pessoa. Cada
            um paga do jeito que quiser.
          </p>
          <div className="space-y-2">
            {paid.map((m, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>{" "}
                    Amigo {idx + 1}
                  </span>
                  {m ? (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check size={13} /> Pago · {m.id === "usdc" ? "USDC" : m.label}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">{money(share)}</span>
                  )}
                </div>
                {m ? (
                  <button
                    onClick={() => payPerson(idx, null)}
                    className="text-[11px] text-slate-400 underline"
                  >
                    desfazer
                  </button>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {PAYMENTS.map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          onClick={() => payPerson(idx, p)}
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
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>
                {nPaid} de {people} pagaram
              </span>
              <span>
                {money(nPaid * share)} de {money(total)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(nPaid / people) * 100}%` }}
              />
            </div>
          </div>
          {fee > 0 && (
            <p className="mt-2 text-[11px] text-slate-400">
              + Taxa de serviço PedeAí ({feePct}%): <b className="text-slate-600">{money(fee)}</b> —
              cobrada à parte. Total a pagar: <b className="text-slate-600">{money(grand)}</b>.
            </p>
          )}
          {nPaid > 0 && nPaid < people && (
            <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs flex gap-1.5">
              <Clock size={14} className="shrink-0 mt-0.5" />
              <span>
                Falta(m) <b>{people - nPaid}</b> pagamento(s). O pedido só vai para a cozinha quando
                estiver <b>100% pago</b> — os demais podem pagar depois em “Meus pedidos”.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 bg-gradient-to-t from-slate-100 to-transparent">
        {mode === "full" ? (
          <button
            disabled={!sel || paying}
            onClick={finishFull}
            className="w-full bg-cyan-500 disabled:bg-slate-300 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
          >
            {paying
              ? "Processando pagamento…"
              : sel === "credito" && parc > 1
                ? `Pagar ${parc}x de ${money(grand / parc)}`
                : `Pagar ${money(grand)}`}
          </button>
        ) : (
          <button
            disabled={nPaid === 0 || paying}
            onClick={finishSplit}
            className={`w-full disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-2 ${allPaid ? "bg-cyan-500 hover:bg-cyan-600" : "bg-amber-500 hover:bg-amber-600"}`}
          >
            {paying
              ? "Enviando pedido…"
              : nPaid === 0
                ? "Selecione ao menos 1 pagamento"
                : allPaid
                  ? `Finalizar pedido — ${money(total)}`
                  : `Enviar pedido · ${nPaid}/${people} pagos`}
          </button>
        )}
      </div>
    </div>
  );
}
