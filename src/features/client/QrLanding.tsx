import { MapPin, QrCode, User } from "lucide-react";
import { Img } from "@/components/Img";
import type { Restaurant } from "@/types";

export interface QrLandingProps {
  restaurant: Restaurant;
  location: string;
  customerName: string;
  setCustomerName: (name: string) => void;
  onScan: () => void;
}

/** Tela de entrada simulando a leitura do QR Code no guarda-sol/mesa. */
export function QrLanding({
  restaurant,
  location,
  customerName,
  setCustomerName,
  onScan,
}: QrLandingProps) {
  return (
    <div className="max-w-md mx-auto px-6 py-10 text-center">
      <div className="rounded-3xl overflow-hidden shadow-xl relative">
        <Img
          src={restaurant.cover}
          emoji={restaurant.emoji}
          gradient="bg-gradient-to-br from-cyan-400 to-blue-600"
          className="w-full h-44"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {restaurant.logo && (
          <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70">
            <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 p-5 text-white text-left">
          <h1 className="text-2xl font-extrabold">{restaurant.name}</h1>
          <p className="text-white/85 text-sm">{restaurant.tagline}</p>
        </div>
      </div>

      <div className="mt-7 bg-white rounded-2xl p-7 shadow-sm">
        <div className="inline-block p-5 bg-slate-900 rounded-2xl mb-4">
          <QrCode size={100} className="text-white" />
        </div>
        <p className="text-slate-500 text-sm mb-1">Você está no</p>
        <p className="font-bold text-lg flex items-center justify-center gap-1.5">
          <MapPin size={18} className="text-cyan-500" /> {location}
        </p>

        <div className="mt-5 text-left">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <User size={13} className="text-cyan-500" /> Seu nome{" "}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            maxLength={40}
            placeholder="Como podemos te chamar?"
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            Ajuda o garçom a te encontrar na areia 🏖️
          </p>
        </div>

        <button
          onClick={onScan}
          className="mt-5 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95"
        >
          Ver cardápio e pedir
        </button>
        <p className="text-xs text-slate-400 mt-3">
          Simulando a leitura do QR Code no guarda-sol 👆
        </p>
      </div>
    </div>
  );
}
