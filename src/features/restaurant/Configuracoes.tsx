import { useState } from "react";
import { Lock, MessageCircle, Printer, Wifi } from "lucide-react";
import { waHref } from "@/lib/format";
import type { Restaurant } from "@/types";

export interface ConfiguracoesProps {
  restaurant: Restaurant;
}

interface FeedbackMsg {
  ok: boolean;
  t: string;
}

interface PasswordForm {
  cur: string;
  nova: string;
  conf: string;
}

type PrinterConnection = "rede" | "usb" | "nuvem";

interface PrinterForm {
  auto: boolean;
  conn: PrinterConnection;
  ip: string;
  port: string;
  model: string;
}

/** Configurações do estabelecimento: senha, integração com impressora e suporte. */
export function Configuracoes({ restaurant }: ConfiguracoesProps) {
  const [pw, setPw] = useState<PasswordForm>({ cur: "", nova: "", conf: "" });
  const [pwMsg, setPwMsg] = useState<FeedbackMsg | null>(null);
  const [pr, setPr] = useState<PrinterForm>({
    auto: true,
    conn: "rede",
    ip: "192.168.0.50",
    port: "9100",
    model: "Epson TM-T20",
  });
  const [prMsg, setPrMsg] = useState<FeedbackMsg | null>(null);

  const updPw = <K extends keyof PasswordForm>(k: K, v: PasswordForm[K]) => {
    setPw((p) => ({ ...p, [k]: v }));
    setPwMsg(null);
  };
  const updPr = <K extends keyof PrinterForm>(k: K, v: PrinterForm[K]) => {
    setPr((p) => ({ ...p, [k]: v }));
    setPrMsg(null);
  };

  const savePw = () => {
    if (!pw.cur || !pw.nova || !pw.conf)
      return setPwMsg({ ok: false, t: "Preencha todos os campos." });
    if (pw.nova.length < 6)
      return setPwMsg({ ok: false, t: "A nova senha precisa ter ao menos 6 caracteres." });
    if (pw.nova !== pw.conf) return setPwMsg({ ok: false, t: "A confirmação não confere." });
    setPwMsg({ ok: true, t: "Senha alterada com sucesso!" });
    setPw({ cur: "", nova: "", conf: "" });
  };
  const testPrint = () => setPrMsg({ ok: true, t: "Comando de teste enviado à impressora ✅" });
  const savePr = () => setPrMsg({ ok: true, t: "Configuração de impressora salva!" });

  return (
    <div className="space-y-4">
      {/* Senha */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
          <Lock size={16} className="text-cyan-500" /> Alterar senha
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Senha atual</label>
            <input
              type="password"
              value={pw.cur}
              onChange={(e) => updPw("cur", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Nova senha</label>
            <input
              type="password"
              value={pw.nova}
              onChange={(e) => updPw("nova", e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Confirmar nova senha</label>
            <input
              type="password"
              value={pw.conf}
              onChange={(e) => updPw("conf", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            />
          </div>
        </div>
        {pwMsg && (
          <p className={`text-xs mt-2 ${pwMsg.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {pwMsg.t}
          </p>
        )}
        <button
          onClick={savePw}
          className="mt-3 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition"
        >
          Alterar senha
        </button>
      </div>

      {/* Impressora */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3 flex items-center gap-1.5">
          <Printer size={16} className="text-cyan-500" /> Integração com impressora
        </h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Impressão automática</p>
            <p className="text-xs text-slate-400">Imprime o pedido ao confirmar o pagamento</p>
          </div>
          <button
            onClick={() => updPr("auto", !pr.auto)}
            aria-label="Alternar impressão automática"
            className={`w-11 h-6 rounded-full transition relative shrink-0 ${pr.auto ? "bg-cyan-500" : "bg-slate-300"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${pr.auto ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>

        <div className="mt-2">
          <label className="text-xs font-medium text-slate-500">Tipo de conexão</label>
          <select
            value={pr.conn}
            onChange={(e) => updPr("conn", e.target.value as PrinterConnection)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
          >
            <option value="rede">Rede / Wi-Fi (ESC/POS)</option>
            <option value="usb">USB</option>
            <option value="nuvem">Serviço em nuvem (PrintNode / QZ Tray)</option>
          </select>
        </div>

        {pr.conn === "rede" && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Wifi size={12} /> IP da impressora
              </label>
              <input
                value={pr.ip}
                onChange={(e) => updPr("ip", e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                placeholder="192.168.0.50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Porta</label>
              <input
                value={pr.port}
                onChange={(e) => updPr("port", e.target.value)}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
                placeholder="9100"
              />
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="text-xs font-medium text-slate-500">Modelo da impressora</label>
          <input
            value={pr.model}
            onChange={(e) => updPr("model", e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            placeholder="Ex: Epson TM-T20, Elgin i9"
          />
        </div>

        {prMsg && (
          <p className={`text-xs mt-2 ${prMsg.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {prMsg.t}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={testPrint}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl active:scale-95 transition text-sm"
          >
            Imprimir teste
          </button>
          <button
            onClick={savePr}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition text-sm"
          >
            Salvar
          </button>
        </div>
      </div>

      {/* Suporte */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
        <h2 className="font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
          <MessageCircle size={16} /> Suporte
        </h2>
        <p className="text-sm text-emerald-800/80 mb-3">
          Precisa de ajuda, tem dúvidas ou quer agendar manutenção? Fale com nosso time pelo
          WhatsApp.
        </p>
        <a
          href={waHref(restaurant.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} /> Falar com o suporte
        </a>
        <p className="text-[11px] text-emerald-700/60 mt-2 text-center">
          Número comercial a definir.
        </p>
      </div>
    </div>
  );
}
