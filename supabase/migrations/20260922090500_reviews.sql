-- Product reviews plus the denormalised rating rollup on products.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index reviews_product_idx on public.reviews (product_id, created_at desc);
create index reviews_user_idx on public.reviews (user_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

create or replace function public.refresh_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_product uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
  set rating_avg = coalesce(agg.avg_rating, 0),
      rating_count = coalesce(agg.total, 0)
  from (
    select avg(rating)::numeric(3, 2) as avg_rating, count(*) as total
    from public.reviews
    where product_id = target_product
      and is_approved
  ) as agg
  where p.id = target_product;

  return null;
end;
$$;

create trigger reviews_refresh_product_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();
