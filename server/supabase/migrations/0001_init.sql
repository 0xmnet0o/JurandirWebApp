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
alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_splits enable row level security;

create policy profiles_self on public.profiles for select using (auth.uid() = id);

create policy estab_public_read on public.establishments for select using (status = 'ativo');
create policy estab_owner_all on public.establishments for all
  using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy menu_public_read on public.menu_items for select using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.status = 'ativo')
);
create policy menu_owner_all on public.menu_items for all using (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
) with check (
  exists (select 1 from public.establishments e where e.id = establishment_id and e.owner_id = auth.uid())
);

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
