# Jurandir — Backend (PedeAí) — Design

**Data:** 2026-06-27
**Status:** Aprovado (aguardando revisão final do spec antes do plano de implementação)
**Escopo desta etapa:** apenas o backend. O frontend React permanece no `localStorage`; a integração frontend↔backend é uma etapa futura.

## 1. Objetivo

Dar ao app PedeAí um backend real com **persistência**, **autenticação** e **CRUD** multi-tenant, substituindo (numa etapa seguinte) o estado em `localStorage`. Vários estabelecimentos coexistem; cada dono gerencia apenas o seu; um admin de plataforma vê tudo; o cliente faz pedidos **sem login**.

## 2. Atores e autenticação

- **Dono do estabelecimento** — autentica (Supabase Auth) e gerencia **somente** o próprio estabelecimento (perfil, cardápio, pedidos).
- **Admin da plataforma** — autentica e vê/gerencia todos os estabelecimentos (taxas, status) e métricas agregadas.
- **Cliente** — **anônimo**: lê cardápio e cria pedido sem conta (fiel ao fluxo do QR Code atual).

## 3. Decisão de arquitetura (Opção A)

Express com **`service_role`** + **verificação de JWT** + **escopo por middleware**; **RLS** como defesa em profundidade.

- Login feito no Supabase Auth → cliente recebe um JWT → envia no header `Authorization: Bearer <jwt>`.
- O Express valida o JWT (`supabase.auth.getUser`), resolve `user` + `role`, e acessa o Postgres com a **service key**, **sempre** filtrando pelo estabelecimento do usuário.
- Regras de negócio (cálculo de taxa, splits, transição de status) ficam centralizadas no Express.
- Endpoints públicos (ler cardápio, criar pedido) não exigem auth, mas são escopados pelo `establishment_id` da rota.

Alternativa considerada e descartada (Opção B): Express como proxy fino usando o JWT do usuário e deixando a RLS isolar tudo — dificultaria centralizar a regra de negócio e complicaria o pedido anônimo.

## 4. Stack

- **Node.js + Express + TypeScript** (espelha o frontend).
- **@supabase/supabase-js** (Auth + acesso a dados).
- **Zod** para validação de entrada.
- **Vitest** para testes.
- Camadas: `routes → controllers → services → db`.
- Pasta **`server/`** dentro do repo atual, com `package.json`, `tsconfig`, `eslint` e `.env` **independentes** do frontend.

## 5. Modelo de dados (Postgres)

- **`profiles`** — `id` (=`auth.users.id`), `role` (`owner` | `admin`), `name`, `created_at`. Criado por trigger no signup.
- **`establishments`** — raiz multi-tenant: `id`, `owner_id` → `auth.users`, `name`, `slug`, `tagline`, `description`, `address`, `hours`, `cover`, `logo`, `fee_pct`, `phone`, `email`, `website`, `whatsapp`, `instagram`, `plan` (`Básico`|`Pro`), `status` (`ativo`|`pendente`), `city`, `neighborhood`, `created_at`.
- **`menu_items`** — `id`, `establishment_id` → `establishments`, `name`, `description`, `price`, `old_price`, `emoji`, `photo`, `photo2`, `measure`, `unit`, `cat`, `sub`, `created_at`.
- **`orders`** — `id`, `establishment_id` → `establishments`, `display_seq` (nº sequencial por estabelecimento), `location`, `customer_name`, `status` (`aguardando`|`producao`|`entregue`), `payment_method`, `payment_label`, `total`, `fee`, `fee_pct`, `note`, `created_at`.
- **`order_items`** — `id`, `order_id` → `orders`, `name`, `qty`, `price`.
- **`order_splits`** — `id`, `order_id` → `orders`, `method` (nulo = não pago), `amount`, `position`.

Observações:
- Os "ícones" de pagamento são responsabilidade do frontend; o backend guarda apenas `method`/`label` (strings).
- `display_seq` por estabelecimento substitui o `orderSeq` do protótipo (atribuído no servidor ao criar o pedido).

## 6. RLS (defesa em profundidade)

