# Jurandir — Backend (PedeAí) — Design

**Data:** 2026-06-27
**Status:** Em revisão (v2 — inclui integrações Asaas, e-mail e WhatsApp)
**Escopo desta etapa:** apenas o backend. O frontend React permanece no `localStorage`; a integração frontend↔backend é uma etapa futura.

## 1. Objetivo

Dar ao app PedeAí um backend real com **persistência**, **autenticação**, **CRUD** multi-tenant e **pagamentos reais via Asaas** (com split por estabelecimento), além de **notificações** (recibo por e-mail e confirmação por WhatsApp ao estabelecimento) quando o pagamento é confirmado.

## 2. Atores e autenticação

- **Dono do estabelecimento** — autentica (Supabase Auth) e gerencia **somente** o próprio estabelecimento (perfil, cardápio, pedidos, onboarding Asaas).
- **Admin da plataforma** — autentica e vê/gerencia todos os estabelecimentos (taxas, status, onboarding) e métricas agregadas.
- **Cliente** — **anônimo**: lê cardápio, cria pedido e paga (sem conta).

## 3. Decisão de arquitetura (Opção A)

Express com **`service_role`** + **verificação de JWT** + **escopo por middleware**; **RLS** como defesa em profundidade. Integrações externas atrás de **interfaces (portas/adaptadores)**.

- Login no Supabase Auth → JWT → header `Authorization: Bearer <jwt>`.
- Express valida o JWT (`supabase.auth.getUser`), resolve `user`+`role`, acessa o Postgres com a **service key**, sempre escopando pelo estabelecimento do usuário.
- Regra de negócio (taxa, split, transição de status) centralizada no Express.
- Endpoints públicos (ler cardápio, criar pedido, pagar) não exigem auth, mas são escopados pelo `establishment_id`.

## 4. Stack

- **Node.js + Express + TypeScript**.
- **@supabase/supabase-js** (Auth + dados), **Zod** (validação), **Vitest** (testes).
- Integrações: **Asaas** (pagamentos + subcontas/split), **Resend** (e-mail), **Twilio** (WhatsApp).
- Camadas: `routes → controllers → services → {db, integrations}`.
- Pasta **`server/`** no repo atual, com toolchain independente do frontend.

## 5. Modelo de dados (Postgres)

- **`profiles`** — `id` (=`auth.users.id`), `role` (`owner`|`admin`), `name`, `created_at`.
- **`establishments`** — raiz multi-tenant: `id`, `owner_id`, `name`, `slug`, `tagline`, `description`, `address`, `hours`, `cover`, `logo`, `fee_pct`, `phone`, `email`, `website`, `whatsapp`, `instagram`, `plan`, `status`, `city`, `neighborhood`, `created_at`.
  - **Asaas:** `cpf_cnpj`, `asaas_account_id`, `asaas_wallet_id`, `asaas_onboarding_status` (`pendente`|`ativo`|`erro`).
- **`menu_items`** — `id`, `establishment_id`, `name`, `description`, `price`, `old_price`, `emoji`, `photo`, `photo2`, `measure`, `unit`, `cat`, `sub`, `created_at`.
- **`orders`** — `id`, `establishment_id`, `display_seq`, `location`, `customer_name`, `status` (`aguardando`|`producao`|`entregue`), `total`, `fee`, `fee_pct`, `note`, `created_at`.
- **`order_items`** — `id`, `order_id`, `name`, `qty`, `price`.
- **`order_splits`** — `id`, `order_id`, `method`, `amount`, `position` (conta dividida no nível do app).
- **`charges`** — pagamento Asaas por pedido: `id`, `order_id`, `asaas_charge_id`, `billing_type` (`PIX`|`CREDIT_CARD`|`BOLETO`), `value`, `platform_fee`, `status` (`PENDING`|`CONFIRMED`|`RECEIVED`|`OVERDUE`|`REFUNDED`), `invoice_url`, `pix_payload`, `created_at`, `paid_at`.
- **`notifications`** — outbox de notificações: `id`, `order_id`, `channel` (`email`|`whatsapp`), `status` (`pending`|`sent`|`failed`), `provider_message_id`, `attempts`, `last_error`, `created_at`, `sent_at`.

