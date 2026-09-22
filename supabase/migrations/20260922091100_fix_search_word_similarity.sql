-- The first version compared the typo against the *whole* product name
-- string, so similarity was diluted by unrelated words ("Century MR Plywood
-- 19mm 8x4 ft" vs "plywod") and never crossed the match threshold.
-- word_similarity() instead finds the best-matching word/substring within
-- the longer text, which is what a typo-tolerant search actually needs.

create or replace function public.search_products(search_query text, result_limit int default 24)
returns table (id uuid, rank real)
language sql
stable
as $$
  select
    p.id,
    greatest(
      coalesce(ts_rank(p.search_vector, websearch_to_tsquery('english', search_query)), 0),
      coalesce(word_similarity(search_query, p.name), 0),
      coalesce(word_similarity(search_query, coalesce(p.brand, '')), 0)
    ) as rank
  from public.products p
  where p.is_active
    and (
      p.search_vector @@ websearch_to_tsquery('english', search_query)
      or search_query <% p.name
      or search_query <% coalesce(p.brand, '')
    )
  order by rank desc
  limit result_limit;
$$;
