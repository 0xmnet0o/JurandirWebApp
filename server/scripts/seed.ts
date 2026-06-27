import "dotenv/config";
import { supabase } from "../src/lib/supabase.js";

const OWNER = { email: "contato@quiosquedomar.com.br", password: "demo1234", name: "Quiosque do Mar" };
const ADMIN = { email: "admin@pedeai.com.br", password: "admin1234", name: "Admin PedeAí" };

const RESTAURANT = {
  name: "Quiosque do Mar",
  slug: "quiosque-do-mar",
  tagline: "Drinks autorais, frutos do mar e pé na areia 🌊",
  description: "O melhor da Praia Brava: caipirinhas premiadas, porções generosas e açaí gelado.",
  address: "Av. Beira-Mar, 1200 — Praia Brava, Itajaí/SC",
  hours: "Todos os dias · 09h às 20h",
  fee_pct: 8,
  phone: "(47) 3344-5566",
  email: "contato@quiosquedomar.com.br",
  website: "www.quiosquedomar.com.br",
  whatsapp: "5547999990000",
  instagram: "@quiosquedomar",
  city: "Itajaí/SC",
  neighborhood: "Praia Brava",
  status: "ativo" as const,
};

const MENU = [
  { name: "Caipirinha de Limão", description: "Cachaça artesanal, limão e açúcar", price: 22, old_price: 28, emoji: "🍹", measure: 300, unit: "ml", cat: "Bebidas", sub: "Drinks" },
  { name: "Aperol Spritz", description: "Aperol, prosecco, água com gás e laranja", price: 28, old_price: 34, emoji: "🥂", measure: 300, unit: "ml", cat: "Bebidas", sub: "Drinks" },
  { name: "Heineken Long Neck", description: "Cerveja pilsen bem gelada", price: 12, emoji: "🍺", measure: 330, unit: "ml", cat: "Bebidas", sub: "Cervejas" },
  { name: "Água de Coco", description: "Coco verde natural", price: 10, emoji: "🥥", measure: 500, unit: "ml", cat: "Bebidas", sub: "Naturais" },
  { name: "Coca-Cola Lata", description: "Refrigerante gelado", price: 8, emoji: "🥤", measure: 350, unit: "ml", cat: "Bebidas", sub: "Refrigerantes" },
  { name: "Porção de Camarão", description: "Camarão empanado com molho tártaro", price: 68, old_price: 89, emoji: "🍤", measure: 300, unit: "g", cat: "Alimentos", sub: "Porções" },
  { name: "Batata Frita", description: "Batata rústica com cheddar e bacon", price: 38, emoji: "🍟", measure: 400, unit: "g", cat: "Alimentos", sub: "Porções" },
  { name: "Moqueca de Peixe", description: "Peixe fresco, leite de coco, arroz e pirão", price: 89, emoji: "🍲", measure: 700, unit: "g", cat: "Alimentos", sub: "Pratos" },
  { name: "Bowl de Açaí", description: "Açaí, granola, banana e mel", price: 28, old_price: 36, emoji: "🍇", measure: 500, unit: "ml", cat: "Alimentos", sub: "Saudáveis" },
  { name: "Petit Gâteau", description: "Bolo de chocolate com sorvete", price: 32, old_price: 38, emoji: "🍫", measure: 150, unit: "g", cat: "Sobremesas", sub: "Doces" },
];

async function ensureUser(email: string, password: string, name: string): Promise<string> {
  const { data, error } = await supabase().auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name },
  });
  if (data?.user) return data.user.id;
  const { data: list } = await supabase().auth.admin.listUsers();
  const found = list.users.find((u) => u.email === email);
  if (!found) throw new Error(`Falha ao criar/achar ${email}: ${error?.message}`);
  return found.id;
}

async function main() {
  console.log("Seed: usuários…");
  const ownerId = await ensureUser(OWNER.email, OWNER.password, OWNER.name);
  const adminId = await ensureUser(ADMIN.email, ADMIN.password, ADMIN.name);
  await supabase().from("profiles").update({ role: "admin" }).eq("id", adminId);

  console.log("Seed: estabelecimento…");
  const { data: existing } = await supabase()
    .from("establishments").select("id").eq("owner_id", ownerId).maybeSingle();
  let estId: string;
  if (existing) {
    estId = existing.id as string;
    await supabase().from("establishments").update(RESTAURANT).eq("id", estId);
  } else {
    const { data, error } = await supabase()
      .from("establishments").insert({ ...RESTAURANT, owner_id: ownerId }).select("id").single();
    if (error) throw error;
    estId = data.id as string;
  }

  console.log("Seed: cardápio…");
  const { count } = await supabase()
    .from("menu_items").select("id", { count: "exact", head: true }).eq("establishment_id", estId);
  if (!count) {
    const { error } = await supabase()
      .from("menu_items").insert(MENU.map((m) => ({ ...m, establishment_id: estId })));
    if (error) throw error;
    console.log(`Seed: ${MENU.length} itens inseridos.`);
  } else {
    console.log(`Seed: cardápio já tem ${count} itens — pulando.`);
  }

  console.log(`Seed OK. establishment_id=${estId}`);
  console.log(`Login dono: ${OWNER.email} / ${OWNER.password}`);
  console.log(`Login admin: ${ADMIN.email} / ${ADMIN.password}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
