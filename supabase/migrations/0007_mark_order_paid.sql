-- Orders can be flagged for the owner's attention (for example, a stock problem)
alter table public.orders
  add column if not exists needs_attention boolean not null default false,
  add column if not exists attention_note text;

create or replace function public.mark_order_paid(
  p_reference text,
  p_amount_kobo integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pay record;
  v_order record;
  r record;
  v_updated integer;
  v_note text := '';
begin
  -- Lock the payment row, so two simultaneous confirmations can't both run
  select * into v_pay
  from public.payments
  where reference = p_reference
  for update;

  if not found then
    raise exception 'payment_not_found';
  end if;

  select * into v_order
  from public.orders
  where id = v_pay.order_id
  for update;

  -- Already processed: do nothing, and say so
  if v_pay.status = 'success' then
    return jsonb_build_object(
      'ok', true,
      'already_processed', true,
      'order_id', v_order.id,
      'order_number', v_order.order_number,
      'needs_attention', v_order.needs_attention
    );
  end if;

  -- The amount Paystack received must match exactly what we asked for
  if p_amount_kobo <> v_pay.amount_kobo then
    raise exception 'amount_mismatch';
  end if;

  -- Turn the reservations into real stock deductions
  for r in
    select sr.id, sr.variant_id, sr.quantity
    from public.stock_reservations sr
    where sr.order_id = v_order.id and sr.status = 'active'
    order by sr.variant_id
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - r.quantity
    where id = r.variant_id and stock_quantity >= r.quantity;

    get diagnostics v_updated = row_count;

    if v_updated = 0 then
      v_note := v_note || 'Not enough stock for: ' || coalesce(
        (select oi.product_name || ' (' || oi.color_name || ', ' || oi.size_label || ')'
           from public.order_items oi
          where oi.order_id = v_order.id and oi.variant_id = r.variant_id
          limit 1),
        'an item'
      ) || '. ';
    end if;

    update public.stock_reservations set status = 'confirmed' where id = r.id;
  end loop;

  if v_order.status = 'cancelled' then
    v_note := v_note || 'Payment arrived after the order was cancelled. ';
  end if;

  update public.orders
  set payment_status = 'paid',
      status = case when v_order.status = 'cancelled' then 'cancelled'
                    when v_order.has_preorder then 'awaiting_arrival'
                    else 'paid' end,
      paid_at = now(),
      updated_at = now(),
      needs_attention = (v_note <> ''),
      attention_note = nullif(trim(v_note), '')
  where id = v_order.id;

  update public.payments
  set status = 'success', paid_at = now()
  where id = v_pay.id;

  return jsonb_build_object(
    'ok', true,
    'already_processed', false,
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'needs_attention', (v_note <> '')
  );
end;
$$;

-- Only our server (using the secret key) may call this
revoke all on function public.mark_order_paid(text, integer)
  from public, anon, authenticated;
grant execute on function public.mark_order_paid(text, integer)
  to service_role;