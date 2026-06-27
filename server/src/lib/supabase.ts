import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "../config/env.js";

let _client: SupabaseClient | null = null;
let _anonClient: SupabaseClient | null = null;

/** Client service-role criado sob demanda (bypassa RLS). Não constrói nada no import. */
export function supabase(): SupabaseClient {
  if (!_client) {
    const env = getEnv();
    _client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _client;
}

/**
 * Client anon usado APENAS para signInWithPassword.
 * ponytail: singleton separado para evitar que signInWithPassword mute a sessão
 * interna do client service-role e faça queries subsequentes usarem o JWT do usuário.
 */
export function supabaseAnon(): SupabaseClient {
  if (!_anonClient) {
    const env = getEnv();
    _anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _anonClient;
}

/** Resolve o usuário a partir de um JWT do Supabase; null se inválido. */
export async function getUserFromToken(token: string) {
  const { data, error } = await supabase().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
