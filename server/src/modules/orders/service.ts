import { supabase } from "../../lib/supabase.js";
import { computeTotals, type LineItem } from "../../domain/money.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";
import type { OrderRow } from "../../types/db.js";

interface CreateInput {
  location?: string;
  customer_name?: string;
  note?: string;
  items: { menu_item_id: string; qty: number }[];
  splits?: { method: string | null; amount: number; position: number }[];
}

export async function createPublic(establishmentId: string, input: CreateInput) {
  const { data: est } = await supabase()
    .from("establishments").select("id, fee_pct, status").eq("id", establishmentId).maybeSingle();
  if (!est || est.status !== "ativo") throw notFound("Estabelecimento indisponível");

  // Preço e nome AUTORITATIVOS do banco — nunca confiar em valores enviados pelo
  // cliente (o endpoint é público/anônimo). Itens são resolvidos por id, escopados
  // ao estabelecimento; qualquer id inexistente ou de outro estabelecimento é rejeitado.
  const ids = [...new Set(input.items.map((i) => i.menu_item_id))];
  const { data: menuRows, error: menuErr } = await supabase()
    .from("menu_items").select("id, name, price").eq("establishment_id", establishmentId).in("id", ids);
  if (menuErr) throw menuErr;
  const byId = new Map((menuRows ?? []).map((m) => [m.id as string, m]));
  if (byId.size !== ids.length) throw badRequest("Item inexistente ou de outro estabelecimento");

  const lineItems: LineItem[] = input.items.map((i) => {
    const m = byId.get(i.menu_item_id)!;
    return { name: m.name as string, qty: i.qty, price: Number(m.price) };
  });

  const { total, fee } = computeTotals(lineItems, Number(est.fee_pct));
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
    lineItems.map((i) => ({ order_id: order.id, name: i.name, qty: i.qty, price: i.price })),
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

export async function getPublicOrder(orderId: string) {
  // Endpoint público (acesso por UUID): NÃO retorna PII (customer_name) nem a
  // observação livre (note, que pode conter dado sensível). Apenas o necessário
  // para o cliente acompanhar o pedido.
  const { data, error } = await supabase()
    .from("orders")
    .select("id, establishment_id, display_seq, location, status, total, fee, fee_pct, created_at, order_items(*), order_splits(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Pedido não encontrado");
  return data;
}
