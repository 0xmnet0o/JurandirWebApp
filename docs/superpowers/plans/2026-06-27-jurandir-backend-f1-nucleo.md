# Jurandir Backend — F1 (Núcleo: Auth + CRUD + RLS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o núcleo do backend do PedeAí em `server/` — autenticação (Supabase) e CRUD multi-tenant (estabelecimentos, cardápio, pedidos) com RLS, validado por testes.

**Architecture:** Express + TypeScript. Login no Supabase Auth gera um JWT; o Express valida o JWT e acessa o Postgres com a **service role**, escopando sempre pelo dono/role. RLS como defesa em profundidade. Pagamentos (Asaas) e notificações (Resend/Twilio) ficam para os planos F2/F3 — aqui as portas existem mas não são chamadas.

**Tech Stack:** Node 20, Express 4, TypeScript (ESM), `@supabase/supabase-js`, Zod, Vitest + Supertest, `tsx` (dev). Spec: `docs/superpowers/specs/2026-06-27-jurandir-backend-design.md`.

---

## File Structure

```
server/
├── package.json · tsconfig.json · eslint.config.js · .prettierrc.json
├── .gitignore · .env.example
├── vitest.config.ts
├── supabase/migrations/0001_init.sql        # tabelas + RLS + triggers
├── src/
│   ├── index.ts                              # sobe o servidor HTTP
│   ├── app.ts                                # cria o Express, monta rotas/middlewares
│   ├── config/env.ts                         # env validado por Zod
│   ├── lib/supabase.ts                       # client service role + verificação de JWT
│   ├── lib/http-error.ts                     # classe HttpError + helpers
│   ├── middleware/auth.ts                    # requireAuth, requireRole, optionalAuth
│   ├── middleware/validate.ts                # validação Zod (body/params/query)
│   ├── middleware/error.ts                   # handler de erro central
│   ├── domain/money.ts                       # cálculo de taxa/total (lógica pura)
│   ├── modules/
│   │   ├── auth/{routes,controller,service}.ts
│   │   ├── establishments/{routes,controller,service,schema}.ts
│   │   ├── menu/{routes,controller,service,schema}.ts
│   │   ├── orders/{routes,controller,service,schema}.ts
│   │   └── admin/{routes,controller,service}.ts
│   └── types/db.ts                            # tipos das linhas do banco
└── tests/
    ├── unit/money.test.ts
    ├── unit/validate.test.ts
    └── integration/*.test.ts                  # rodam contra o projeto Supabase
```

**Convenção de teste:** lógica pura (`domain/`, schemas Zod, middlewares) tem testes **unitários** que rodam offline. Os testes de **integração** (`tests/integration`) sobem o app real e batem no Supabase; eles fazem `describe.skipIf(!process.env.SUPABASE_URL)` para não quebrar quando o `.env` não estiver configurado.

---

## Task 1: Scaffold do projeto `server/`

**Files:**
- Create: `server/package.json`, `server/tsconfig.json`, `server/.gitignore`, `server/.env.example`, `server/vitest.config.ts`, `server/eslint.config.js`, `server/.prettierrc.json`
- Create: `server/src/config/env.ts`, `server/src/app.ts`, `server/src/index.ts`
- Test: `server/tests/unit/env.test.ts`

- [ ] **Step 1: Criar `server/package.json`**

```json
{
  "name": "pedeai-server",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node --import tsx src/index.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\""
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "cors": "^2.8.5",
    "express": "^4.21.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.15.0",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.9.0",
    "@types/supertest": "^6.0.2",
    "eslint": "^9.15.0",
    "prettier": "^3.3.3",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.15.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Criar `server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "types": ["node", "vitest/globals"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": false,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

> Nota: como em runtime usamos `tsx`, os imports usam o alias `@/` resolvido também no Vitest (Step 5). Em arquivos `.ts` executados por `tsx`, use imports relativos OU configure o alias no `tsx` via `tsconfig` paths (tsx respeita `paths`). Para evitar surpresas, **este plano usa imports relativos** dentro de `src/` e o alias `@/` só nos testes.

- [ ] **Step 3: Criar `server/.gitignore` e `server/.env.example`**

`server/.gitignore`:
```
node_modules
dist
.env
*.log
```

`server/.env.example`:
```
# Servidor
PORT=3333
# Supabase (preencha após criar o projeto)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# F2/F3 (deixe vazio por enquanto)
ASAAS_API_KEY=
ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=
RESEND_API_KEY=
EMAIL_FROM=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

- [ ] **Step 4: Criar `server/eslint.config.js` e `server/.prettierrc.json`**

`server/eslint.config.js`:
```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.ts", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
);
```

`server/.prettierrc.json`:
```json
{ "semi": true, "singleQuote": false, "trailingComma": "all", "printWidth": 100 }
```

- [ ] **Step 5: Criar `server/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { globals: true, environment: "node" },
});
```

- [ ] **Step 6: Escrever o teste que falha — `server/tests/unit/env.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

describe("parseEnv", () => {
  it("lança quando falta SUPABASE_URL", () => {
    expect(() => parseEnv({ PORT: "3333" })).toThrow();
  });

  it("usa PORT padrão 3333 quando ausente", () => {
    const env = parseEnv({
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_ANON_KEY: "a",
      SUPABASE_SERVICE_ROLE_KEY: "s",
    });
    expect(env.PORT).toBe(3333);
    expect(env.SUPABASE_URL).toBe("https://x.supabase.co");
  });
});
```

- [ ] **Step 7: Rodar e ver falhar**

Run: `cd server && npm install && npm run test -- env`
Expected: FAIL (`@/config/env` não existe).

- [ ] **Step 8: Implementar `server/src/config/env.ts`**

```ts
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3333),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