Notas:
- O backend guarda só `method`/`label` de pagamento do app; ícones são do frontend.
- `display_seq` por estabelecimento substitui o `orderSeq` do protótipo.
- O **outbox `notifications`** torna o disparo confiável (resposta rápida ao webhook + reprocessamento de falhas).

## 6. RLS (defesa em profundidade)

- `establishments`: público lê `ativo`; dono lê/edita o seu; admin tudo. Campos Asaas só visíveis ao dono/admin.
- `menu_items`: público lê de estabelecimento `ativo`; dono gerencia os seus; admin tudo.
- `orders`/`order_items`/`order_splits`: público **insere** (pedido anônimo) escopado ao estabelecimento; dono lê/atualiza os seus; admin tudo.
- `charges`/`notifications`: sem acesso público; manipuladas pelo backend (service role); dono/admin leem as suas.

## 7. Integrações (portas & adaptadores)

Interfaces no domínio, implementações isoladas e trocáveis:

- **`PaymentGateway`** → `AsaasGateway`
  - `createSubaccount(establishment)` → cria subconta + retorna `accountId`/`walletId` (onboarding).
  - `createCharge(order, { billingType, splitWalletId, feePct })` → cria cobrança na conta da plataforma com **`split`** para o `walletId` do estabelecimento (estabelecimento recebe `total*(1-fee/100)`, plataforma retém a taxa). Retorna `invoiceUrl`/Pix.
  - `verifyWebhook(req)` + `parseWebhook(body)` → valida token e normaliza o evento.
- **`EmailSender`** → `ResendEmailSender` — `sendReceipt(establishmentEmail, order, charge)`.
- **`WhatsAppSender`** → `TwilioWhatsAppSender` — `sendOrderConfirmation(establishmentWhatsApp, order, charge)`.
- **`NotificationService`** — no pagamento confirmado, grava itens no outbox e dispara e-mail + WhatsApp; registra `sent`/`failed` com retry.

Fluxo de pagamento:
1. Cliente cria pedido (`status=aguardando`) → backend cria **charge** no Asaas (split p/ a subconta) → retorna `invoiceUrl`/Pix ao cliente.
2. Cliente paga → Asaas chama **webhook**.
3. Webhook valida, marca `charge`/`order` como pagos (`status=producao`), responde 200 rápido.
4. `NotificationService` envia **recibo por e-mail** (Resend) e **confirmação por WhatsApp** (Twilio) ao estabelecimento, registrando no outbox.

## 8. API (REST, prefixo `/api`)

**Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.

**Público (sem auth):**
- `GET /establishments` · `GET /establishments/:id` · `GET /establishments/:id/menu`.
- `POST /establishments/:id/orders` — cria pedido (anônimo) **e** a cobrança Asaas; retorna o pedido + dados de pagamento (`invoiceUrl`/Pix).
- `GET /orders/:id/payment` — status/dados de pagamento de um pedido (para polling do cliente).

**Dono (auth, role owner):**
- `GET/PATCH /me/establishment`.
- `POST /me/establishment/asaas-onboarding` — cria/atualiza a subconta Asaas do estabelecimento.
- CRUD `/menu-items`.
- `GET /orders` · `PATCH /orders/:id` (status) · `POST /orders/:id/splits/:position/pay`.

**Admin (auth, role admin):**
- `GET /admin/establishments` · `PATCH /admin/establishments/:id` (taxa/status).
- `GET /admin/stats` (GMV, receita de fees, nº de pedidos, ticket médio, por método).

**Webhook (sem auth de usuário; token próprio):**
- `POST /webhooks/asaas` — recebe eventos de pagamento; valida token; idempotente por `asaas_charge_id`+evento.

