-- Foundation: extensions, enums, shared helpers.

create extension if not exists pg_trgm;

create type public.user_role as enum ('customer', 'admin');

create type public.attribute_data_type as enum ('text', 'number', 'boolean', 'select');

create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Profiles are read inside RLS policies on other tables, so this must be
-- security definer: a plain query here would recurse through profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
