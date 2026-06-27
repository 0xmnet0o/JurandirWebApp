import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  MessageCircle,
  QrCode,
  Settings,
  Store,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Img } from "@/components/Img";
import { useStore } from "@/store/context";
import { waHref } from "@/lib/format";
import { Login } from "./Login";
import { Pedidos } from "./Pedidos";
import { Cardapio } from "./Cardapio";
import { QRCodes } from "./QRCodes";
import { Kpis } from "./Kpis";
import { Perfil } from "./Perfil";
import { Configuracoes } from "./Configuracoes";

type RestaurantTab = "pedidos" | "cardapio" | "qrcodes" | "kpis" | "perfil" | "config";

const TABS: { id: RestaurantTab; label: string; icon: LucideIcon }[] = [
  { id: "pedidos", label: "Pedidos", icon: LayoutDashboard },
  { id: "cardapio", label: "Cardápio", icon: UtensilsCrossed },
  { id: "qrcodes", label: "QR Codes", icon: QrCode },
  { id: "kpis", label: "KPIs", icon: TrendingUp },
  { id: "perfil", label: "Perfil", icon: Store },
  { id: "config", label: "Config", icon: Settings },
];

/** Painel do estabelecimento: gerencia pedidos, cardápio, QR codes, KPIs e perfil. */
export function Restaurante() {
  const { menu, setMenu, orders, setOrders, restaurant, setRestaurant } = useStore();
  const [logged, setLogged] = useState(false);
  const [tab, setTab] = useState<RestaurantTab>("pedidos");

  if (!logged) return <Login restaurant={restaurant} onLogin={() => setLogged(true)} />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <Img
            src={restaurant.logo || restaurant.cover}
            emoji={restaurant.emoji}
            className="w-11 h-11 rounded-xl shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight truncate">{restaurant.name}</h1>
            <p className="text-slate-400 text-xs">Painel do estabelecimento</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={waHref(restaurant.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 text-sm flex items-center gap-1 font-medium"
          >
            <MessageCircle size={16} /> <span className="hidden sm:inline">Suporte</span>
          </a>
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

      {tab === "pedidos" && (
        <Pedidos orders={orders} setOrders={setOrders} restaurant={restaurant} />
      )}
      {tab === "cardapio" && <Cardapio menu={menu} setMenu={setMenu} />}
      {tab === "qrcodes" && <QRCodes restaurant={restaurant} />}
      {tab === "kpis" && <Kpis orders={orders} menu={menu} />}
      {tab === "perfil" && <Perfil restaurant={restaurant} setRestaurant={setRestaurant} />}
      {tab === "config" && <Configuracoes restaurant={restaurant} />}
    </div>
  );
}
