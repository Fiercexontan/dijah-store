insert into public.categories (name, slug, size_type, sort_order) values
  ('Clothing', 'clothing', 'none', 1),
  ('Shoes', 'shoes', 'none', 2);

insert into public.categories (parent_id, name, slug, size_type, sort_order)
select (select id from public.categories where slug = 'clothing'),
       name, slug, 'clothing', sort_order
from (values
  ('Tops', 'tops', 1),
  ('Dresses & Gowns', 'dresses-gowns', 2),
  ('Two-piece Sets', 'two-piece-sets', 3),
  ('Jeans', 'jeans', 4),
  ('Jackets & Cover-ups', 'jackets-cover-ups', 5)
) as t(name, slug, sort_order);

insert into public.categories (parent_id, name, slug, size_type, sort_order)
select (select id from public.categories where slug = 'shoes'),
       name, slug, 'shoe', sort_order
from (values
  ('Sneakers', 'sneakers', 1),
  ('Sandals', 'sandals', 2),
  ('Heels & Mules', 'heels-mules', 3)
) as t(name, slug, sort_order);