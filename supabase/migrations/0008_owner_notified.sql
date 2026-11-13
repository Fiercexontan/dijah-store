alter table public.orders
  add column if not exists owner_notified_at timestamptz;