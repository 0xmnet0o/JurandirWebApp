import "dotenv/config";
import { supabase } from "../src/lib/supabase.js";

/**
 * Limpeza global após a suíte: remove os usuários de teste (e-mails
 * `@example.com`). Como `establishments.owner_id` e `profiles.id` referenciam
 * `auth.users` com `on delete cascade`, apagar o usuário remove em cascata seus
 * estabelecimentos, cardápios e pedidos. Os dados de seed (e-mails reais, ex.:
 * contato@quiosquedomar.com.br) são preservados.
 */
export async function teardown() {
  if (!process.env.SUPABASE_URL) return;
  const { data } = await supabase().auth.admin.listUsers({ perPage: 1000 });
  const testUsers = (data?.users ?? []).filter((u) => (u.email ?? "").endsWith("@example.com"));
  for (const u of testUsers) {
    await supabase().auth.admin.deleteUser(u.id);
  }
  if (testUsers.length) console.log(`teardown: removidos ${testUsers.length} usuários de teste`);
}
