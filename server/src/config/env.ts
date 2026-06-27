import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

export function parseEnv(raw: NodeJS.ProcessEnv | Record<string, string | undefined>): Env {
  return schema.parse(raw);
}

// ponytail: lazy init so importing this module in tests never throws when SUPABASE_* are unset
let _env: Env | null = null;
export function getEnv(): Env {
  if (!_env) _env = parseEnv(process.env);
  return _env;
}
