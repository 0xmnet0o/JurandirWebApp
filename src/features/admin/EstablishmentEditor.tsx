import { useState } from "react";
import { Globe, Instagram, Lock, Mail, MessageCircle, Phone, User, X } from "lucide-react";
import type { EstablishmentForm, EstablishmentPlan } from "@/types";

export interface EstablishmentEditorProps {
  initial: EstablishmentForm;
  onSave: (form: EstablishmentForm) => void;
  onClose: () => void;
}

/** Modal de cadastro/edição de um estabelecimento da plataforma. */
export function EstablishmentEditor({ initial, onSave, onClose }: EstablishmentEditorProps) {
  const [f, setF] = useState<EstablishmentForm>(initial);
  const upd = <K extends keyof EstablishmentForm>(k: K, v: EstablishmentForm[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const passwordTooShort = f.password.length > 0 && f.password.length < 6;
  const valid = f.name && f.owner && f.user && f.password && f.password.length >= 6;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">
            {f.id ? "Editar estabelecimento" : "Novo estabelecimento"}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        <label className="text-xs font-medium text-slate-500">Nome do estabelecimento</label>
        <input
          value={f.name}
          onChange={(e) => upd("name", e.target.value)}
          className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          placeholder="Ex: Quiosque do Sol"
        />

        <label className="text-xs font-medium text-slate-500">Responsável</label>
        <input
          value={f.owner}
          onChange={(e) => upd("owner", e.target.value)}
          className="w-full mt-1 mb-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          placeholder="Nome do dono"
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Cidade / UF</label>
            <input
              value={f.city}
              onChange={(e) => upd("city", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="Ex: Maringá/PR"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Bairro</label>
            <input
              value={f.neighborhood}
              onChange={(e) => upd("neighborhood", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="Ex: Zona 7"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Plano</label>
            <select
              value={f.plan}
              onChange={(e) => upd("plan", e.target.value as EstablishmentPlan)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
            >
              <option>Básico</option>
              <option>Pro</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Fee (%)</label>
            <input
              value={f.feePct}
              onChange={(e) => upd("feePct", e.target.value.replace(/[^0-9.,]/g, ""))}
              inputMode="decimal"
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Acesso do estabelecimento
        </p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <User size={12} className="text-cyan-500" /> Usuário (login)
            </label>
            <input
              value={f.user}
              onChange={(e) => upd("user", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="e-mail ou nome de usuário"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Lock size={12} className="text-cyan-500" /> Senha
            </label>
            <input
              type="password"
              value={f.password}
              onChange={(e) => upd("password", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="mínimo 6 caracteres"
            />
          </div>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Contato e redes
        </p>
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Phone size={12} className="text-cyan-500" /> Telefone
            </label>
            <input
              value={f.phone}
              onChange={(e) => upd("phone", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="(00) 0000-0000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Mail size={12} className="text-cyan-500" /> E-mail
            </label>
            <input
              value={f.email}
              onChange={(e) => upd("email", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="contato@estabelecimento.com.br"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Globe size={12} className="text-cyan-500" /> Website
            </label>
            <input
              value={f.website}
              onChange={(e) => upd("website", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="www.estabelecimento.com.br"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <MessageCircle size={12} className="text-emerald-500" /> WhatsApp
            </label>
            <input
              value={f.whatsapp}
              onChange={(e) => upd("whatsapp", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="5547999990000"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Instagram size={12} className="text-pink-500" /> Instagram
            </label>
            <input
              value={f.instagram}
              onChange={(e) => upd("instagram", e.target.value)}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
              placeholder="@estabelecimento"
            />
          </div>
        </div>

        {passwordTooShort && (
          <p className="text-[11px] text-rose-600 mb-2">
            A senha precisa ter ao menos 6 caracteres.
          </p>
        )}
        <button
          disabled={!valid}
          onClick={() => onSave(f)}
          className="w-full bg-cyan-500 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl active:scale-95"
        >
          {f.id ? "Salvar alterações" : "Cadastrar estabelecimento"}
        </button>
      </div>
    </div>
  );
}
