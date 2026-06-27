# Integração Frontend ↔ Backend (PedeAí) — Design

**Data:** 2026-06-27
**Status:** Em revisão
**Objetivo:** fazer o site público (GitHub Pages) funcionar contra o **backend real** (Express no Railway + Supabase) — login, cardápio, pedidos, admin e pedido do cliente usando dados reais, em vez do `localStorage`.

## 1. Arquitetura

```
Navegador (GitHub Pages, estático)
        │  HTTPS (fetch, JWT no header quando logado)
        ▼
Express API (Railway, HTTPS público)  ──►  Supabase (Postgres + Auth)
```

- O frontend fala **somente com a nossa API** (abordagem A): inclusive login via `POST /api/auth/login`, guardando o `access_token` retornado. **Sem `supabase-js` no frontend.**
- Cliente (pedido) é anônimo (sem token); dono/admin enviam `Authorization: Bearer <jwt>`.
- A **service key** vive só no Railway (env do serviço) — nunca no frontend nem no repo.

## 2. Decomposição

### Sub-projeto 1 — Deploy do backend + seed (pré-requisito)

**Deploy (Railway):**
- Serviço Node a partir da pasta `server/`. Install `npm install`; start `npm start` (`node --import tsx src/index.ts`). Railway injeta `PORT` (já lido por `getEnv()`).
- Env no painel do Railway: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS`, `NODE_ENV=production`.
- Health check: `/health`.

**Adições no backend:**
- **CORS por env:** `CORS_ORIGINS` (lista separada por vírgula). Default em dev: `*`/localhost; em produção: `https://0xmnet0o.github.io`. Atualizar `config/env.ts` (campo opcional) e `app.ts` (usar a lista).
- **`GET /orders/:id` (público):** retorna status + itens + splits + `display_seq` + `total`/`fee` de um pedido (para o cliente acompanhar). Ids são UUID não-adivinháveis; não expõe dados internos do estabelecimento. (Sem auth.)
- **Seed (`server/scripts/seed.ts`, idempotente):** cria
  - dono demo `contato@quiosquedomar.com.br` / `demo1234`;
  - admin demo `admin@pedeai.com.br` / `admin1234` (role `admin` em `profiles`);
  - estabelecimento **Quiosque do Mar** (status `ativo`, `fee_pct` 8, dados do `INITIAL_RESTAURANT`);
  - cardápio a partir do `INITIAL_MENU` do frontend.
  - Script de npm `seed` (`tsx scripts/seed.ts`). Reexecutável sem duplicar (verifica existência por e-mail/slug).

**Verificação Sub-1:** `GET /health` público → 200; `GET /api/establishments` retorna o Quiosque do Mar; `GET /api/establishments/:id/menu` retorna os itens; login demo retorna JWT.

### Sub-projeto 2 — Integração do frontend

- **Config:** `VITE_API_URL` (URL do Railway), injetada no build do Pages via **GitHub Actions Variable** `VITE_API_URL` (não é segredo — URL pública). No dev, default `http://localhost:3333`.
- **Cliente de API** (`src/lib/api.ts`): wrapper de `fetch` com base URL, JSON, tratamento de erro, e header `Authorization` quando há token.
- **Sessão/Auth:** guardar o `access_token` (de `/api/auth/login`) em memória + `localStorage`; hook `useAuth` para login/logout/estado. Telas de login do Restaurante/Admin passam a chamar a API.
- **Adaptadores** (`src/lib/adapters.ts`): mapear `snake_case` do banco ↔ shapes do front (ex.: `old_price`↔`oldPrice`, `fee_pct`↔`platformFee/feePct`, `created_at`↔`ts: Date`, pagamento string ↔ objeto com ícone).
- **Substituir o `AppStore`** (dados em memória/localStorage) por dados da API nos fluxos:
  - **Landing finder** → `GET /establishments` (filtros cidade/bairro).
  - **Cliente** → `GET /establishments/:id/menu`; criar pedido `POST /establishments/:id/orders` com `{ menu_item_id, qty }`; "meus pedidos" via `GET /orders/:id` (ids guardados localmente).
  - **Restaurante** → login real; `GET/PATCH /me/establishment`; CRUD `/menu-items`; `GET /orders` + `PATCH /orders/:id` + splits/pay.
  - **Admin** → `GET /admin/establishments`, `PATCH`, `GET /admin/stats`.
- **Estados de carregamento/erro** nas telas que passam a buscar dados remotamente.

**Verificação Sub-2:** no link do Pages — login demo funciona; cardápio vem da API; pedido do cliente persiste no Supabase e aparece no painel do dono; admin vê stats. Testado também em viewport mobile (390×844).

## 3. Segurança

- Service key só no Railway. Frontend nunca recebe service/anon key (abordagem A).
- CORS restrito à origem do Pages em produção.
- Preço do pedido é autoritativo no backend (cliente envia só `menu_item_id`+`qty`).
- `GET /orders/:id` exposto por UUID (aceitável para demo); não retorna PII do estabelecimento.

## 4. Fora de escopo

- F2 (Asaas) e F3 (notificações).
- Cadastro público de novos clientes (cliente segue anônimo).
- Upload real de imagens (segue por URL/data-URL).

## 5. Sequência

1. **Sub-projeto 1** (deploy + seed) — requer sua conta Railway + setar env no painel.
2. **Sub-projeto 2** (integração do frontend) — após termos a URL pública do backend.
