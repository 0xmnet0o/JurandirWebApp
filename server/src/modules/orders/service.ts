import { supabase } from "../../lib/supabase.js";
import { computeTotals, type LineItem } from "../../domain/money.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import type { OrderRow } from "../../types/db.js";

interface CreateInput {
  location?: string;
  customer_name?: string;
  note?: string;
  items: LineItem[];
  splits?: { method: string | null; amount: number; position: number }[];
}

export async function createPublic(establishmentId: string, input: CreateInput) {
  const { data: est } = await supabase()
    .from("establishments").select("id, fee_pct, status").eq("id", establishmentId).maybeSingle();
  if (!est || est.status !== "ativo") throw notFound("Estabelecimento indisponível");

  const { total, fee } = computeTotals(input.items, Number(est.fee_pct));
  const { data: seq } = await supabase().rpc("next_display_seq", { p_estab: establishmentId });
  const fullyPaid = !input.splits || input.splits.every((s) => s.method);

  const { data: order, error } = await supabase()
    .from("orders")
    .insert({
      establishment_id: establishmentId,
      display_seq: seq as number,
      location: input.location ?? "",
      customer_name: input.customer_name ?? null,
      note: input.note ?? null,
      total,
      fee,
      fee_pct: Number(est.fee_pct),
      status: fullyPaid ? "producao" : "aguardando",
    })
    .select("*").single();
  if (error) throw error;

  await supabase().from("order_items").insert(
    input.items.map((i) => ({ order_id: order.id, name: i.name, qty: i.qty, price: i.price })),
  );
  if (input.splits?.length) {
    await supabase().from("order_splits").insert(input.splits.map((s) => ({ order_id: order.id, ...s })));
  }
  return order as OrderRow;
}

async function assertOwnsOrder(ownerId: string, orderId: string): Promise<OrderRow> {
  const { data: order } = await supabase().from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) throw notFound("Pedido não encontrado");
  const { data: est } = await supabase()
    .from("establishments").select("owner_id").eq("id", order.establishment_id).maybeSingle();
  if (!est || est.owner_id !== ownerId) throw forbidden();
  return order as OrderRow;
}

export async function listByOwner(ownerId: string, status?: string) {
  const { data: est } = await supabase().from("establishments").select("id").eq("owner_id", ownerId).maybeSingle();
  if (!est) return [];
  let q = supabase()
    .from("orders").select("*, order_items(*), order_splits(*)")
    .eq("establishment_id", est.id).order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function updateStatus(ownerId: string, orderId: string, status: string) {
  await assertOwnsOrder(ownerId, orderId);
  const { data, error } = await supabase().from("orders").update({ status }).eq("id", orderId).select("*").single();
  if (error) throw error;
  return data as OrderRow;
}

export async function payShare(ownerId: string, orderId: string, position: number, method: string) {
  await assertOwnsOrder(ownerId, orderId);
  await supabase().from("order_splits").update({ method }).eq("order_id", orderId).eq("position", position);
  const { data: splits } = await supabase().from("order_splits").select("method").eq("order_id", orderId);
  const allPaid = (splits ?? []).every((s) => s.method);
  if (allPaid) await supabase().from("orders").update({ status: "producao" }).eq("id", orderId);
  return { allPaid };
}
