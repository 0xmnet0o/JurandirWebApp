-- Código curto e único por pedido (ex.: PED-7F3A9C2D), além do id UUID.
-- Gerado pelo backend ao criar o pedido. Índice único como garantia.
alter table public.orders add column if not exists code text;
create unique index if not exists orders_code_idx on public.orders(code);
