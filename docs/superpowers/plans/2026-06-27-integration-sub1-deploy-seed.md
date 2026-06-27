# Integração Sub-1 — Deploy do backend + Seed — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar a API (`server/`) no Railway com CORS restrito, um endpoint público de status de pedido e dados-semente, para que o backend real fique acessível por HTTPS com a demo pronta.

**Architecture:** Express (Railway) + Supabase. Adições pequenas no backend (CORS por env, `GET /orders/:id` público, script de seed), depois deploy manual no Railway (ação do usuário) e verificação.

**Tech Stack:** Node 20, Express, TypeScript (ESM, tsx), Zod, Vitest + Supertest, Supabase, Railway. Spec: `docs/superpowers/specs/2026-06-27-frontend-backend-integration-design.md`.

---

## File Structure

```
server/
├── src/config/env.ts            # + CORS_ORIGINS (opcional)
├── src/lib/cors.ts              # parseCorsOrigins (helper puro) — NOVO
├── src/app.ts                   # usar origens de CORS do env
├── src/modules/orders/
│   ├── service.ts               # + getPublicOrder
│   ├── controller.ts            # + getOne
│   └── routes.ts                # + GET /orders/:id em publicOrderRoutes
├── scripts/seed.ts              # seed idempotente — NOVO
├── package.json                 # + script "seed"
└── tests/
    ├── unit/cors.test.ts        # NOVO
    └── integration/orders.test.ts  # + caso GET /orders/:id público
```

Branch sugerida: `feat/integration-sub1`.

---

## Task 1: CORS configurável por env

**Files:**
- Modify: `server/src/config/env.ts`
- Create: `server/src/lib/cors.ts`
- Modify: `server/src/app.ts`
- Test: `server/tests/unit/cors.test.ts`

- [ ] **Step 1: Escrever o teste que falha — `server/tests/unit/cors.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { parseCorsOrigins } from "@/lib/cors";

describe("parseCorsOrigins", () => {
  it("retorna true (libera tudo) quando vazio/undefined", () => {
    expect(parseCorsOrigins(undefined)).toBe(true);
    expect(parseCorsOrigins("")).toBe(true);
  });
  it("divide por vírgula e remove espaços", () => {
    expect(parseCorsOrigins("https://a.com, https://b.com")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd server && npm run test -- cors`
Expected: FAIL (módulo inexistente).

- [ ] **Step 3: Implementar `server/src/lib/cors.ts`**

```ts
/**
 * Converte a env CORS_ORIGINS numa config de origem para o middleware cors.
 * Vazio/undefined → `true` (libera todas as origens, útil em dev).
 * Caso contrário → lista de origens permitidas.
 */
export function parseCorsOrigins(raw: string | undefined): true | string[] {
  if (!raw || !raw.trim()) return true;
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
}
```

- [ ] **Step 4: Adicionar `CORS_ORIGINS` ao `server/src/config/env.ts`**

No objeto `schema`, adicionar o campo (mantendo os demais):
```ts
  CORS_ORIGINS: z.string().optional(),
```

- [ ] **Step 5: Usar a config no `server/src/app.ts`**

Trocar `app.use(cors());` por:
```ts
  app.use(cors({ origin: parseCorsOrigins(getEnv().CORS_ORIGINS) }));
```
E adicionar os imports no topo:
```ts
import { parseCorsOrigins } from "./lib/cors.js";
import { getEnv } from "./config/env.js";
```

- [ ] **Step 6: Rodar testes + typecheck + lint**

Run: `cd server && npm run test && npm run typecheck && npm run lint`
Expected: tudo verde (inclui o novo `cors.test.ts`).

- [ ] **Step 7: Commit**

```bash
git add server/src/config/env.ts server/src/lib/cors.ts server/src/app.ts server/tests/unit/cors.test.ts
git commit -m "feat(server): CORS configurável por env (CORS_ORIGINS)"
```

---

## Task 2: Endpoint público `GET /orders/:id`

**Files:**
- Modify: `server/src/modules/orders/service.ts`
- Modify: `server/src/modules/orders/controller.ts`
- Modify: `server/src/modules/orders/routes.ts`
- Test: `server/tests/integration/orders.test.ts` (adicionar caso)

- [ ] **Step 1: Adicionar `getPublicOrder` em `server/src/modules/orders/service.ts`**

No fim do arquivo (após `payShare`), adicionar:
```ts
export async function getPublicOrder(orderId: string) {
  const { data, error } = await supabase()
    .from("orders")
    .select("id, establishment_id, display_seq, location, customer_name, status, total, fee, fee_pct, note, created_at, order_items(*), order_splits(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound("Pedido não encontrado");
  return data;
}
```
(`notFound` já está importado neste arquivo.)

- [ ] **Step 2: Adicionar `getOne` em `server/src/modules/orders/controller.ts`**

```ts
export async function getOne(req: Request, res: Response) {
  res.json(await service.getPublicOrder(req.params.id));
}
```

- [ ] **Step 3: Adicionar a rota pública em `server/src/modules/orders/routes.ts`**

No `publicOrderRoutes`, importar `getOne` e `orderIdParam` (já importados parcialmente — garantir `orderIdParam` no import de schema e `getOne` no import de controller) e adicionar:
```ts
publicOrderRoutes.get("/orders/:id", validate({ params: orderIdParam }), ah(getOne));
```
(Imports necessários no arquivo: `getOne` de `./controller.js` e `orderIdParam` de `./schema.js`.)

