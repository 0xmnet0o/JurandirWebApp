import { supabase, supabaseAnon } from "../../lib/supabase.js";
import { badRequest } from "../../lib/http-error.js";

export async function register(email: string, password: string, name: string) {
  const { data, error } = await supabase().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw badRequest(error?.message ?? "Falha ao registrar");
  return { id: data.user.id, email: data.user.email };
}

export async function login(email: string, password: string) {
  // ponytail: anon client keeps the service-role singleton's session uncontaminated
  const { data, error } = await supabaseAnon().auth.signInWithPassword({ email, password });
  if (error) throw badRequest(error.message);
  return {
    access_token: data.session?.access_token,
    user: { id: data.user?.id, email: data.user?.email },
  };
}
