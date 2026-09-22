-- Admin needs to identify who placed an order. auth.users isn't exposed to
-- PostgREST and profiles carries no email, so — same reasoning as the
-- shipping/address snapshots — capture it on the order at creation time
-- instead of trying to join to it later.

alter table public.orders add column customer_email text;
alter table public.orders add column customer_name text;