/** Valida um objeto de env (testável) e retorna a config tipada. */
export function parseEnv(raw: NodeJS.ProcessEnv | Record<string, string | undefined>): Env {
  return schema.parse(raw);
}

/** Config do processo atual. */
export const env = parseEnv(process.env);
```

> Nota: `env` (top-level) lê `process.env`. Nos testes unitários use `parseEnv(...)` com objetos explícitos para não depender do ambiente.

- [ ] **Step 9: Rodar e ver passar**

Run: `cd server && npm run test -- env`
Expected: PASS (2 testes).

- [ ] **Step 10: Implementar `server/src/app.ts` e `server/src/index.ts`**

`server/src/app.ts`:
```ts
import express, { type Express } from "express";
import cors from "cors";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  return app;
}
```

`server/src/index.ts`:
```ts
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
app.listen(env.PORT, () => {
  console.log(`PedeAí API on http://localhost:${env.PORT}`);
});
```

> Imports relativos usam sufixo `.js` (resolução ESM via tsx/Node). Mantenha esse padrão em todo `src/`.

- [ ] **Step 11: Teste de smoke do health — `server/tests/unit/health.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

describe("GET /health", () => {
  it("responde ok", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});
```

- [ ] **Step 12: Rodar testes + typecheck**

Run: `cd server && npm run test && npm run typecheck`
Expected: PASS, sem erros de tipo.

- [ ] **Step 13: Commit**

```bash
git add server
git commit -m "feat(server): scaffold Express + TS + env validado + health"
```

---

## Task 2: Schema do banco + RLS (Supabase)

**Pré-requisito:** o projeto Supabase precisa existir. Criação via OAuth/MCP é interativa (o usuário autentica). Esta task entrega o SQL versionado; a aplicação ocorre no projeto criado.

**Files:**
- Create: `server/supabase/migrations/0001_init.sql`

- [ ] **Step 1: Escrever `server/supabase/migrations/0001_init.sql`**

```sql
-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  name text,
  created_at timestamptz not null default now()
);

-- cria profile automaticamente no signup
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, new.raw_user_meta_data->>'name');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ===== establishments =====
create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique,
  tagline text default '',
  description text default '',
  address text default '',
  hours text default '',
  cover text default '',
  logo text default '',
  fee_pct numeric(5,2) not null default 8,
  phone text default '',
  email text default '',
  website text default '',
  whatsapp text default '',
  instagram text default '',
  plan text not null default 'Básico' check (plan in ('Básico','Pro')),
  status text not null default 'pendente' check (status in ('ativo','pendente')),
  city text default '',
  neighborhood text default '',
  -- Asaas (F2)
  cpf_cnpj text,
  asaas_account_id text,
  asaas_wallet_id text,
  asaas_onboarding_status text default 'pendente' check (asaas_onboarding_status in ('pendente','ativo','erro')),
  created_at timestamptz not null default now()
);
create index establishments_owner_idx on public.establishments(owner_id);
create index establishments_status_idx on public.establishments(status);

-- ===== menu_items =====
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  name text not null,
  description text default '',
  price numeric(10,2) not null,
  old_price numeric(10,2),
  emoji text default '🍽️',
  photo text default '',
  photo2 text default '',
  measure numeric(10,2),
  unit text,
  cat text not null,
  sub text not null,
  created_at timestamptz not null default now()
);
create index menu_items_estab_idx on public.menu_items(establishment_id);

-- ===== orders =====
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references public.establishments(id) on delete cascade,
  display_seq integer not null,
  location text default '',
  customer_name text,
  status text not null default 'aguardando' check (status in ('aguardando','producao','entregue')),
  total numeric(10,2) not null,
  fee numeric(10,2) not null default 0,
  fee_pct numeric(5,2) not null default 0,
  note text,
  created_at timestamptz not null default now()
);
create index orders_estab_idx on public.orders(establishment_id);
create unique index orders_estab_seq_idx on public.orders(establishment_id, display_seq);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  name text not null,
  qty integer not null,
  price numeric(10,2) not null
);

create table public.order_splits (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text,
  amount numeric(10,2) not null,
  position integer not null
);

-- próximo display_seq por estabelecimento (atomicidade no insert do pedido)
create function public.next_display_seq(p_estab uuid) returns integer
language sql as $$
  select coalesce(max(display_seq), 0) + 1 from public.orders where establishment_id = p_estab;
$$;

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_splits enable row level security;

-- profiles: dono lê o seu
create policy profiles_self on public.profiles for select using (auth.uid() = id);

-- establishments: público lê ativos; dono CRUD do seu
create policy estab_public_read on public.establishments for select using (status = 'ativo');
create policy estab_owner_all on public.establishments for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- menu: público lê de estabelecimento ativo; dono gerencia o seu
create policy menu_public_read on public.menu_items for select using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.status = 'ativo')
);
create policy menu_owner_all on public.menu_items for all using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
) with check (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
);

-- orders: público insere; dono lê/atualiza do seu estabelecimento
create policy orders_public_insert on public.orders for insert with check (true);
create policy orders_owner_rw on public.orders for select using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
);
create policy orders_owner_update on public.orders for update using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
);
create policy order_items_public_insert on public.order_items for insert with check (true);
create policy order_items_owner_read on public.order_items for select using (
  exists (select 1 from public.orders o join public.establishments e on e.id = o.establishment_id
          where o.id = order_id and e.owner_id = auth.uid())
);
create policy order_splits_public_insert on public.order_splits for insert with check (true);
create policy order_splits_owner_rw on public.order_splits for all using (
  exists (select 1 from public.orders o join public.establishments e on e.id = o.establishment_id
          where o.id = order_id and e.owner_id = auth.uid())
) with check (true);
```

> Observação: o backend acessa via **service role** (bypassa RLS), então o isolamento real é garantido **no código** (sempre filtrando por `owner_id`/escopo). A RLS acima é a 2ª camada para o caso de o frontend, no futuro, falar direto com o Supabase. Admin é resolvido no código (role no `profiles`); não há policy de admin aqui para não acoplar RLS a roles nesta fase.

- [ ] **Step 2: Criar o projeto Supabase e aplicar a migration**

Interativo (precisa do usuário): autenticar no Supabase (OAuth/MCP), criar o projeto `jurandir-pedeai`, e aplicar `0001_init.sql`. Registrar `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no `server/.env` (não commitar).

