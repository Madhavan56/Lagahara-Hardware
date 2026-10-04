-- Promo codes: a coupon catalogue, a per-order redemption ledger, and a
-- SECURITY DEFINER validator the storefront calls to preview a code.
--
-- Design notes:
--   * Coupon rows are NOT publicly readable. If they were, anyone could list
--     every active code straight off the REST endpoint. The storefront learns
--     about a code only by submitting it to public.validate_coupon().
--   * The validator is advisory. create-order re-runs the same rules
--     server-side before writing discount_amount, so a tampered client can
--     never award itself a discount.
--   * orders.discount_amount already exists; this adds only the snapshot of
--     which coupon produced it.

create type public.coupon_discount_type as enum ('percent', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  -- Stored uppercase so lookups are case-insensitive without a functional index.
  code text not null unique check (code = upper(code) and length(code) between 3 and 32),
  description text,

  discount_type public.coupon_discount_type not null,
  discount_value numeric(12, 2) not null check (discount_value > 0),
  -- Caps a percent coupon in rupees. Ignored for fixed coupons.
  max_discount_amount numeric(12, 2) check (max_discount_amount is null or max_discount_amount > 0),
  min_order_amount numeric(12, 2) not null default 0 check (min_order_amount >= 0),

  starts_at timestamptz,
  ends_at timestamptz,

  -- null = unlimited.
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  max_redemptions_per_user integer not null default 1 check (max_redemptions_per_user > 0),
  -- Maintained by the redemption trigger, never written by hand.
  redemption_count integer not null default 0 check (redemption_count >= 0),

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coupons_percent_range
    check (discount_type <> 'percent' or discount_value <= 100),
  constraint coupons_window
    check (starts_at is null or ends_at is null or ends_at > starts_at)
);

create index coupons_active_idx on public.coupons (is_active, ends_at);

create trigger coupons_set_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  -- One discount per order. Cascade keeps the ledger honest when an unpaid
  -- order is deleted (see 20260924000000_cancel_order_deletes_unpaid.sql),
  -- which also frees the user's per-user allowance again.
  order_id uuid not null unique references public.orders (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  discount_amount numeric(12, 2) not null check (discount_amount >= 0),
  created_at timestamptz not null default now()
);

create index coupon_redemptions_coupon_idx on public.coupon_redemptions (coupon_id);
create index coupon_redemptions_user_idx on public.coupon_redemptions (user_id, coupon_id);

-- Keep coupons.redemption_count in step with the ledger in both directions.
create or replace function public.sync_coupon_redemption_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.coupons
       set redemption_count = redemption_count + 1
     where id = new.coupon_id;
    return new;
  else
    update public.coupons
       set redemption_count = greatest(0, redemption_count - 1)
     where id = old.coupon_id;
    return old;
  end if;
end;
$$;

create trigger coupon_redemptions_sync_count
  after insert or delete on public.coupon_redemptions
  for each row execute function public.sync_coupon_redemption_count();

-- The order snapshot: which code was applied, kept even if the coupon is
-- later edited or deleted, exactly as shipping and addresses are snapshotted.
alter table public.orders
  add column coupon_id uuid references public.coupons (id) on delete set null,
  add column coupon_code text;

-- ---------------------------------------------------------------------------
-- Validation
-- ---------------------------------------------------------------------------

-- Rounds to paise and never lets a discount exceed the order subtotal.
create or replace function public.coupon_discount_for(
  p_coupon public.coupons,
  p_subtotal numeric
)
returns numeric
language sql
immutable
as $$
  select least(
    p_subtotal,
    round(
      case
        when p_coupon.discount_type = 'percent' then
          least(
            p_subtotal * p_coupon.discount_value / 100,
            coalesce(p_coupon.max_discount_amount, 'infinity'::numeric)
          )
        else p_coupon.discount_value
      end,
      2
    )
  );
$$;

/**
 * Advisory check used by the cart and checkout UI.
 *
 * Returns exactly one row. `valid` false carries a human-readable `reason`;
 * the caller shows it verbatim. Runs as definer so it can read the coupon
 * catalogue the caller cannot select from, but it only ever discloses facts
 * about the single code that was submitted.
 */
create or replace function public.validate_coupon(
  p_code text,
  p_subtotal numeric
)
returns table (
  valid boolean,
  reason text,
  coupon_id uuid,
  code text,
  description text,
  discount_amount numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons;
  v_user uuid := auth.uid();
  v_user_uses integer;
begin
  if v_user is null then
    return query select false, 'Sign in to use a promo code', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  if p_subtotal is null or p_subtotal <= 0 then
    return query select false, 'Your cart is empty', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  select * into v_coupon
    from public.coupons
   where coupons.code = upper(trim(p_code));

  -- A disabled coupon is reported the same as a missing one, so the endpoint
  -- can't be used to discover which codes exist but are switched off.
  if v_coupon.id is null or not v_coupon.is_active then
    return query select false, 'That promo code is not valid', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    return query select false, 'That promo code is not active yet', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  if v_coupon.ends_at is not null and now() >= v_coupon.ends_at then
    return query select false, 'That promo code has expired', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  if p_subtotal < v_coupon.min_order_amount then
    return query select
      false,
      format('Spend ₹%s to use this code', trim(to_char(v_coupon.min_order_amount, 'FM999999990'))),
      null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  if v_coupon.max_redemptions is not null
     and v_coupon.redemption_count >= v_coupon.max_redemptions then
    return query select false, 'That promo code has been fully claimed', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  select count(*) into v_user_uses
    from public.coupon_redemptions r
   where r.coupon_id = v_coupon.id and r.user_id = v_user;

  if v_user_uses >= v_coupon.max_redemptions_per_user then
    return query select false, 'You have already used this code', null::uuid, null::text, null::text, 0::numeric;
    return;
  end if;

  return query select
    true,
    null::text,
    v_coupon.id,
    v_coupon.code,
    v_coupon.description,
    public.coupon_discount_for(v_coupon, p_subtotal);
end;
$$;

revoke all on function public.validate_coupon(text, numeric) from public;
grant execute on function public.validate_coupon(text, numeric) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

-- Deliberately no public read policy: codes are not enumerable. Admins manage
-- the catalogue; everyone else goes through validate_coupon().
create policy "coupons: admin read"
  on public.coupons
  for select
  using (public.is_admin());

create policy "coupons: admin write"
  on public.coupons
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "coupon_redemptions: read own"
  on public.coupon_redemptions
  for select
  using (user_id = auth.uid() or public.is_admin());

-- Writes happen only from create-order via the service role, which bypasses
-- RLS; no insert/update/delete policy is granted to end users on purpose.