- [ ] **Step 4: Adicionar o caso de teste em `server/tests/integration/orders.test.ts`**

Dentro do `describe("orders (integração)")`, adicionar:
```ts
  it("GET /orders/:id público retorna o pedido; id inexistente → 404", async () => {
    const { token, estId } = await setupOwner(app, 0, "g");
    const itemId = await createMenuItem(app, token, "Água", 5);
    const order = await request(app)
      .post(`/api/establishments/${estId}/orders`)
      .send({ items: [{ menu_item_id: itemId, qty: 1 }] });
    const got = await request(app).get(`/api/orders/${order.body.id}`);
    expect(got.status).toBe(200);
    expect(got.body.id).toBe(order.body.id);
    expect(Array.isArray(got.body.order_items)).toBe(true);

    const missing = await request(app).get("/api/orders/00000000-0000-0000-0000-000000000000");
    expect(missing.status).toBe(404);
  });
```
(Os helpers `setupOwner`/`createMenuItem` já existem no arquivo.)

- [ ] **Step 5: Rodar testes + typecheck + lint**

Run: `cd server && npm run test && npm run typecheck && npm run lint`
Expected: tudo verde (o novo caso bate no Supabase real).

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/orders
git commit -m "feat(server): GET /orders/:id público (status do pedido p/ o cliente)"
```

---

## Task 3: Script de seed idempotente

**Files:**
- Create: `server/scripts/seed.ts`
- Modify: `server/package.json` (script `seed`)

- [ ] **Step 1: Criar `server/scripts/seed.ts`**

```ts
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
  // já existe → localizar
  const { data: list } = await supabase().auth.admin.listUsers();
  const found = list.users.find((u) => u.email === email);
  if (!found) throw new Error(`Falha ao criar/achar ${email}: ${error?.message}`);
  return found.id;
}

async function main() {
  console.log("Seed: criando usuários…");
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
```

- [ ] **Step 2: Adicionar o script em `server/package.json`**

Em `scripts`, adicionar:
```json
    "seed": "tsx scripts/seed.ts",
```

- [ ] **Step 3: Rodar o seed (contra o Supabase real, usando `server/.env`)**

Run: `cd server && npm run seed`
Expected: imprime "Seed OK. establishment_id=…" e os logins. Reexecutar deve dizer "cardápio já tem N itens — pulando" (idempotente).

- [ ] **Step 4: Verificar via API que os dados aparecem**

Run (no `server/`, com `.env` carregado):
```bash
set -a; source ./.env; set +a
curl -s "$SUPABASE_URL/rest/v1/establishments?select=name,status&status=eq.ativo" -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```
Expected: JSON com `Quiosque do Mar` / `ativo`.

- [ ] **Step 5: Commit**

```bash
git add server/scripts/seed.ts server/package.json
git commit -m "feat(server): script de seed idempotente (dono/admin/estabelecimento/cardápio)"
```

---

## Task 4: Deploy no Railway (ação do usuário) + verificação

**Files:** nenhum (configuração no painel do Railway). Documentar em `server/README.md`.

- [ ] **Step 1: (Usuário) Criar o serviço no Railway**

No Railway: New Project → Deploy from GitHub repo `0xmnet0o/JurandirWebApp`. Em Settings do serviço:
- **Root Directory:** `server`
- **Install Command:** `npm install`
- **Start Command:** `npm start`
- **Healthcheck Path:** `/health`

- [ ] **Step 2: (Usuário) Definir as variáveis de ambiente no painel do Railway**

- `SUPABASE_URL` = `https://iqebbkoqolsgsftvrghl.supabase.co`
- `SUPABASE_ANON_KEY` = (publishable/anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = (service key — **definir no painel, não no chat**)
- `CORS_ORIGINS` = `https://0xmnet0o.github.io`
- `NODE_ENV` = `production`
- (PORT é injetado automaticamente pelo Railway.)

- [ ] **Step 3: (Usuário) Fornecer a URL pública**

Após o deploy, copiar a URL pública do serviço (ex.: `https://pedeai-server-production.up.railway.app`) e informar.

- [ ] **Step 4: Verificar o deploy**

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<railway-url>/health        # 200
curl -s "https://<railway-url>/api/establishments" | head -c 300              # inclui "Quiosque do Mar"
```
Expected: `/health` → 200; `/api/establishments` retorna o estabelecimento semeado.

- [ ] **Step 5: Documentar deploy no `server/README.md`**

Adicionar uma seção "Deploy (Railway)" com Root Directory `server`, Start `npm start`, Healthcheck `/health`, a lista de env vars e a nota de `CORS_ORIGINS`. Commit:
```bash
git add server/README.md
git commit -m "docs(server): instruções de deploy no Railway"
```

---

## Self-Review (cobertura do spec)

- **CORS por env:** Task 1 ✓.
- **`GET /orders/:id` público:** Task 2 ✓.
- **Seed (dono/admin/estabelecimento/cardápio, idempotente):** Task 3 ✓.
- **Deploy Railway + env (service key no painel) + URL pública:** Task 4 ✓.
- **Verificação (health 200, establishments via API, seed):** Tasks 3.4 e 4.4 ✓.

Sem placeholders. Tipos/Nomes consistentes (`getPublicOrder`/`getOne`, `parseCorsOrigins`, `CORS_ORIGINS`). Dependência externa explícita: Task 4 exige ação do usuário no Railway.

## Próximo plano

- **Sub-projeto 2 — Integração do frontend:** criar quando o Sub-1 estiver no ar (precisa da URL pública do Railway para `VITE_API_URL`).