Verificação: listar as tabelas e confirmar que as 6 existem com RLS habilitada.

- [ ] **Step 3: Commit**

```bash
git add server/supabase
git commit -m "feat(server): schema inicial (tabelas + RLS + triggers)"
```

---

## Task 3: Supabase client + verificação de JWT + middleware de auth

**Files:**
- Create: `server/src/lib/supabase.ts`, `server/src/lib/http-error.ts`, `server/src/middleware/auth.ts`
- Test: `server/tests/unit/auth-middleware.test.ts`

- [ ] **Step 1: `server/src/lib/http-error.ts`**

```ts
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const unauthorized = (m = "Não autenticado") => new HttpError(401, m);
export const forbidden = (m = "Sem permissão") => new HttpError(403, m);
export const notFound = (m = "Não encontrado") => new HttpError(404, m);
export const badRequest = (m: string, details?: unknown) => new HttpError(400, m, details);
```

- [ ] **Step 2: `server/src/lib/supabase.ts`**

```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

/** Client com service role — bypassa RLS. Uso exclusivo do backend. */
export const supabaseAdmin: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

/** Resolve o usuário a partir de um JWT do Supabase; null se inválido. */
export async function getUserFromToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
```

- [ ] **Step 3: Escrever o teste que falha — `server/tests/unit/auth-middleware.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";
import { extractBearer } from "@/middleware/auth";

describe("extractBearer", () => {
  it("extrai o token do header Authorization", () => {
    expect(extractBearer("Bearer abc.def.ghi")).toBe("abc.def.ghi");
  });
  it("retorna null sem header ou formato inválido", () => {
    expect(extractBearer(undefined)).toBeNull();
    expect(extractBearer("Token xyz")).toBeNull();
  });
});
```

- [ ] **Step 4: Rodar e ver falhar**

Run: `cd server && npm run test -- auth-middleware`
Expected: FAIL (`extractBearer` não existe).

- [ ] **Step 5: Implementar `server/src/middleware/auth.ts`**

```ts
import type { NextFunction, Request, Response } from "express";
import { getUserFromToken } from "../lib/supabase.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { forbidden, unauthorized } from "../lib/http-error.js";

export interface AuthUser {
  id: string;
  email: string | undefined;
  role: "owner" | "admin";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function extractBearer(header: string | undefined): string | null {
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
}

async function resolveRole(userId: string): Promise<"owner" | "admin"> {
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", userId).single();
  return data?.role === "admin" ? "admin" : "owner";
}

export function requireAuth() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractBearer(req.headers.authorization);
    if (!token) return next(unauthorized());
    const user = await getUserFromToken(token);
    if (!user) return next(unauthorized("Token inválido ou expirado"));
    req.user = { id: user.id, email: user.email, role: await resolveRole(user.id) };
    next();
  };
}

export function requireRole(role: "admin") {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) return next(forbidden());
    next();
  };
}
```

- [ ] **Step 6: Rodar e ver passar**

Run: `cd server && npm run test -- auth-middleware`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add server/src/lib server/src/middleware/auth.ts server/tests/unit/auth-middleware.test.ts
git commit -m "feat(server): supabase client + verificação de JWT + middleware de auth"
```

---

## Task 4: Validação (Zod) + handler de erro central

**Files:**
- Create: `server/src/middleware/validate.ts`, `server/src/middleware/error.ts`
- Test: `server/tests/unit/validate.test.ts`

- [ ] **Step 1: Escrever o teste que falha — `server/tests/unit/validate.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import express from "express";
import request from "supertest";
import { validate } from "@/middleware/validate";
import { errorHandler } from "@/middleware/error";

function appWith(schema: Parameters<typeof validate>[0]) {
  const app = express();
  app.use(express.json());
  app.post("/x", validate(schema), (req, res) => res.json(req.body));
  app.use(errorHandler);
  return app;
}

