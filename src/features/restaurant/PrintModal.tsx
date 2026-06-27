import { Printer } from "lucide-react";
import { money } from "@/lib/format";
import type { Order } from "@/types";

export interface PrintModalProps {
  order: Order;
  restaurantName: string;
  onClose: () => void;
}

/** Pré-visualização da via de cozinha enviada à impressora térmica. */
export function PrintModal({ order, restaurantName, onClose }: PrintModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-5 w-full max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
          <Printer size={18} /> Enviado para impressora · Cozinha
        </div>
        <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs leading-relaxed border border-dashed border-slate-300">
          <div className="text-center font-bold uppercase">{restaurantName}</div>
          <div className="text-center text-slate-400 mb-2">--- VIA COZINHA ---</div>
          <div>Pedido: #{String(order.id).padStart(3, "0")}</div>
          <div>Local: {order.location}</div>
          {order.customerName && <div>Cliente: {order.customerName}</div>}
          <div>{order.ts.toLocaleString("pt-BR")}</div>
          <div className="border-t border-dashed border-slate-300 my-2" />
          {order.items.map((i, k) => (
            <div key={k} className="flex justify-between">
              <span>
                {i.qty}x {i.name}
              </span>
            </div>
          ))}
          {order.note && (
            <>
              <div className="border-t border-dashed border-slate-300 my-2" />
              <div className="font-bold">** OBSERVACAO **</div>
              <div>{order.note}</div>
            </>
          )}
          <div className="border-t border-dashed border-slate-300 my-2" />
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{money(order.total)}</span>
          </div>
          <div>Pgto: {order.payment.label} (PAGO)</div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Em produção, isto seria enviado via ESC/POS para a impressora térmica do caixa/cozinha.
        </p>
        <button
          onClick={onClose}
          className="mt-3 w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium active:scale-95"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
