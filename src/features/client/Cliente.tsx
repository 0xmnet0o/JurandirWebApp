import { useState } from "react";
import { useStore } from "@/store/context";
import { generateOrderCode } from "@/lib/orderCode";
import type { MenuItem, Order, Payment, Split } from "@/types";
import type { ClientStart } from "@/App";
import type { CartLine, ClientStep } from "./types";
import { QrLanding } from "./QrLanding";
import { Menu } from "./Menu";
import { Checkout } from "./Checkout";
import { OrderDone } from "./OrderDone";
import { MyOrders } from "./MyOrders";

export interface ClienteProps {
  start: ClientStart;
}

/** Local fixo simulado da leitura do QR Code nesta demo. */
const LOCATION = "Guarda-sol nº 14";

/**
 * Orquestra a jornada do cliente: QR → cardápio → checkout → confirmação →
 * "meus pedidos". Mantém o carrinho e os pedidos feitos nesta visita.
 */
export function Cliente({ start }: ClienteProps) {
  const { menu, restaurant, orders, setOrders, addOrder } = useStore();

  const [step, setStep] = useState<ClientStep>(start);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [note, setNote] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [myOrderIds, setMyOrderIds] = useState<number[]>([]);

  const myOrders = orders.filter((o) => myOrderIds.includes(o.id));

  const add = (item: MenuItem) =>
    setCart((c) => {
      const ex = c.find((i) => i.id === item.id);
      return ex
        ? c.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...item, qty: 1 }];
    });

  const dec = (id: number) =>
    setCart((c) =>
      c.flatMap((i) => (i.id === id ? (i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []) : [i])),
    );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const feePct = restaurant.platformFee || 0;
  const fee = +((total * feePct) / 100).toFixed(2);

  const finish = (payment: Payment, splits?: Split[]) => {
    const fullyPaid = !splits || splits.every((s) => s.method);
    const order: Order = {
      id: 0, // substituído por addOrder
      code: generateOrderCode(),
      ts: new Date(),
      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      total,
      fee,
      feePct,
      payment,
      splits,
      note: note.trim() || undefined,
      customerName: customerName.trim() || undefined,
      location: LOCATION,
      status: fullyPaid ? "producao" : "aguardando",
    };
    const id = addOrder(order);
    setMyOrderIds((ids) => [id, ...ids]);
    setLastOrder({ ...order, id });
    setCart([]);
    setNote("");
    setStep("done");
  };

  const payShare = (orderId: number, idx: number, method: Payment) => {
    setOrders((list) =>
      list.map((o) => {
        if (o.id !== orderId || !o.splits) return o;
        const splits = o.splits.map((s, i) => (i === idx ? { ...s, method } : s));
        const allPaid = splits.every((s) => s.method);
        const nPaid = splits.filter((s) => s.method).length;
        return {
          ...o,
          splits,
          status: allPaid ? "producao" : o.status,
          payment: {
            ...o.payment,
            label: allPaid
              ? `Dividido · ${splits.length} pessoas`
              : `Dividido · ${nPaid}/${splits.length} pagos`,
          },
        };
      }),
    );
  };

  if (step === "qr") {
    return (
      <QrLanding
        restaurant={restaurant}
        location={LOCATION}
        customerName={customerName}
        setCustomerName={setCustomerName}
        onScan={() => setStep("menu")}
      />
    );
  }
  if (step === "checkout") {
    return (
      <Checkout
        cart={cart}
        total={total}
        fee={fee}
        feePct={feePct}
        note={note}
        setNote={setNote}
        menu={menu}
        location={LOCATION}
        add={add}
        onBack={() => setStep("menu")}
        onPay={finish}
      />
    );
  }
  if (step === "done" && lastOrder) {
    return (
      <OrderDone
        order={lastOrder}
        onNew={() => setStep("menu")}
        onMyOrders={() => setStep("myorders")}
      />
    );
  }
  if (step === "myorders") {
    return (
      <MyOrders
        myOrders={myOrders}
        restaurant={restaurant}
        payShare={payShare}
        onBack={() => setStep("menu")}
      />
    );
  }

  return (
    <Menu
      menu={menu}
      restaurant={restaurant}
      orders={orders}
      location={LOCATION}
      cart={cart}
      count={count}
      total={total}
      add={add}
      dec={dec}
      onCheckout={() => setStep("checkout")}
      onMyOrders={() => setStep("myorders")}
      myOrdersCount={myOrders.length}
    />
  );
}