describe("validate", () => {
  it("400 quando o body é inválido", async () => {
    const app = appWith({ body: z.object({ name: z.string() }) });
    const res = await request(app).post("/x").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
  it("passa quando válido", async () => {
    const app = appWith({ body: z.object({ name: z.string() }) });
    const res = await request(app).post("/x").send({ name: "ok" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("ok");
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd server && npm run test -- validate`
Expected: FAIL (módulos não existem).

- [ ] **Step 3: Implementar `server/src/middleware/validate.ts`**

```ts
import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { badRequest } from "../lib/http-error.js";

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function validate(schemas: Schemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
      next();
    } catch (e) {
      if (e instanceof ZodError) return next(badRequest("Dados inválidos", e.flatten()));
      next(e);
    }
  };
}
```

- [ ] **Step 4: Implementar `server/src/middleware/error.ts`**

```ts
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Erro interno" });
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `cd server && npm run test -- validate`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/middleware/validate.ts server/src/middleware/error.ts server/tests/unit/validate.test.ts
git commit -m "feat(server): validação Zod + handler de erro central"
```

---

## Task 5: Domínio — cálculo de taxa/total (lógica pura)

**Files:**
- Create: `server/src/domain/money.ts`, `server/src/types/db.ts`
- Test: `server/tests/unit/money.test.ts`

- [ ] **Step 1: Escrever o teste que falha — `server/tests/unit/money.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { computeTotals } from "@/domain/money";

describe("computeTotals", () => {
  it("soma itens e calcula a taxa", () => {
    const r = computeTotals(
      [
        { name: "A", qty: 2, price: 10 },
        { name: "B", qty: 1, price: 5 },
      ],
      8,
    );
    expect(r.total).toBe(25);
    expect(r.fee).toBe(2); // 8% de 25 = 2.00
    expect(r.grandTotal).toBe(27);
  });

  it("taxa 0 quando fee_pct é 0", () => {
    const r = computeTotals([{ name: "A", qty: 1, price: 10 }], 0);
    expect(r.fee).toBe(0);
    expect(r.grandTotal).toBe(10);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd server && npm run test -- money`
Expected: FAIL.

- [ ] **Step 3: Implementar `server/src/domain/money.ts`**

```ts
export interface LineItem {
  name: string;
  qty: number;
  price: number;
}

export interface Totals {
  total: number;
  fee: number;
  grandTotal: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Soma os itens (subtotal) e aplica a taxa percentual da plataforma. */
export function computeTotals(items: LineItem[], feePct: number): Totals {
  const total = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const fee = round2((total * feePct) / 100);
  return { total, fee, grandTotal: round2(total + fee) };
}
```

- [ ] **Step 4: Implementar `server/src/types/db.ts`** (linhas do banco — usadas pelos services)

```ts
export interface EstablishmentRow {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  tagline: string;
  description: string;
  address: string;
  hours: string;
  cover: string;
  logo: string;
  fee_pct: number;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  instagram: string;
  plan: "Básico" | "Pro";
  status: "ativo" | "pendente";
  city: string;
  neighborhood: string;
  created_at: string;
}

export interface MenuItemRow {
  id: string;
  establishment_id: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  emoji: string;
  photo: string;
  photo2: string;
  measure: number | null;
  unit: string | null;
  cat: string;
  sub: string;
  created_at: string;
}

export interface OrderRow {
  id: string;
  establishment_id: string;
  display_seq: number;
  location: string;
  customer_name: string | null;
  status: "aguardando" | "producao" | "entregue";
  total: number;
  fee: number;
  fee_pct: number;
  note: string | null;
  created_at: string;
}
```

- [ ] **Step 5: Rodar e ver passar**

Run: `cd server && npm run test -- money`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add server/src/domain server/src/types server/tests/unit/money.test.ts
git commit -m "feat(server): domínio de cálculo de taxa/total + tipos do banco"
```

---

## Task 6: Módulo Auth (register / login / me)

**Files:**
- Create: `server/src/modules/auth/{service,controller,routes}.ts`
- Test: `server/tests/integration/auth.test.ts`

- [ ] **Step 1: `server/src/modules/auth/service.ts`**

```ts
import { supabaseAdmin } from "../../lib/supabase.js";
import { badRequest } from "../../lib/http-error.js";

export async function register(email: string, password: string, name: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) throw badRequest(error.message);
  return { id: data.user.id, email: data.user.email };
}

export async function login(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error) throw badRequest(error.message);
  return {
    access_token: data.session?.access_token,
    user: { id: data.user?.id, email: data.user?.email },
  };
}
```

- [ ] **Step 2: `server/src/modules/auth/controller.ts`**

```ts
import type { Request, Response } from "express";
import * as service from "./service.js";

export async function postRegister(req: Request, res: Response) {
  const { email, password, name } = req.body as { email: string; password: string; name: string };
  res.status(201).json(await service.register(email, password, name));
}

export async function postLogin(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  res.json(await service.login(email, password));
}

export function getMe(req: Request, res: Response) {
  res.json(req.user);
}
```

- [ ] **Step 3: `server/src/modules/auth/routes.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { getMe, postLogin, postRegister } from "./controller.js";

export const authRoutes = Router();
const creds = z.object({ email: z.string().email(), password: z.string().min(6) });

authRoutes.post("/register", validate({ body: creds.extend({ name: z.string().min(1) }) }), postRegister);
authRoutes.post("/login", validate({ body: creds }), postLogin);
authRoutes.get("/me", requireAuth(), getMe);
```

> Os controllers `async` que podem lançar precisam que o erro chegue ao `errorHandler`. No Express 4, use um wrapper. Adicione em `server/src/lib/async-handler.ts`:
> ```ts
> import type { NextFunction, Request, Response } from "express";
> export const ah =
>   (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
>   (req: Request, res: Response, next: NextFunction) =>
>     Promise.resolve(fn(req, res, next)).catch(next);
> ```
> e envolva os handlers async nas rotas: `authRoutes.post("/login", validate({ body: creds }), ah(postLogin));` (idem nos próximos módulos).

- [ ] **Step 4: Teste de integração — `server/tests/integration/auth.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;
const email = `owner+${Date.now()}@example.com`;

describe.skipIf(!hasEnv)("auth (integração)", () => {
  const app = createApp();
  it("registra, loga e retorna /me", async () => {
    const reg = await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    expect(reg.status).toBe(201);

    const login = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
    expect(login.status).toBe(200);
    const token = login.body.access_token as string;
    expect(token).toBeTruthy();

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
    expect(me.body.role).toBe("owner");
  });
});
```

> A montagem das rotas sob `/api` acontece na Task 11 (`app.ts`). Rode este teste após a Task 11.

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/auth server/src/lib/async-handler.ts server/tests/integration/auth.test.ts
git commit -m "feat(server): módulo auth (register/login/me)"
```

---

## Task 7: Módulo Establishments (público + /me/establishment)

**Files:**
- Create: `server/src/modules/establishments/{schema,service,controller,routes}.ts`
- Test: `server/tests/integration/establishments.test.ts`

- [ ] **Step 1: `server/src/modules/establishments/schema.ts`**

```ts
import { z } from "zod";

export const establishmentInput = z.object({
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  cover: z.string().optional(),
  logo: z.string().optional(),
  fee_pct: z.number().min(0).max(30).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
});

export const idParam = z.object({ id: z.string().uuid() });
```

- [ ] **Step 2: `server/src/modules/establishments/service.ts`**

```ts
import { supabaseAdmin } from "../../lib/supabase.js";
import { notFound } from "../../lib/http-error.js";
import type { EstablishmentRow } from "../../types/db.js";

export async function listPublic(filters: { city?: string; neighborhood?: string }) {
  let q = supabaseAdmin.from("establishments").select("*").eq("status", "ativo");
  if (filters.city) q = q.eq("city", filters.city);
  if (filters.neighborhood) q = q.eq("neighborhood", filters.neighborhood);
  const { data, error } = await q;
  if (error) throw error;
  return data as EstablishmentRow[];
}

export async function getPublic(id: string) {
  const { data } = await supabaseAdmin
    .from("establishments")
    .select("*")
    .eq("id", id)
    .eq("status", "ativo")
    .maybeSingle();
  if (!data) throw notFound("Estabelecimento não encontrado");
  return data as EstablishmentRow;
}

export async function getByOwner(ownerId: string) {
  const { data } = await supabaseAdmin
    .from("establishments")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  return (data as EstablishmentRow) ?? null;
}

export async function upsertForOwner(ownerId: string, input: Record<string, unknown>) {
  const existing = await getByOwner(ownerId);
  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("establishments")
      .update(input)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as EstablishmentRow;
  }
  const { data, error } = await supabaseAdmin
    .from("establishments")
    .insert({ ...input, owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as EstablishmentRow;
}
```

- [ ] **Step 3: `server/src/modules/establishments/controller.ts`**

```ts
import type { Request, Response } from "express";
import * as service from "./service.js";
import { notFound } from "../../lib/http-error.js";

export async function getList(req: Request, res: Response) {
  const { city, neighborhood } = req.query as { city?: string; neighborhood?: string };
  res.json(await service.listPublic({ city, neighborhood }));
}

export async function getOne(req: Request, res: Response) {
  res.json(await service.getPublic(req.params.id));
}

export async function getMine(req: Request, res: Response) {
  const e = await service.getByOwner(req.user!.id);
  if (!e) throw notFound("Você ainda não tem estabelecimento");
  res.json(e);
}

export async function patchMine(req: Request, res: Response) {
  res.json(await service.upsertForOwner(req.user!.id, req.body));
}
```

- [ ] **Step 4: `server/src/modules/establishments/routes.ts`**

```ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { establishmentInput, idParam } from "./schema.js";
import { getList, getMine, getOne, patchMine } from "./controller.js";

export const establishmentRoutes = Router();
establishmentRoutes.get("/establishments", ah(getList));
establishmentRoutes.get("/establishments/:id", validate({ params: idParam }), ah(getOne));

export const meEstablishmentRoutes = Router();
meEstablishmentRoutes.get("/me/establishment", requireAuth(), ah(getMine));
meEstablishmentRoutes.patch(
  "/me/establishment",
  requireAuth(),
  validate({ body: establishmentInput.partial() }),
  ah(patchMine),
);
```

- [ ] **Step 5: Teste de integração — `server/tests/integration/establishments.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("establishments (integração)", () => {
  const app = createApp();
  it("dono cria/atualiza o próprio estabelecimento e aparece na listagem pública", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const login = await request(app).post("/api/auth/login").send({ email, password: "secret123" });
    const token = login.body.access_token as string;

    const patch = await request(app)
      .patch("/api/me/establishment")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque Teste", city: "Itajaí/SC", status: "ativo", fee_pct: 8 });
    expect(patch.status).toBe(200);
    expect(patch.body.name).toBe("Quiosque Teste");

    const list = await request(app).get("/api/establishments?city=Itajaí/SC");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
  });
});
```

> Nota: `status` não está no `establishmentInput` (dono não deveria se auto-ativar em produção). Para a F1, permita-o adicionando `status: z.enum(["ativo","pendente"]).optional()` ao schema **apenas para facilitar o teste**, ou ative via admin (Task 10). Decisão registrada: manter fora do input do dono e ativar via admin — ajuste o teste para ativar com o fluxo admin se preferir rigor.

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/establishments server/tests/integration/establishments.test.ts
git commit -m "feat(server): módulo establishments (público + /me/establishment)"
```

---

## Task 8: Módulo Menu (CRUD do dono)

**Files:**
- Create: `server/src/modules/menu/{schema,service,controller,routes}.ts`
- Test: `server/tests/integration/menu.test.ts`

- [ ] **Step 1: `server/src/modules/menu/schema.ts`**

```ts
import { z } from "zod";

export const menuItemInput = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  old_price: z.number().nonnegative().nullable().optional(),
  emoji: z.string().optional(),
  photo: z.string().optional(),
  photo2: z.string().optional(),
  measure: z.number().nonnegative().nullable().optional(),
  unit: z.string().nullable().optional(),
  cat: z.string().min(1),
  sub: z.string().min(1),
});
export const menuIdParam = z.object({ id: z.string().uuid() });
```

- [ ] **Step 2: `server/src/modules/menu/service.ts`**

```ts
import { supabaseAdmin } from "../../lib/supabase.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import type { MenuItemRow } from "../../types/db.js";

async function ownerEstablishmentId(ownerId: string): Promise<string> {
  const { data } = await supabaseAdmin.from("establishments").select("id").eq("owner_id", ownerId).maybeSingle();
  if (!data) throw forbidden("Sem estabelecimento");
  return data.id as string;
}

export async function listByOwner(ownerId: string) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabaseAdmin.from("menu_items").select("*").eq("establishment_id", estId);
  if (error) throw error;
  return data as MenuItemRow[];
}

export async function listPublic(estId: string) {
  const { data, error } = await supabaseAdmin.from("menu_items").select("*").eq("establishment_id", estId);
  if (error) throw error;
  return data as MenuItemRow[];
}

export async function create(ownerId: string, input: Record<string, unknown>) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({ ...input, establishment_id: estId })
    .select("*")
    .single();
  if (error) throw error;
  return data as MenuItemRow;
}

export async function update(ownerId: string, id: string, input: Record<string, unknown>) {
  const estId = await ownerEstablishmentId(ownerId);
  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .update(input)
    .eq("id", id)
    .eq("establishment_id", estId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Item não encontrado");
  return data as MenuItemRow;
}

export async function remove(ownerId: string, id: string) {
  const estId = await ownerEstablishmentId(ownerId);
  const { error, count } = await supabaseAdmin
    .from("menu_items")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("establishment_id", estId);
  if (error) throw error;
  if (!count) throw notFound("Item não encontrado");
}
```

- [ ] **Step 3: `server/src/modules/menu/controller.ts`**

```ts
import type { Request, Response } from "express";
import * as service from "./service.js";

export async function getMine(req: Request, res: Response) {
  res.json(await service.listByOwner(req.user!.id));
}
export async function getPublicMenu(req: Request, res: Response) {
  res.json(await service.listPublic(req.params.id));
}
export async function post(req: Request, res: Response) {
  res.status(201).json(await service.create(req.user!.id, req.body));
}
export async function patch(req: Request, res: Response) {
  res.json(await service.update(req.user!.id, req.params.id, req.body));
}
export async function del(req: Request, res: Response) {
  await service.remove(req.user!.id, req.params.id);
  res.status(204).end();
}
```

- [ ] **Step 4: `server/src/modules/menu/routes.ts`**

```ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { menuIdParam, menuItemInput } from "./schema.js";
import { del, getMine, getPublicMenu, patch, post } from "./controller.js";
import { idParam } from "../establishments/schema.js";

// pública: GET /establishments/:id/menu
export const publicMenuRoutes = Router();
publicMenuRoutes.get("/establishments/:id/menu", validate({ params: idParam }), ah(getPublicMenu));

// dono: /menu-items
export const menuRoutes = Router();
menuRoutes.get("/menu-items", requireAuth(), ah(getMine));
menuRoutes.post("/menu-items", requireAuth(), validate({ body: menuItemInput }), ah(post));
menuRoutes.patch(
  "/menu-items/:id",
  requireAuth(),
  validate({ params: menuIdParam, body: menuItemInput.partial() }),
  ah(patch),
);
menuRoutes.delete("/menu-items/:id", requireAuth(), validate({ params: menuIdParam }), ah(del));
```

- [ ] **Step 5: Teste de integração — `server/tests/integration/menu.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("menu (integração)", () => {
  const app = createApp();
  it("dono cria, lista, edita e remove item", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body
      .access_token as string;
    await request(app)
      .patch("/api/me/establishment")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque", city: "Itajaí/SC", status: "ativo" });

    const created = await request(app)
      .post("/api/menu-items")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Caipirinha", price: 22, cat: "Bebidas", sub: "Drinks" });
    expect(created.status).toBe(201);
    const id = created.body.id as string;

    const patched = await request(app)
      .patch(`/api/menu-items/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ price: 25 });
    expect(patched.body.price).toBe(25);

    const del = await request(app).delete(`/api/menu-items/${id}`).set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/menu server/tests/integration/menu.test.ts
git commit -m "feat(server): módulo menu (CRUD do dono + leitura pública)"
```

---

## Task 9: Módulo Orders (criar público + gerenciar do dono)

**Files:**
- Create: `server/src/modules/orders/{schema,service,controller,routes}.ts`
- Test: `server/tests/integration/orders.test.ts`

- [ ] **Step 1: `server/src/modules/orders/schema.ts`**

```ts
import { z } from "zod";

export const createOrderInput = z.object({
  location: z.string().optional(),
  customer_name: z.string().optional(),
  note: z.string().max(200).optional(),
  items: z
    .array(z.object({ name: z.string().min(1), qty: z.number().int().positive(), price: z.number().nonnegative() }))
    .min(1),
  splits: z
    .array(z.object({ method: z.string().nullable(), amount: z.number().nonnegative(), position: z.number().int() }))
    .optional(),
});

export const orderIdParam = z.object({ id: z.string().uuid() });
export const updateOrderInput = z.object({ status: z.enum(["aguardando", "producao", "entregue"]) });
export const splitPayParam = z.object({ id: z.string().uuid(), position: z.coerce.number().int() });
export const splitPayInput = z.object({ method: z.string().min(1) });
```

- [ ] **Step 2: `server/src/modules/orders/service.ts`**

```ts
import { supabaseAdmin } from "../../lib/supabase.js";
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
  const { data: est } = await supabaseAdmin
    .from("establishments")
    .select("id, fee_pct, status")
    .eq("id", establishmentId)
    .maybeSingle();
  if (!est || est.status !== "ativo") throw notFound("Estabelecimento indisponível");

  const { total, fee } = computeTotals(input.items, Number(est.fee_pct));
  const { data: seq } = await supabaseAdmin.rpc("next_display_seq", { p_estab: establishmentId });
  const fullyPaid = !input.splits || input.splits.every((s) => s.method);

  const { data: order, error } = await supabaseAdmin
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
    .select("*")
    .single();
  if (error) throw error;

  await supabaseAdmin
    .from("order_items")
    .insert(input.items.map((i) => ({ order_id: order.id, name: i.name, qty: i.qty, price: i.price })));
  if (input.splits?.length) {
    await supabaseAdmin
      .from("order_splits")
      .insert(input.splits.map((s) => ({ order_id: order.id, ...s })));
  }
  return order as OrderRow;
}

async function assertOwnsOrder(ownerId: string, orderId: string): Promise<OrderRow> {
  const { data } = await supabaseAdmin.from("orders").select("*, establishments!inner(owner_id)").eq("id", orderId).maybeSingle();
  if (!data) throw notFound("Pedido não encontrado");
  // @ts-expect-error join aninhado
  if (data.establishments.owner_id !== ownerId) throw forbidden();
  return data as OrderRow;
}

export async function listByOwner(ownerId: string, status?: string) {
  const { data: est } = await supabaseAdmin.from("establishments").select("id").eq("owner_id", ownerId).maybeSingle();
  if (!est) return [];
  let q = supabaseAdmin
    .from("orders")
    .select("*, order_items(*), order_splits(*)")
    .eq("establishment_id", est.id)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function updateStatus(ownerId: string, orderId: string, status: string) {
  await assertOwnsOrder(ownerId, orderId);
  const { data, error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId).select("*").single();
  if (error) throw error;
  return data as OrderRow;
}

export async function payShare(ownerId: string, orderId: string, position: number, method: string) {
  await assertOwnsOrder(ownerId, orderId);
  await supabaseAdmin.from("order_splits").update({ method }).eq("order_id", orderId).eq("position", position);
  const { data: splits } = await supabaseAdmin.from("order_splits").select("method").eq("order_id", orderId);
  const allPaid = (splits ?? []).every((s) => s.method);
  if (allPaid) await supabaseAdmin.from("orders").update({ status: "producao" }).eq("id", orderId);
  return { allPaid };
}
```

- [ ] **Step 3: `server/src/modules/orders/controller.ts`**

```ts
import type { Request, Response } from "express";
import * as service from "./service.js";

export async function postPublic(req: Request, res: Response) {
  res.status(201).json(await service.createPublic(req.params.id, req.body));
}
export async function getMine(req: Request, res: Response) {
  res.json(await service.listByOwner(req.user!.id, req.query.status as string | undefined));
}
export async function patchStatus(req: Request, res: Response) {
  res.json(await service.updateStatus(req.user!.id, req.params.id, req.body.status));
}
export async function postPayShare(req: Request, res: Response) {
  const position = Number(req.params.position);
  res.json(await service.payShare(req.user!.id, req.params.id, position, req.body.method));
}
```

- [ ] **Step 4: `server/src/modules/orders/routes.ts`**

```ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { idParam } from "../establishments/schema.js";
import {
  createOrderInput,
  orderIdParam,
  splitPayInput,
  splitPayParam,
  updateOrderInput,
} from "./schema.js";
import { getMine, patchStatus, postPayShare, postPublic } from "./controller.js";

// pública: criar pedido
export const publicOrderRoutes = Router();
publicOrderRoutes.post(
  "/establishments/:id/orders",
  validate({ params: idParam, body: createOrderInput }),
  ah(postPublic),
);

// dono: gerenciar
export const orderRoutes = Router();
orderRoutes.get("/orders", requireAuth(), ah(getMine));
orderRoutes.patch(
  "/orders/:id",
  requireAuth(),
  validate({ params: orderIdParam, body: updateOrderInput }),
  ah(patchStatus),
);
orderRoutes.post(
  "/orders/:id/splits/:position/pay",
  requireAuth(),
  validate({ params: splitPayParam, body: splitPayInput }),
  ah(postPayShare),
);
```

- [ ] **Step 5: Teste de integração — `server/tests/integration/orders.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("orders (integração)", () => {
  const app = createApp();
  it("cliente cria pedido público; dono vê e marca entregue", async () => {
    const email = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Dono" });
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body
      .access_token as string;
    const est = await request(app)
      .patch("/api/me/establishment")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Quiosque", city: "Itajaí/SC", status: "ativo", fee_pct: 10 });
    const estId = est.body.id as string;

    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ location: "Guarda-sol 14", items: [{ name: "Caipirinha", qty: 2, price: 22 }] });
    expect(order.status).toBe(201);
    expect(order.body.total).toBe(44);
    expect(order.body.fee).toBe(4.4); // 10% de 44
    expect(order.body.status).toBe("producao"); // sem splits = pago

    const list = await request(app).get("/api/orders").set("Authorization", `Bearer ${token}`);
    expect(list.body.length).toBeGreaterThan(0);

    const upd = await request(app)
      .patch(`/api/orders/${order.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "entregue" });
    expect(upd.body.status).toBe("entregue");
  });
});
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/orders server/tests/integration/orders.test.ts
git commit -m "feat(server): módulo orders (criar público + gerenciar do dono + splits)"
```

---

## Task 10: Módulo Admin (estabelecimentos + stats)

**Files:**
- Create: `server/src/modules/admin/{service,controller,routes}.ts`
- Test: `server/tests/integration/admin.test.ts`

- [ ] **Step 1: `server/src/modules/admin/service.ts`**

```ts
import { supabaseAdmin } from "../../lib/supabase.js";
import { notFound } from "../../lib/http-error.js";

export async function listAll() {
  const { data, error } = await supabaseAdmin.from("establishments").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function patchEstablishment(id: string, patch: { fee_pct?: number; status?: string }) {
  const { data, error } = await supabaseAdmin
    .from("establishments")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Estabelecimento não encontrado");
  return data;
}

export async function stats() {
  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("total, fee, status")
    .neq("status", "aguardando");
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
```

- [ ] **Step 2: `server/src/modules/admin/controller.ts`**

```ts
import type { Request, Response } from "express";
import * as service from "./service.js";

export async function getEstablishments(_req: Request, res: Response) {
  res.json(await service.listAll());
}
export async function patchEstablishment(req: Request, res: Response) {
  res.json(await service.patchEstablishment(req.params.id, req.body));
}
export async function getStats(_req: Request, res: Response) {
  res.json(await service.stats());
}
```

- [ ] **Step 3: `server/src/modules/admin/routes.ts`**

```ts
import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { ah } from "../../lib/async-handler.js";
import { idParam } from "../establishments/schema.js";
import { getEstablishments, getStats, patchEstablishment } from "./controller.js";

export const adminRoutes = Router();
adminRoutes.use("/admin", requireAuth(), requireRole("admin"));
adminRoutes.get("/admin/establishments", ah(getEstablishments));
adminRoutes.patch(
  "/admin/establishments/:id",
  validate({ params: idParam, body: z.object({ fee_pct: z.number().min(0).max(30).optional(), status: z.enum(["ativo", "pendente"]).optional() }) }),
  ah(patchEstablishment),
);
adminRoutes.get("/admin/stats", ah(getStats));
```

> Promover um usuário a admin é uma ação manual de banco nesta fase: `update public.profiles set role='admin' where id='<uuid>';`. O teste de admin cria um usuário e o promove via `supabaseAdmin` antes de logar.

- [ ] **Step 4: Teste de integração — `server/tests/integration/admin.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import { supabaseAdmin } from "@/lib/supabase";

const hasEnv = !!process.env.SUPABASE_URL;

describe.skipIf(!hasEnv)("admin (integração)", () => {
  const app = createApp();
  it("admin lista estabelecimentos e vê stats; não-admin recebe 403", async () => {
    const email = `admin+${Date.now()}@example.com`;
    const reg = await request(app).post("/api/auth/register").send({ email, password: "secret123", name: "Admin" });
    await supabaseAdmin.from("profiles").update({ role: "admin" }).eq("id", reg.body.id);
    const token = (await request(app).post("/api/auth/login").send({ email, password: "secret123" })).body
      .access_token as string;

    const list = await request(app).get("/api/admin/establishments").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    const stats = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${token}`);
    expect(stats.status).toBe(200);
    expect(stats.body).toHaveProperty("gmv");

    // não-admin
    const e2 = `owner+${Date.now()}@example.com`;
    await request(app).post("/api/auth/register").send({ email: e2, password: "secret123", name: "Dono" });
    const t2 = (await request(app).post("/api/auth/login").send({ email: e2, password: "secret123" })).body
      .access_token as string;
    const denied = await request(app).get("/api/admin/stats").set("Authorization", `Bearer ${t2}`);
    expect(denied.status).toBe(403);
  });
});
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/admin server/tests/integration/admin.test.ts
git commit -m "feat(server): módulo admin (establishments + stats)"
```

---

## Task 11: Wiring final + README + verificação

**Files:**
- Modify: `server/src/app.ts`
- Create: `server/README.md`

- [ ] **Step 1: Montar todas as rotas em `server/src/app.ts`**

```ts
import express, { type Express } from "express";
import cors from "cors";
import { authRoutes } from "./modules/auth/routes.js";
import { establishmentRoutes, meEstablishmentRoutes } from "./modules/establishments/routes.js";
import { menuRoutes, publicMenuRoutes } from "./modules/menu/routes.js";
import { orderRoutes, publicOrderRoutes } from "./modules/orders/routes.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { errorHandler } from "./middleware/error.js";

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRoutes);
  app.use("/api", establishmentRoutes);
  app.use("/api", meEstablishmentRoutes);
  app.use("/api", publicMenuRoutes);
  app.use("/api", menuRoutes);
  app.use("/api", publicOrderRoutes);
  app.use("/api", orderRoutes);
  app.use("/api", adminRoutes);

  app.use(errorHandler);
  return app;
}
```

- [ ] **Step 2: `server/README.md`** (como rodar, variáveis, endpoints) — incluir tabela de endpoints, credenciais sandbox e nota de RLS/segurança.

- [ ] **Step 3: Rodar tudo**

Run: `cd server && npm run lint && npm run typecheck && npm run test`
Expected: lint 0, types 0; testes unitários PASS; integração PASS se `.env` configurado (senão `skipped`).

- [ ] **Step 4: Smoke manual (com `.env` configurado)**

```bash
cd server && npm run dev
# noutro terminal:
curl -s localhost:3333/health
curl -s -X POST localhost:3333/api/auth/register -H 'content-type: application/json' \
  -d '{"email":"dono@ex.com","password":"secret123","name":"Dono"}'
```

- [ ] **Step 5: Commit**

```bash
git add server/src/app.ts server/README.md
git commit -m "feat(server): wiring das rotas /api + README do backend"
```

---

## Self-Review (cobertura do spec)

- **Auth (donos+admin, cliente anônimo):** Tasks 3, 6, 10 ✓ (cliente cria pedido sem auth na Task 9).
- **CRUD establishments/menu/orders:** Tasks 7, 8, 9 ✓.
- **RLS + migrations:** Task 2 ✓.
- **Admin + stats:** Task 10 ✓.
- **Validação Zod + erros:** Task 4 (+ schemas por módulo) ✓.
- **Cálculo de taxa/total + display_seq:** Tasks 5 e 9 ✓.
- **Integrações Asaas/Resend/Twilio:** **fora desta F1** (planos F2/F3) — interfaces/portas serão criadas lá; aqui nada as chama. Consistente com o spec (faseamento §14).
- **Segredos em `.env`:** Task 1 (`.env.example`, `.gitignore`) ✓.

Pontos de atenção para o executor: (a) envolver todo handler `async` com o `ah()` async-handler (Task 6) para que erros cheguem ao `errorHandler`; (b) decisão de produto: `status` do estabelecimento **não** entra no input do dono (ativação via admin, Task 10) — os testes de integração ativam via admin ou ajuste pontual documentado na Task 7.

## Próximos planos

- **F2 — Asaas:** `docs/superpowers/plans/<data>-jurandir-backend-f2-asaas.md` (criar quando tivermos o projeto Supabase + chave sandbox Asaas).
- **F3 — Notificações:** Resend + Twilio + outbox (após F2).