- `establishments`: público lê os `ativo`; dono lê/edita o seu; admin tudo.
- `menu_items`: público lê os de estabelecimento `ativo`; dono gerencia os seus; admin tudo.
- `orders` / `order_items` / `order_splits`: público **insere** (pedido anônimo) escopado ao estabelecimento; dono lê/atualiza os do seu estabelecimento; admin tudo.

## 7. API (REST, prefixo `/api`)

**Auth (proxy fino p/ testes via curl):**
- `POST /auth/register` — cria dono + profile.
- `POST /auth/login` — retorna sessão/JWT do Supabase.
- `GET /auth/me` — perfil do usuário autenticado.

**Público (sem auth):**
- `GET /establishments` — ativos (para o "finder"; filtros por cidade/bairro).
- `GET /establishments/:id` — detalhe público.
- `GET /establishments/:id/menu` — cardápio.
- `POST /establishments/:id/orders` — cria pedido (anônimo; com itens e splits).

**Dono (auth, role owner):**
- `GET /me/establishment` · `PATCH /me/establishment` — perfil do próprio estabelecimento.
- `GET /menu-items` · `POST /menu-items` · `PATCH /menu-items/:id` · `DELETE /menu-items/:id`.
- `GET /orders` — pedidos do próprio estabelecimento (filtro por status).
- `PATCH /orders/:id` — muda status (ex.: → entregue).
- `POST /orders/:id/splits/:position/pay` — marca uma parte como paga (recalcula status quando 100% pago).

**Admin (auth, role admin):**
- `GET /admin/establishments` — todos.
- `PATCH /admin/establishments/:id` — taxa/status.
- `GET /admin/stats` — agregados simples (GMV, receita de fees, nº de pedidos, ticket médio, por método de pagamento).

## 8. Validação, erros e segurança

- **Zod** valida body/params/query em toda rota; erros retornam `400` com detalhes.
- Middleware de erro central → respostas JSON consistentes (`{ error, details? }`).
- Auth middleware: `requireAuth` (JWT válido) e `requireRole('admin')`.
- **Segredos:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` em `.env` (gitignored). Apenas `.env.example` é versionado. A service key **nunca** é commitada nem exposta ao cliente.

## 9. Migrations

- Schema versionado em `server/supabase/migrations/*.sql` (tabelas, índices, RLS, trigger de `profiles`, função de `display_seq`).
- Aplicado no projeto Supabase (criado via OAuth/MCP) e reaplicável.

## 10. Testes

- **Vitest** — unit nas regras de negócio (cálculo de taxa, total, lógica de splits/status, validação Zod).
- Alguns testes de endpoint (supertest) cobrindo os fluxos principais (criar pedido público; dono CRUD de cardápio; admin stats), contra um schema de desenvolvimento.

## 11. Execução e deploy

- **Local agora:** `npm run dev` (watch via `tsx`); validável por curl/REST.
- **Deploy:** etapa futura (ex.: Railway), fora do escopo desta entrega.

## 12. Estrutura de pastas (proposta)

```
server/
├── package.json · tsconfig.json · eslint.config.js · .env.example
├── src/
│   ├── index.ts                 # bootstrap do Express
│   ├── app.ts                   # montagem de middlewares/rotas
│   ├── config/env.ts            # leitura/validação de env (Zod)
│   ├── lib/supabase.ts          # clients (service + anon) e verificação de JWT
│   ├── middleware/              # auth, role, erro, validação
│   ├── modules/
│   │   ├── auth/                # register/login/me
│   │   ├── establishments/      # público + /me/establishment + admin
│   │   ├── menu/                # menu-items CRUD
│   │   ├── orders/             # criar (público) + gerenciar (dono)
│   │   └── admin/              # stats
│   └── types/                   # tipos de domínio do backend
├── supabase/migrations/*.sql
└── tests/
```

## 13. Fora de escopo (etapas futuras)

- Integração do frontend React (trocar `localStorage` por API + login Supabase).
- Upload real de imagens (Supabase Storage) — por ora, URLs/data-URLs como hoje.
- Importação de cardápio via CSV no servidor (já existe no frontend).
- Deploy em produção e CI do backend.
