import { supabase } from "../../lib/supabase.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import type { MenuItemRow } from "../../types/db.js";

async function ownerEstablishmentId(ownerId: string): Promise<string> {
  const { data } = await supabase().from("establishments").select("id").eq("owner_id", ownerId).maybeSingle();
  if (!data) throw forbidden("Sem estabelecimento");
  return data.id as string;
}

export async function listByOwner(ownerId: string) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabase().from("menu_items").select("*").eq("establishment_id", estId);
  if (error) throw error;
  return data as MenuItemRow[];
}

export async function listPublic(estId: string) {
  const { data, error } = await supabase().from("menu_items").select("*").eq("establishment_id", estId);
  if (error) throw error;
  return data as MenuItemRow[];
}

export async function create(ownerId: string, input: Record<string, unknown>) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabase().from("menu_items").insert({ ...input, establishment_id: estId }).select("*").single();
  if (error) throw error;
  return data as MenuItemRow;
}

export async function update(ownerId: string, id: string, input: Record<string, unknown>) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabase().from("menu_items").update(input).eq("id", id).eq("establishment_id", estId).select("*").maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Item não encontrado");
  return data as MenuItemRow;
}

export async function remove(ownerId: string, id: string) {
  const estId = await ownerEstablishmentId(ownerId);
  const { error, count } = await supabase().from("menu_items").delete({ count: "exact" }).eq("id", id).eq("establishment_id", estId);
  if (error) throw error;
  if (!count) throw notFound("Item não encontrado");
}
