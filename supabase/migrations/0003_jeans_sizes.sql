alter table public.categories
  drop constraint categories_size_type_check;

alter table public.categories
  add constraint categories_size_type_check
  check (size_type in ('clothing', 'shoe', 'waist', 'clothing_waist', 'none'));

update public.categories
set size_type = 'clothing_waist'
where slug = 'jeans';