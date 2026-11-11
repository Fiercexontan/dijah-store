-- ORDERS -----------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('DJ-' || nextval('public.order_number_seq')::text),
  public_token text not null unique
    default replace(gen_random_uuid()::text, '-', ''),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'awaiting_arrival',
      'processing', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'failed', 'refunded')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  delivery_state text not null,
  delivery_town text not null,
  delivery_area text,
  delivery_address text not null,
  delivery_landmark text,
  delivery_lat numeric,
  delivery_lng numeric,
  subtotal_kobo integer not null check (subtotal_kobo >= 0),
  delivery_fee_kobo integer check (delivery_fee_kobo >= 0),
  delivery_fee_status text not null default 'to_be_confirmed'
    check (delivery_fee_status in ('to_be_confirmed', 'confirmed', 'paid', 'waived')),
  has_preorder boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  color_name text not null,
  size_label text not null,
  unit_price_kobo integer not null check (unit_price_kobo >= 0),
  quantity integer not null check (quantity > 0)
);

-- PAYMENTS ---------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'paystack',
  reference text not null unique,
  amount_kobo integer not null check (amount_kobo > 0),
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- Every payment event we receive, stored once, so repeats are ignored
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack',
  event_key text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- STOCK RESERVATIONS -----------------------------------------
create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  expires_at timestamptz not null,
  status text not null default 'active'
    check (status in ('active', 'confirmed', 'released', 'expired')),
  created_at timestamptz not null default now()
);

create index on public.order_items (order_id);
create index on public.payments (order_id);
create index on public.stock_reservations (variant_id, status);
create index on public.orders (status, created_at desc);

-- SECURITY ---------------------------------------------------
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.stock_reservations enable row level security;

-- No public access to any of these tables. Admins can read orders,
-- items, payments and reservations, and update orders. Nobody can
-- delete records from the browser. The server creates orders and
-- processes payments using the secret key, which bypasses these rules.

create policy "admins read orders" on public.orders
  for select to authenticated using ((select public.is_admin()));

create policy "admins update orders" on public.orders
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admins read order items" on public.order_items
  for select to authenticated using ((select public.is_admin()));

create policy "admins read payments" on public.payments
  for select to authenticated using ((select public.is_admin()));

create policy "admins read reservations" on public.stock_reservations
  for select to authenticated using ((select public.is_admin()));