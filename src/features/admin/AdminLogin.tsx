import { useState } from "react";
import { Shield } from "lucide-react";

export interface AdminLoginProps {
  onLogin: () => void;
}

/** Tela de acesso da administração da plataforma (credenciais de demo). */
export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState("admin@pedeai.com.br");
  const [pass, setPass] = useState("admin1234");

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3">
          <Shield size={30} className="text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">Acesso da plataforma</h1>
        <p className="text-slate-400 text-sm">Área restrita à administração do PedeAí</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500">E-mail</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Senha</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        <button
          onClick={onLogin}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition active:scale-95"
        >
          Entrar
        </button>
        <p className="text-xs text-slate-400 text-center">Credenciais de demo já preenchidas 👆</p>
      </div>
    </div>
  );
}