## 9. Validação, erros e segurança

- **Zod** em body/params/query; erros `400` com detalhes; middleware de erro central (`{ error, details? }`).
- `requireAuth` e `requireRole('admin')`.
- **Webhook**: validação de token do Asaas + **idempotência** (não reprocessa o mesmo evento).
- **Segredos** em `.env` (gitignored; só `.env.example` versionado): `SUPABASE_*` (inclui service key), `ASAAS_API_KEY`+`ASAAS_BASE_URL`(sandbox)+`ASAAS_WEBHOOK_TOKEN`, `RESEND_API_KEY`+`EMAIL_FROM`, `TWILIO_ACCOUNT_SID`+`TWILIO_AUTH_TOKEN`+`TWILIO_WHATSAPP_FROM`. **Nenhuma** chave é commitada ou exposta ao cliente.
- Não armazenamos a API key de cada subconta — apenas `account_id`/`wallet_id`.

## 10. Migrations

- Schema versionado em `server/supabase/migrations/*.sql` (tabelas, índices, RLS, trigger de `profiles`, função de `display_seq`).

## 11. Testes

- **Vitest** — unit nas regras: cálculo de total/taxa, **cálculo do split** (valor da subconta vs taxa retida), validação Zod, normalização do webhook, transição de status.
- Integrações **mockadas** nos testes (sem chamar Asaas/Resend/Twilio reais); adaptadores testados contra contratos/fakes.
- Alguns testes de endpoint (supertest): criar pedido+cobrança (gateway fake), webhook → marca pago + enfileira notificações, dono CRUD de cardápio, admin stats.

## 12. Execução e deploy

- **Local agora:** `npm run dev` (watch via `tsx`); webhook testável com túnel (ex.: ngrok) apontando para o sandbox do Asaas; validável por curl/REST.
- **Deploy:** etapa futura (ex.: Railway).

## 13. Estrutura de pastas (proposta)

```
server/
├── package.json · tsconfig.json · eslint.config.js · .env.example
├── src/
│   ├── index.ts · app.ts
│   ├── config/env.ts            # env validado por Zod
│   ├── lib/supabase.ts          # clients + verificação de JWT
│   ├── middleware/              # auth, role, erro, validação
│   ├── integrations/
│   │   ├── payments/            # PaymentGateway + AsaasGateway
│   │   ├── email/               # EmailSender + ResendEmailSender
│   │   ├── whatsapp/            # WhatsAppSender + TwilioWhatsAppSender
│   │   └── notifications/       # NotificationService (outbox)
│   ├── modules/
│   │   ├── auth/ · establishments/ · menu/ · orders/ · admin/
│   │   └── webhooks/            # asaas
│   └── types/
├── supabase/migrations/*.sql
└── tests/
```

## 14. Faseamento da implementação

- **F1 — Núcleo:** Auth + CRUD (establishments, menu, orders), RLS, migrations, testes. (Pagamento/notif. ainda mockados.)
- **F2 — Pagamentos Asaas:** onboarding de subconta + criação de cobrança com split + webhook + tabela `charges`.
- **F3 — Notificações:** `NotificationService` + Resend (recibo) + Twilio (WhatsApp) + outbox e retry.

## 15. Fora de escopo (futuro)

- Integração do frontend React (trocar `localStorage` por API + login Supabase + UI de pagamento). **Requisito a preservar:** o app é acessado por smartphone (QR Code) e deve permanecer **responsivo/mobile-first** — o frontend atual já é; qualquer UI nova (ex.: tela de pagamento Asaas) deve seguir o mesmo padrão.
- KYC completo/upload de documentos no onboarding Asaas (além do mínimo de sandbox).
- Upload real de imagens (Supabase Storage); import CSV no servidor.
- Deploy em produção e CI do backend; fila/worker dedicado para notificações (por ora, outbox + retry simples).
