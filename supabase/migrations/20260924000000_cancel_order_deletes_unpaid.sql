-- cancel_order semantics update:
--   • pending + unpaid  → the order is DELETED (order_items cascade), so it
--     vanishes from the customer's order history instead of lingering as a
--     cancelled row. Used by checkout dismissals and "cancel" on an unpaid order.
--   • pending + paid    → marked 'cancelled' (kept for refund/audit trail).
--   • anything else     → rejected.

create or replace function public.cancel_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.orders;
begin
  select * into result
  from public.orders
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'pending'
  for update;

  if result.id is null then
    raise exception 'Order cannot be cancelled'
      using errcode = 'check_violation';
  end if;

  if result.payment_status = 'pending' then
    delete from public.orders where id = result.id;
    return result;
  end if;

  update public.orders
  set status = 'cancelled'
  where id = result.id
  returning * into result;

  return result;
end;
$$;

revoke execute on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;
