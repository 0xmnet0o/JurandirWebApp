-- ===== profiles =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  name text,
  created_at timestamptz not null default now()
);

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

create function public.next_display_seq(p_estab uuid) returns integer
language sql as $$
  select coalesce(max(display_seq), 0) + 1 from public.orders where establishment_id = p_estab;
$$;

-- ===== RLS =====
-- Modelo de acesso (Opção A): TODO acesso a dados passa pelo backend Express
-- usando a SERVICE ROLE, que ignora RLS. O frontend NÃO fala direto com o
-- Supabase. Portanto habilitamos RLS em todas as tabelas e NÃO criamos policies
-- para os papéis `anon`/`authenticated` — o padrão do Postgres com RLS ligada e
-- sem policy é NEGAR tudo para esses papéis (a service role continua passando).
--
-- Isso evita:
--   * exposição de PII/identificadores financeiros (cpf_cnpj, asaas_account_id,
--     asaas_wallet_id, owner_id, e-mail, telefone) — RLS é por linha, não por
--     coluna, então um `select` público vazaria a linha inteira;
--   * inserção pública arbitrária de pedidos (total/fee/estabelecimento forjados)
--     e adulteração cross-tenant.
--
-- Se no futuro o frontend precisar falar DIRETO com o Supabase, criar policies
-- escopadas por `auth.uid()` E uma VIEW pública contendo apenas colunas seguras
-- (sem cpf_cnpj/asaas_*), além de revogar `select` direto na tabela base.

alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_splits enable row level security;

-- Defesa extra: garantir que os papéis de cliente não tenham privilégios de tabela
-- (mesmo sem policy, RLS já negaria; revogar torna a intenção explícita).
revoke all on public.profiles, public.establishments, public.menu_items,
  public.orders, public.order_items, public.order_splits from anon, authenticated;
