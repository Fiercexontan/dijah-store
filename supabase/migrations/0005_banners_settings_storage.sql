-- PROMO BANNERS (homepage slideshow) -------------------------
create table public.promo_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_path text not null,
  link_url text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.promo_banners enable row level security;

create policy "public reads live banners" on public.promo_banners
  for select using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "admins manage banners" on public.promo_banners
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- STORE SETTINGS ---------------------------------------------
create table public.store_settings (
  key text primary key,
  value text not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "public reads public settings" on public.store_settings
  for select using (is_public);

create policy "admins manage settings" on public.store_settings
  for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

insert into public.store_settings (key, value, is_public) values
  ('store_name', 'DIJAH FASHION & ACCESSORIES', true),
  ('return_window_days', '7', true);

-- IMAGE STORAGE ----------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "admins upload images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins update images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

create policy "admins delete images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));