import { supabase } from "../../lib/supabase.js";
import { notFound } from "../../lib/http-error.js";
import type { EstablishmentRow } from "../../types/db.js";

export async function listPublic(filters: { city?: string; neighborhood?: string }) {
  let q = supabase().from("establishments").select("*").eq("status", "ativo");
  if (filters.city) q = q.eq("city", filters.city);
  if (filters.neighborhood) q = q.eq("neighborhood", filters.neighborhood);
  const { data, error } = await q;
  if (error) throw error;
  return data as EstablishmentRow[];
}

export async function getPublic(id: string) {
  const { data } = await supabase()
    .from("establishments").select("*").eq("id", id).eq("status", "ativo").maybeSingle();
  if (!data) throw notFound("Estabelecimento não encontrado");
  return data as EstablishmentRow;
}

export async function getByOwner(ownerId: string) {
  const { data } = await supabase()
    .from("establishments").select("*").eq("owner_id", ownerId).maybeSingle();
  return (data as EstablishmentRow) ?? null;
}

export async function upsertForOwner(ownerId: string, input: Record<string, unknown>) {
  const existing = await getByOwner(ownerId);
  if (existing) {
    const { data, error } = await supabase()
      .from("establishments").update(input).eq("id", existing.id).select("*").single();
    if (error) throw error;
    return data as EstablishmentRow;
  }
  const { data, error } = await supabase()
    .from("establishments").insert({ ...input, owner_id: ownerId }).select("*").single();
  if (error) throw error;
  return data as EstablishmentRow;
}
