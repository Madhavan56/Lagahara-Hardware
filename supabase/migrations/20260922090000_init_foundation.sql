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
