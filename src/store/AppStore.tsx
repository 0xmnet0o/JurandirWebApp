import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { INITIAL_MENU } from "@/data/menu";
import { INITIAL_RESTAURANT } from "@/data/restaurant";
import { seedEstablishments, seedOrders } from "@/data/seeds";
import { loadPersisted, savePersisted } from "@/lib/storage";
import type { Establishment, MenuItem, NewOrder, Order, Restaurant } from "@/types";
import { AppStoreContext, type AppStore } from "./context";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // Carrega o estado salvo (uma única vez) e usa como valor inicial; cai nos
  // dados-semente quando não há nada persistido.
  const [persisted] = useState(loadPersisted);

  const [menu, setMenu] = useState<MenuItem[]>(() => persisted?.menu ?? INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>(() => persisted?.orders ?? seedOrders());
  const [orderSeq, setOrderSeq] = useState(() => persisted?.orderSeq ?? 12);
  const [restaurant, setRestaurant] = useState<Restaurant>(
    () => persisted?.restaurant ?? INITIAL_RESTAURANT,
  );
  const [establishments, setEstablishments] = useState<Establishment[]>(
    () =>
      persisted?.establishments ?? seedEstablishments(seedOrders(), INITIAL_RESTAURANT.platformFee),
  );

  // Persiste qualquer mudança no estado global.
  useEffect(() => {
    savePersisted({ menu, orders, restaurant, establishments, orderSeq });
  }, [menu, orders, restaurant, establishments, orderSeq]);

  const addOrder = useCallback(
    (order: NewOrder): number => {
      const id = orderSeq;
      setOrders((prev) => [
        { ...order, id, status: order.status ?? "producao", ts: new Date() },
        ...prev,
      ]);
      setOrderSeq((s) => s + 1);
      return id;
    },
    [orderSeq],
  );

  const value = useMemo<AppStore>(
    () => ({
      menu,
      setMenu,
      orders,
      setOrders,
      addOrder,
      restaurant,
      setRestaurant,
      establishments,
      setEstablishments,
    }),
    [menu, orders, addOrder, restaurant, establishments],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}
