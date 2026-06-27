import { useState } from "react";
import type { Restaurant } from "@/types";

export interface LoginProps {
  restaurant: Restaurant;
  onLogin: () => void;
}

/** Tela de acesso do estabelecimento (credenciais de demo pré-preenchidas). */
export function Login({ restaurant, onLogin }: LoginProps) {
  const [email, setEmail] = useState("contato@quiosquedomar.com.br");
  const [pass, setPass] = useState("demo1234");

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{restaurant.emoji}</div>
        <h1 className="text-2xl font-bold">Acesso do estabelecimento</h1>
        <p className="text-slate-400 text-sm">Entre para gerenciar seu cardápio e pedidos</p>
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
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-xl transition active:scale-95"
        >
          Entrar
        </button>
        <p className="text-xs text-slate-400 text-center">Credenciais de demo já preenchidas 👆</p>
      </div>
    </div>
  );
}
