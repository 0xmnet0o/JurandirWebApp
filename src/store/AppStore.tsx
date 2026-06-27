import { useCallback, useMemo, useState, type ReactNode } from "react";
import { INITIAL_MENU } from "@/data/menu";
import { INITIAL_RESTAURANT } from "@/data/restaurant";
import { seedEstablishments, seedOrders } from "@/data/seeds";
import type { Establishment, MenuItem, NewOrder, Order, Restaurant } from "@/types";
import { AppStoreContext, type AppStore } from "./context";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [orderSeq, setOrderSeq] = useState(12);
  const [restaurant, setRestaurant] = useState<Restaurant>(INITIAL_RESTAURANT);
  const [establishments, setEstablishments] = useState<Establishment[]>(() =>
    seedEstablishments(seedOrders(), INITIAL_RESTAURANT.platformFee),
  );

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
