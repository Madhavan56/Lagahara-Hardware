-- Admin v2: multiple admins (never zero), catalog guards, sheet calculator
-- fields, category images, atomic image RPCs, stock commitment on confirm.

-- =================================================================== roles

-- Replaces the "only one admin" rule with "never zero admins".
drop index if exists public.profiles_only_one_admin;
drop function if exists public.promote_user_to_admin(uuid);

-- Signups can never self-assign a role, even via a direct INSERT.
drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() and role = 'customer');

-- Existing trigger (update-only) keeps blocking non-admins from changing any
-- role, including their own. auth.uid() is null in the SQL editor, which is
-- how the first admin is created.

-- The last admin cannot be demoted or deleted, by anyone, by any path.
create or replace function public.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin') then
    -- Serialize so two admins can't demote each other at the same moment.
    perform pg_advisory_xact_lock(hashtextextended('public.profiles.admins', 0));
    if not exists (
      select 1 from public.profiles where role = 'admin' and id <> old.id
    ) then
      raise exception 'Cannot remove the last remaining admin'
        using errcode = 'check_violation';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger profiles_protect_last_admin
  before update of role or delete on public.profiles
  for each row execute function public.protect_last_admin();

-- "Manage admins": promote/demote a registered user by email.
create or replace function public.admin_set_user_role(p_email text, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target uuid;
begin
  if not public.is_admin() then
    raise exception 'Only administrators may change roles'
      using errcode = 'insufficient_privilege';
  end if;

  select id into target from auth.users where lower(email) = lower(btrim(p_email));
  if target is null then
    raise exception 'No registered account uses that email'
      using errcode = 'no_data_found';
  end if;

  update public.profiles set role = p_role where id = target;
end;
$$;

create or replace function public.admin_list_admins()
returns table (id uuid, email text, full_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id, u.email::text, p.full_name, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'admin' and public.is_admin()
  order by p.created_at;
$$;

revoke all on function public.admin_set_user_role(text, public.user_role) from public, anon;
revoke all on function public.admin_list_admins() from public, anon;
grant execute on function public.admin_set_user_role(text, public.user_role) to authenticated;
grant execute on function public.admin_list_admins() to authenticated;

-- ================================================================= catalog

alter table public.products
  add column is_sheet_product boolean not null default false,
  add column sheet_length_ft numeric(6, 2) check (sheet_length_ft > 0 and sheet_length_ft <= 20),
  add column sheet_width_ft numeric(6, 2) check (sheet_width_ft > 0 and sheet_width_ft <= 20),
  add column wastage_percent numeric(5, 2) not null default 10
    check (wastage_percent >= 0 and wastage_percent <= 50),
  add constraint products_sheet_dimensions check (
    not is_sheet_product or (sheet_length_ft is not null and sheet_width_ft is not null)
  ),
  add constraint products_name_length check (char_length(btrim(name)) between 2 and 200),
  add constraint products_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add constraint products_compare_above_price check (
    compare_at_price is null or compare_at_price > price
  );

-- Hard delete only when no order ever referenced the product (order_items
-- would otherwise silently lose the link via ON DELETE SET NULL).
create or replace function public.prevent_delete_ordered_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.order_items where product_id = old.id) then
    raise exception 'This product has orders. Hide it instead of deleting it.'
      using errcode = 'restrict_violation';
  end if;
  return old;
end;
$$;

create trigger products_prevent_delete_if_ordered
  before delete on public.products
  for each row execute function public.prevent_delete_ordered_product();

-- ================================================================== images

alter table public.product_images
  add constraint product_images_alt_length check (alt_text is null or char_length(alt_text) <= 200);

alter table public.categories
  add column image_path text,
  add column image_alt text check (image_alt is null or char_length(image_alt) <= 200);

-- Atomic replacements for the current two-step client calls.
create or replace function public.admin_set_primary_image(p_image_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = 'insufficient_privilege';
  end if;
  select product_id into pid from public.product_images where id = p_image_id;
  if pid is null then
    raise exception 'Image not found' using errcode = 'no_data_found';
  end if;
  update public.product_images set is_primary = false
    where product_id = pid and is_primary and id <> p_image_id;
  update public.product_images set is_primary = true where id = p_image_id;
end;
$$;

create or replace function public.admin_reorder_product_images(p_product_id uuid, p_image_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only' using errcode = 'insufficient_privilege';
  end if;
  update public.product_images pi
  set sort_order = o.ord - 1
  from unnest(p_image_ids) with ordinality as o(id, ord)
  where pi.id = o.id and pi.product_id = p_product_id;
end;
$$;

revoke all on function public.admin_set_primary_image(uuid) from public, anon;
revoke all on function public.admin_reorder_product_images(uuid, uuid[]) from public, anon;
grant execute on function public.admin_set_primary_image(uuid) to authenticated;
grant execute on function public.admin_reorder_product_images(uuid, uuid[]) to authenticated;

-- Public bucket URLs are served without a SELECT policy, so the public-read
-- policy only enables anonymous LISTING of every object name. Narrow it to
-- admins (storage remove/upsert also need SELECT, so admins must keep it).
drop policy if exists "product-images: public read" on storage.objects;
create policy "product-images: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- =================================================================== stock

-- Stock is currently checked at checkout but never decremented. Commit it when
-- an order is confirmed (COD at placement, online after verified payment);
-- give it back if a committed order is cancelled. The stock_quantity >= 0
-- check makes an oversell fail the confirming UPDATE instead of going negative.
alter table public.orders add column stock_committed boolean not null default false;

create or replace function public.commit_order_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' and not old.stock_committed then
    update public.products p
    set stock_quantity = p.stock_quantity - oi.quantity
    from (
      select product_id, sum(quantity) as quantity
      from public.order_items
      where order_id = new.id and product_id is not null
      group by product_id
    ) oi
    where oi.product_id = p.id;
    new.stock_committed := true;
  elsif new.status = 'cancelled' and old.status <> 'cancelled' and old.stock_committed then
    update public.products p
    set stock_quantity = p.stock_quantity + oi.quantity
    from (
      select product_id, sum(quantity) as quantity
      from public.order_items
      where order_id = new.id and product_id is not null
      group by product_id
    ) oi
    where oi.product_id = p.id;
    new.stock_committed := false;
  end if;
  return new;
end;
$$;

create trigger orders_commit_stock
  before update of status on public.orders
  for each row execute function public.commit_order_stock();
