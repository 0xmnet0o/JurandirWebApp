import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
import type { Establishment, MenuItem, NewOrder, Order, Restaurant } from "@/types";

/** Estado e ações globais compartilhados entre as áreas do app. */
export interface AppStore {
  menu: MenuItem[];
  setMenu: Dispatch<SetStateAction<MenuItem[]>>;

  orders: Order[];
  setOrders: Dispatch<SetStateAction<Order[]>>;
  /** Cria um pedido (atribui id e timestamp) e retorna o id gerado. */
  addOrder: (order: NewOrder) => number;

  restaurant: Restaurant;
  setRestaurant: Dispatch<SetStateAction<Restaurant>>;

  establishments: Establishment[];
  setEstablishments: Dispatch<SetStateAction<Establishment[]>>;
}

export const AppStoreContext = createContext<AppStore | null>(null);

/** Acessa o store global. Lança se usado fora do provider. */
export function useStore(): AppStore {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useStore deve ser usado dentro de <AppStoreProvider>");
  return ctx;
}
