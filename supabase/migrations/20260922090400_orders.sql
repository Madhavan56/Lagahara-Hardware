-- Orders, line items and the status timeline used for order tracking.

create sequence public.order_number_seq start 1000;

create or replace function public.next_order_number()
returns text
language sql
volatile
as $$
  select 'DHJ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
$$;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.next_order_number(),
  user_id uuid not null references auth.users (id) on delete restrict,

  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',

  subtotal numeric(12, 2) not null check (subtotal >= 0),
  shipping_amount numeric(12, 2) not null default 0 check (shipping_amount >= 0),
  tax_amount numeric(12, 2) not null default 0 check (tax_amount >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total numeric(12, 2) not null check (total >= 0),
  currency text not null default 'INR',

  -- Shipping is stored as a SNAPSHOT, not just a reference: admins may later
  -- change the price or name of a method, and historical orders must not move.
  shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  shipping_method_code text not null,
  shipping_method_name text not null,
  shipping_method_description text,
  shipping_eta_days_min integer not null,
  shipping_eta_days_max integer not null,

  -- Address is likewise snapshotted; editing the address book must not rewrite
  -- where a past order was actually sent.
  shipping_address jsonb not null,

  razorpay_order_id text unique,
  razorpay_payment_id text unique,

  customer_note text,
  placed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_payment_status_idx on public.orders (payment_status);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  -- Kept for reporting, but every display field below is snapshotted so the
  -- order still renders correctly if the product is renamed, repriced or removed.
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_sku text not null,
  product_image_path text,
  unit_label text not null default 'piece',
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  gst_rate numeric(5, 2) not null default 18.00,
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  attributes_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_status_events_order_idx
  on public.order_status_events (order_id, created_at desc);

-- Every status change lands on the tracking timeline automatically.
create or replace function public.record_order_status_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_events (order_id, status, created_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

create trigger orders_record_status_event
  after insert or update of status on public.orders
  for each row execute function public.record_order_status_event();
