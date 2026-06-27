import { useState, type ReactNode } from "react";
import {
  Clock,
  Flame,
  Globe,
  Instagram,
  LayoutDashboard,
  MapPin,
  Minus,
  MessageCircle,
  Percent,
  Phone,
  Plus,
  ShoppingCart,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Img } from "@/components/Img";
import { Gallery } from "@/components/Gallery";
import { CATS, CAT_EMOJI, catGrad, MEDAL } from "@/data/categories";
import { isPromo, money, pct } from "@/lib/format";
import type { CategoryName, MenuItem, Order, Restaurant } from "@/types";
import type { CartLine } from "./types";

export interface MenuProps {
  menu: MenuItem[];
  restaurant: Restaurant;
  orders: Order[];
  location: string;
  cart: CartLine[];
  count: number;
  total: number;
  add: (item: MenuItem) => void;
  dec: (id: number) => void;
  onCheckout: () => void;
  onMyOrders: () => void;
  myOrdersCount: number;
}

/** Cardápio navegável do cliente: destaques, busca, categorias e carrinho. */
export function Menu({
  menu,
  restaurant,
  orders,
  location,
  cart,
  count,
  total,
  add,
  dec,
  onCheckout,
  onMyOrders,
  myOrdersCount,
}: MenuProps) {
  const [cat, setCat] = useState<CategoryName>("Combos & Combinações");
  const [sub, setSub] = useState("Combos");
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  const items = menu.filter((i) => i.cat === cat && i.sub === sub);
  const promos = menu.filter(isPromo);
  const pickCat = (c: CategoryName) => {
    setCat(c);
    setSub(CATS[c][0]);
  };

  const searching = query.trim().length > 0;
  const results = searching
    ? menu.filter((i) => (i.name + " " + i.desc).toLowerCase().includes(query.trim().toLowerCase()))
    : [];
  const displayItems = searching ? results : items;

  const popMap: Record<string, number> = {};
  orders.forEach((o) =>
    o.items.forEach((it) => {
      popMap[it.name] = (popMap[it.name] || 0) + it.qty;
    }),
  );
  const popular = Object.entries(popMap)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => menu.find((m) => m.name === n))
    .filter((m): m is MenuItem => Boolean(m))
    .slice(0, 6);

  const QtyControl = ({ i }: { i: MenuItem }) => {
    const inCart = cart.find((c) => c.id === i.id);
    return inCart ? (
      <div className="flex items-center gap-2">
        <button
          onClick={() => dec(i.id)}
          aria-label="Remover um"
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center active:scale-90"
        >
          <Minus size={15} />
        </button>
        <span className="font-bold text-sm w-4 text-center">{inCart.qty}</span>
        <button
          onClick={() => add(i)}
          aria-label="Adicionar um"
          className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90"
        >
          <Plus size={15} />
        </button>
      </div>
    ) : (
      <button
        onClick={() => add(i)}
        className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1 active:scale-95 shadow-sm shadow-cyan-200"
      >
        <Plus size={15} /> Add
      </button>
    );
  };

  const MiniCard = ({ i, badge }: { i: MenuItem; badge?: ReactNode }) => (
    <div className="w-40 shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm">
      <div className="relative">
        <Img src={i.photo} emoji={i.emoji} gradient={catGrad(i.cat)} className="w-full h-24" />
        {badge}
      </div>
      <div className="p-2.5">
        <h3 className="font-semibold text-sm leading-tight truncate">{i.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div className="leading-none">
            {isPromo(i) && (
              <span className="text-slate-300 line-through text-[11px]">
                {money(i.oldPrice as number)}
              </span>
            )}
            <p className="font-extrabold text-cyan-600">{money(i.price)}</p>
          </div>
          <button
            onClick={() => add(i)}
            aria-label={`Adicionar ${i.name}`}
            className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center active:scale-90 shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto pb-28 bg-slate-100">
      <div className="relative">
        <Img
          src={restaurant.cover}
          emoji={restaurant.emoji}
          gradient="bg-gradient-to-br from-cyan-400 to-blue-600"
          className="w-full h-52"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        {restaurant.logo && (
          <div className="absolute top-3 left-3 w-12 h-12 rounded-xl bg-white/90 backdrop-blur shadow-lg overflow-hidden ring-2 ring-white/70">
            <img src={restaurant.logo} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h1 className="text-2xl font-extrabold leading-tight">{restaurant.name}</h1>
          <p className="text-white/90 text-sm">{restaurant.tagline}</p>
          <div className="flex flex-col gap-0.5 text-xs text-white/80 mt-2">
            <span className="flex items-center gap-1">
              <MapPin size={12} /> {restaurant.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {restaurant.hours}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 mt-2 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium">
            <MapPin size={11} /> {location}
          </span>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
          <button className="flex-1 py-2 rounded-lg text-sm font-medium bg-cyan-500 text-white flex items-center justify-center gap-1.5">
            <UtensilsCrossed size={15} /> Cardápio
          </button>
          <button
            onClick={onMyOrders}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5"
          >
            <LayoutDashboard size={15} /> Meus pedidos
            {myOrdersCount > 0 ? ` (${myOrdersCount})` : ""}
          </button>
        </div>
      </div>

      {!searching && popular.length > 0 && (
        <div className="pt-4">
          <h2 className="px-4 font-extrabold text-lg flex items-center gap-1.5 mb-2">
            <span>🏆</span> Os mais pedidos
          </h2>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2">
            {popular.map((i, k) => (
              <MiniCard
                key={i.id}
                i={i}
                badge={
                  <span className="absolute top-2 left-2 bg-amber-400 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    {MEDAL[k] || `#${k + 1}`}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}

      {!searching && promos.length > 0 && (
        <div className="pt-3">
          <h2 className="px-4 font-extrabold text-lg flex items-center gap-1.5 mb-2">
            <Flame size={20} className="text-red-500" /> Ofertas do dia
          </h2>
          <div className="flex gap-3 px-4 overflow-x-auto pb-2">
            {promos.map((i) => (
              <MiniCard
                key={i.id}
                i={i}
                badge={
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow">
                    -{pct(i)}%
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="sticky top-[44px] bg-slate-100 z-20 pt-3 pb-1">
        <div className="px-4 mb-2 relative">
          <span className="absolute left-7 top-1/2 -translate-y-1/2 text-sm">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar item no cardápio…"
            className="w-full pl-9 pr-9 py-2.5 rounded-full border border-slate-200 bg-white text-sm focus:border-cyan-500 outline-none"
          />
          {searching && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {!searching && (
          <>
            <div className="flex gap-2 px-4 overflow-x-auto">
              {(Object.keys(CATS) as CategoryName[]).map((c) => (
                <button
                  key={c}
                  onClick={() => pickCat(c)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}
                >
                  {CAT_EMOJI[c]} {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 px-4 py-3 overflow-x-auto">
              {CATS[cat].map((s) => (
                <button
                  key={s}
                  onClick={() => setSub(s)}
                  className={`px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition ${sub === s ? "bg-cyan-500 text-white font-medium" : "bg-white text-slate-500 border border-slate-200"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {searching && (
        <p className="px-4 mt-2 text-sm text-slate-500">
          {displayItems.length} resultado{displayItems.length !== 1 ? "s" : ""} para “{query.trim()}
          ”
        </p>
      )}
      <div className="px-4 space-y-4 mt-1">
        {searching && displayItems.length === 0 && (
          <p className="text-center text-slate-400 py-10 text-sm">Nenhum item encontrado.</p>
        )}
        {displayItems.map((i) => (
          <div key={i.id} className="bg-white rounded-3xl overflow-hidden shadow-sm">
            <div className="relative">
              <Gallery item={i} className="w-full h-44" />
              {isPromo(i) && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <Percent size={12} /> {pct(i)}% OFF
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-base leading-tight">{i.name}</h3>
              {i.measure && (
                <span className="inline-block mt-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {String(i.measure).replace(".", ",")} {i.unit}
                </span>
              )}
              <p className="text-slate-400 text-xs mt-1 leading-snug">{i.desc}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="leading-none">
                  {isPromo(i) && (
                    <span className="text-slate-300 line-through text-xs mr-1.5">
                      {money(i.oldPrice as number)}
                    </span>
                  )}
                  <span className="font-extrabold text-xl text-cyan-600">{money(i.price)}</span>
                </div>
                <QtyControl i={i} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!searching &&
        (restaurant.instagram || restaurant.phone || restaurant.whatsapp || restaurant.website) && (
          <div className="px-4 mt-4">
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <h2 className="font-extrabold text-base mb-3 flex items-center gap-1.5">
                📍 Fale com {restaurant.name}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {restaurant.whatsapp && (
                  <a
                    href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"
                  >
                    <MessageCircle size={16} className="shrink-0" /> WhatsApp
                  </a>
                )}
                {restaurant.instagram && (
                  <a
                    href={`https://instagram.com/${restaurant.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-pink-50 text-pink-600 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"
                  >
                    <Instagram size={16} className="shrink-0" />{" "}
                    <span className="truncate">{restaurant.instagram}</span>
                  </a>
                )}
                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone.replace(/\D/g, "")}`}
                    className="flex items-center gap-2 bg-slate-100 text-slate-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"
                  >
                    <Phone size={16} className="shrink-0" />{" "}
                    <span className="truncate">{restaurant.phone}</span>
                  </a>
                )}
                {restaurant.website && (
                  <a
                    href={
                      restaurant.website.startsWith("http")
                        ? restaurant.website
                        : `https://${restaurant.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-cyan-50 text-cyan-700 rounded-xl px-3 py-2.5 text-sm font-medium active:scale-95 transition"
                  >
                    <Globe size={16} className="shrink-0" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-slate-900 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg active:scale-95 transition"
          >
            <span className="flex items-center gap-2 font-semibold">
              <ShoppingCart size={18} /> {count} {count === 1 ? "item" : "itens"}
            </span>
            <span className="font-bold">{money(total)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Seu pedido</h2>
              <button onClick={() => setCartOpen(false)} aria-label="Fechar">
                <X size={22} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <Img
                    src={i.photo}
                    emoji={i.emoji}
                    gradient={catGrad(i.cat)}
                    className="w-12 h-12 rounded-xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{i.name}</p>
                    <p className="text-cyan-600 text-sm font-semibold">{money(i.price * i.qty)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dec(i.id)}
                      aria-label="Remover um"
                      className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">{i.qty}</span>
                    <button
                      onClick={() => add(i)}
                      aria-label="Adicionar um"
                      className="w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
              <span className="text-slate-500">Total</span>
              <span className="font-bold text-xl">{money(total)}</span>
            </div>
            <button
              onClick={() => {
                setCartOpen(false);
                onCheckout();
              }}
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3.5 rounded-xl transition active:scale-95"
            >
              Ir para o pagamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
