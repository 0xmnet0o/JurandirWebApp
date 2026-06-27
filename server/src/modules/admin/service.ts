import { supabase } from "../../lib/supabase.js";
import { notFound } from "../../lib/http-error.js";

export async function listAll() {
  const { data, error } = await supabase().from("establishments").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function patchEstablishment(id: string, patch: { fee_pct?: number; status?: string }) {
  const { data, error } = await supabase().from("establishments").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Estabelecimento não encontrado");
  return data;
}

export async function stats() {
  const { data: orders, error } = await supabase().from("orders").select("total, fee, status").neq("status", "aguardando");
  if (error) throw error;
  const list = orders ?? [];
  const gmv = list.reduce((s, o) => s + Number(o.total), 0);
  const feeRevenue = list.reduce((s, o) => s + Number(o.fee), 0);
  const count = list.length;
  return {
    gmv: Math.round(gmv * 100) / 100,
    feeRevenue: Math.round(feeRevenue * 100) / 100,
    orders: count,
    ticketMedio: count ? Math.round((gmv / count) * 100) / 100 : 0,
  };
}
