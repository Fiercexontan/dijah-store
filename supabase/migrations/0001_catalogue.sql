-- ADMIN CHECK ------------------------------------------------
create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);
alter table public.admin_profiles enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = (select auth.uid())
  );
$$;

create policy "admins read own profile" on public.admin_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- CATEGORIES -------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  size_type text not null default 'none'
    check (size_type in ('clothing', 'shoe', 'none')),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PRODUCTS ---------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  description text,
  price_kobo integer not null check (price_kobo >= 0),
  sale_price_kobo integer,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  is_preorder boolean not null default false,
  expected_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sale_price_kobo is null or
         (sale_price_kobo >= 0 and sale_price_kobo < price_kobo))
);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  unique (product_id, name)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid references public.product_colors(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid not null references public.product_colors(id) on delete cascade,
  size_label text not null,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  unique (product_id, color_id, size_label)
);

create index on public.products (category_id);
create index on public.product_colors (product_id);
create index on public.product_images (product_id);
create index on public.product_variants (product_id);

-- SECURITY: ROW LEVEL SECURITY --------------------------------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

-- Visitors can read only what is live
create policy "public reads active categories" on public.categories
  for select using (is_active);

create policy "public reads active products" on public.products
  for select using (status = 'active');

create policy "public reads colors of active products" on public.product_colors
  for select using (exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'active'));

create policy "public reads images of active products" on public.product_images
  for select using (exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'active'));

create policy "public reads variants of active products" on public.product_variants
  for select using (exists (
    select 1 from public.products p
    where p.id = product_id and p.status = 'active'));

-- Admins can do everything
create policy "admins manage categories" on public.categories
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admins manage products" on public.products
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admins manage colors" on public.product_colors
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admins manage images" on public.product_images
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admins manage variants" on public.product_variants
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));