-- Catalog: categories, per-category attribute definitions, products, images.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_active_sort_idx on public.categories (is_active, sort_order);

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- Defines WHICH attributes a category's products carry. Admins edit rows here
-- to extend a category's spec sheet; no migration or new table is needed.
create table public.category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  key text not null,
  label text not null,
  data_type public.attribute_data_type not null default 'text',
  unit text,
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  is_filterable boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (category_id, key),
  constraint category_attributes_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  constraint category_attributes_select_has_options check (
    data_type <> 'select' or jsonb_array_length(options) > 0
  )
);

create index category_attributes_category_idx
  on public.category_attributes (category_id, sort_order);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null unique,
  sku text not null unique,
  name text not null,
  brand text,
  description text,
  -- Prices are GST-inclusive: this rate is used to back out the tax component
  -- for the invoice breakdown, never to add tax on top at checkout.
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  gst_rate numeric(5, 2) not null default 18.00 check (gst_rate >= 0 and gst_rate <= 100),
  unit_label text not null default 'piece',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  -- Values for this product's category-defined attributes, e.g.
  -- {"brand":"Century","thickness_mm":19,"finish":"Matte"}
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored,
  constraint products_attributes_is_object check (jsonb_typeof(attributes) = 'object')
);

create index products_category_idx on public.products (category_id) where is_active;
create index products_featured_idx on public.products (is_featured) where is_active;
create index products_price_idx on public.products (price);
create index products_created_idx on public.products (created_at desc);
create index products_search_idx on public.products using gin (search_vector);
create index products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
-- Supports faceted filtering on arbitrary category attributes without joins.
create index products_attributes_idx on public.products using gin (attributes jsonb_path_ops);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Rejects attribute payloads that don't match the category's defined schema.
create or replace function public.validate_product_attributes()
returns trigger
language plpgsql
as $$
declare
  attr record;
  supplied jsonb := coalesce(new.attributes, '{}'::jsonb);
  value jsonb;
begin
  for attr in
    select key, label, data_type, is_required, options
    from public.category_attributes
    where category_id = new.category_id
  loop
    value := supplied -> attr.key;

    if value is null or jsonb_typeof(value) = 'null' then
      if attr.is_required then
        raise exception 'Attribute "%" is required for this category', attr.label
          using errcode = 'check_violation';
      end if;
      continue;
    end if;

    if attr.data_type = 'number' and jsonb_typeof(value) <> 'number' then
      raise exception 'Attribute "%" must be a number', attr.label
        using errcode = 'check_violation';
    elsif attr.data_type = 'boolean' and jsonb_typeof(value) <> 'boolean' then
      raise exception 'Attribute "%" must be true or false', attr.label
        using errcode = 'check_violation';
    elsif attr.data_type in ('text', 'select') and jsonb_typeof(value) <> 'string' then
      raise exception 'Attribute "%" must be text', attr.label
        using errcode = 'check_violation';
    end if;

    if attr.data_type = 'select' and not (attr.options @> jsonb_build_array(value)) then
      raise exception 'Attribute "%" has value % which is not an allowed option', attr.label, value
        using errcode = 'check_violation';
    end if;
  end loop;

  -- Reject keys the category does not define, so typos don't silently persist.
  if exists (
    select 1
    from jsonb_object_keys(supplied) as k(key)
    where not exists (
      select 1
      from public.category_attributes ca
      where ca.category_id = new.category_id
        and ca.key = k.key
    )
  ) then
    raise exception 'Product attributes contain keys not defined for this category'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger products_validate_attributes
  before insert or update of attributes, category_id on public.products
  for each row execute function public.validate_product_attributes();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index product_images_product_idx on public.product_images (product_id, sort_order);
create unique index product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;
