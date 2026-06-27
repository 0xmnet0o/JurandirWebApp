import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import {
  Camera,
  Check,
  Clock,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";
import { Img } from "@/components/Img";
import type { Restaurant } from "@/types";

export interface PerfilProps {
  restaurant: Restaurant;
  setRestaurant: Dispatch<SetStateAction<Restaurant>>;
}

/** Edição do perfil público do estabelecimento (capa, logo, contato e redes). */
export function Perfil({ restaurant, setRestaurant }: PerfilProps) {
  const [f, setF] = useState<Restaurant>(restaurant);
  const [saved, setSaved] = useState(false);

  const upd = <K extends keyof Restaurant>(k: K, v: Restaurant[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const onImage = (key: "cover" | "logo") => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => upd(key, typeof r.result === "string" ? r.result : "");
    r.readAsDataURL(file);
  };

  const save = () => {
    setRestaurant(f);
    setSaved(true);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-slate-600 mb-3">Como o cliente vê seu cardápio</h2>
        <div className="relative rounded-2xl overflow-hidden">
          <Img
            src={f.cover}
            emoji={f.emoji}
            gradient="bg-gradient-to-br from-cyan-400 to-blue-600"
            className="w-full h-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          {f.logo && (
            <div className="absolute top-3 left-3 w-14 h-14 rounded-2xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70">
              <img src={f.logo} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="absolute bottom-0 p-4 text-white">
            <h3 className="text-xl font-extrabold">{f.name || "Nome do local"}</h3>
            <p className="text-white/90 text-xs">{f.tagline}</p>
            <div className="text-[11px] text-white/80 mt-1 space-y-0.5">
              <p className="flex items-center gap-1">
                <MapPin size={11} /> {f.address}
              </p>
              <p className="flex items-center gap-1">
                <Clock size={11} /> {f.hours}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Camera size={16} /> Foto do local
            <input type="file" accept="image/*" onChange={onImage("cover")} className="hidden" />
          </label>
          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Store size={16} /> Logo
            <input type="file" accept="image/*" onChange={onImage("logo")} className="hidden" />
          </label>
        </div>
        {f.logo && (
          <button
            onClick={() => upd("logo", "")}
            className="text-[11px] text-slate-400 underline mt-2"
          >
            remover logo
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Nome do estabelecimento</label>
          <input
            value={f.name}
            onChange={(e) => upd("name", e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Frase de destaque</label>
          <input
            value={f.tagline}
            onChange={(e) => upd("tagline", e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
            placeholder="Ex: Drinks autorais e pé na areia 🌊"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Descrição</label>
          <textarea
            value={f.desc}
            onChange={(e) => upd("desc", e.target.value)}
            rows={3}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Endereço</label>
          <input
            value={f.address}
            onChange={(e) => upd("address", e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Horário de atendimento</label>
          <input
            value={f.hours}
            onChange={(e) => upd("hours", e.target.value)}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-cyan-500 outline-none"
          />
        </div>

        <div className="pt-2 mt-1 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Contato e redes
          </p>
          <div className="space-y-3">
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
                placeholder="contato@seurestaurante.com.br"
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
                placeholder="www.seurestaurante.com.br"
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
                placeholder="@seurestaurante"
              />
            </div>
          </div>
        </div>

        <button
          onClick={save}
          className={`w-full font-semibold py-3 rounded-xl active:scale-95 transition flex items-center justify-center gap-2 ${saved ? "bg-emerald-500 text-white" : "bg-cyan-500 hover:bg-cyan-600 text-white"}`}
        >
          {saved ? (
            <>
              <Check size={18} /> Perfil salvo!
            </>
          ) : (
            "Salvar perfil"
          )}
        </button>
        <p className="text-xs text-slate-400 text-center">
          As mudanças aparecem na hora no cardápio do cliente (acessível pelo site, ao abrir o
          estabelecimento).
        </p>
      </div>
    </div>
  );
}
