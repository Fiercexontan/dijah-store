create or replace function public.create_order(
  p_name text,
  p_phone text,
  p_email text,
  p_state text,
  p_town text,
  p_area text,
  p_address text,
  p_landmark text,
  p_lat numeric,
  p_lng numeric,
  p_notes text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal integer := 0;
  v_has_preorder boolean := false;
  r record;
  v_row record;
  v_reserved integer;
  v_order record;
begin
  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 30 then
    raise exception 'invalid_cart';
  end if;

  -- Pass 1: lock each variant (sorted, so two orders can't deadlock) and check stock
  for r in
    select (i->>'variant_id')::uuid as variant_id,
           sum((i->>'quantity')::int) as qty
    from jsonb_array_elements(p_items) as i
    group by 1
    order by 1
  loop
    if r.qty < 1 or r.qty > 10 then
      raise exception 'invalid_quantity';
    end if;

    select v.id, v.stock_quantity, p.name, p.status, p.is_preorder
      into v_row
    from public.product_variants v
    join public.products p on p.id = v.product_id
    where v.id = r.variant_id
    for update of v;

    if not found then
      raise exception 'unavailable_item';
    end if;
    if v_row.status <> 'active' then
      raise exception 'unavailable_item';
    end if;

    if not v_row.is_preorder then
      select coalesce(sum(sr.quantity), 0) into v_reserved
      from public.stock_reservations sr
      where sr.variant_id = r.variant_id
        and sr.status = 'active'
        and sr.expires_at > now();

      if v_row.stock_quantity - v_reserved < r.qty then
        raise exception 'insufficient_stock: %', v_row.name;
      end if;
    end if;
  end loop;

  insert into public.orders (
    customer_name, customer_phone, customer_email,
    delivery_state, delivery_town, delivery_area,
    delivery_address, delivery_landmark,
    delivery_lat, delivery_lng, notes, subtotal_kobo
  ) values (
    p_name, p_phone, p_email,
    p_state, p_town, nullif(p_area, ''),
    p_address, nullif(p_landmark, ''),
    p_lat, p_lng, nullif(p_notes, ''), 0
  )
  returning id into v_order_id;

  -- Pass 2: write the items at the prices stored in the database, and reserve stock
  for r in
    select (i->>'variant_id')::uuid as variant_id,
           sum((i->>'quantity')::int) as qty
    from jsonb_array_elements(p_items) as i
    group by 1
    order by 1
  loop
    select v.id, v.size_label, c.name as color_name, p.name, p.is_preorder,
           coalesce(p.sale_price_kobo, p.price_kobo) as price
      into v_row
    from public.product_variants v
    join public.product_colors c on c.id = v.color_id
    join public.products p on p.id = v.product_id
    where v.id = r.variant_id;

    insert into public.order_items (
      order_id, variant_id, product_name, color_name,
      size_label, unit_price_kobo, quantity
    ) values (
      v_order_id, v_row.id, v_row.name, v_row.color_name,
      v_row.size_label, v_row.price, r.qty
    );

    v_subtotal := v_subtotal + v_row.price * r.qty;

    if v_row.is_preorder then
      v_has_preorder := true;
    else
      insert into public.stock_reservations (
        order_id, variant_id, quantity, expires_at
      ) values (
        v_order_id, v_row.id, r.qty, now() + interval '15 minutes'
      );
    end if;
  end loop;

  update public.orders
  set subtotal_kobo = v_subtotal, has_preorder = v_has_preorder
  where id = v_order_id;

  select o.id, o.order_number, o.public_token, o.subtotal_kobo
    into v_order
  from public.orders o
  where o.id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'public_token', v_order.public_token,
    'subtotal_kobo', v_order.subtotal_kobo
  );
end;
$$;

-- Only our server (using the secret key) may call this. Never the browser.
revoke all on function public.create_order(
  text, text, text, text, text, text, text, text, numeric, numeric, text, jsonb
) from public, anon, authenticated;

grant execute on function public.create_order(
  text, text, text, text, text, text, text, text, numeric, numeric, text, jsonb
) to service_role;