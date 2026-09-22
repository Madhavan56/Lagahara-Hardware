-- Row Level Security. Default posture: deny everything, then grant the
-- narrowest workable policy per table.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_attributes enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_events enable row level security;
alter table public.reviews enable row level security;

-- ---------------------------------------------------------------- profiles

create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- RLS cannot restrict individual columns, so a trigger guards the role column:
-- without this, a customer could PATCH their own profile to role = 'admin'.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only administrators may change account roles'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- -------------------------------------------------------- catalog (public)

create policy "categories: public read active"
  on public.categories for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "categories: admin write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "category_attributes: public read"
  on public.category_attributes for select
  to anon, authenticated
  using (true);

create policy "category_attributes: admin write"
  on public.category_attributes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products: public read active"
  on public.products for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "products: admin write"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_images: public read"
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_active or public.is_admin())
    )
  );

create policy "product_images: admin write"
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "shipping_methods: public read active"
  on public.shipping_methods for select
  to anon, authenticated
  using (is_active or public.is_admin());

create policy "shipping_methods: admin write"
  on public.shipping_methods for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------- per-customer resources

create policy "addresses: own rows"
  on public.addresses for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "cart_items: own rows"
  on public.cart_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "wishlist_items: own rows"
  on public.wishlist_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------------ orders
-- Deliberately no INSERT/UPDATE policy for customers. Orders are created and
-- mutated only by the Edge Functions (service_role, which bypasses RLS) so
-- totals and payment state can never be set from the browser.

create policy "orders: read own"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin update"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items: read own"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_status_events: read own"
  on public.order_status_events for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "order_status_events: admin write"
  on public.order_status_events for insert
  to authenticated
  with check (public.is_admin());

-- Customer-facing cancellation, allowed only while the order is still pending.
create or replace function public.cancel_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.orders;
begin
  update public.orders
  set status = 'cancelled'
  where id = p_order_id
    and user_id = auth.uid()
    and status = 'pending'
  returning * into result;

  if result.id is null then
    raise exception 'Order cannot be cancelled'
      using errcode = 'check_violation';
  end if;

  return result;
end;
$$;

revoke execute on function public.cancel_order(uuid) from public;
grant execute on function public.cancel_order(uuid) to authenticated;

-- ----------------------------------------------------------------- reviews

create policy "reviews: public read approved"
  on public.reviews for select
  to anon, authenticated
  using (is_approved or user_id = auth.uid() or public.is_admin());

-- Only verified purchasers may review, and only what they actually received.
create policy "reviews: insert verified purchase"
  on public.reviews for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = reviews.product_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
    )
  );

create policy "reviews: update own"
  on public.reviews for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "reviews: delete own"
  on public.reviews for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());
