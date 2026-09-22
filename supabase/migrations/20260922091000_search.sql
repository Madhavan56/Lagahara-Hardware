-- Ranked search combining full-text search with pg_trgm similarity, so
-- misspellings (e.g. "plywod") still surface results that plain ILIKE would
-- miss. Returns ids + rank only; the app re-fetches full rows to preserve
-- the same select shape (with joined images) used elsewhere.

create or replace function public.search_products(search_query text, result_limit int default 24)
returns table (id uuid, rank real)
language sql
stable
as $$
  select
    p.id,
    greatest(
      coalesce(ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)), 0),
      coalesce(similarity(p.name, search_query), 0),
      coalesce(similarity(coalesce(p.brand, ''), search_query), 0)
    ) as rank
  from public.products p
  where p.is_active
    and (
      p.search_vector @@ websearch_to_tsquery('english', search_query)
      or p.name % search_query
      or coalesce(p.brand, '') % search_query
    )
  order by rank desc
  limit result_limit;
$$;

revoke execute on function public.search_products(text, int) from public;
grant execute on function public.search_products(text, int) to anon, authenticated;
