-- Flags existing plywood and laminate products as sheet goods, taking the
-- dimensions from their "sheet_size" attribute (e.g. "8x4 ft"). Products whose
-- size doesn't parse are left untouched for an admin to set by hand.

with sized as (
  select
    p.id,
    regexp_match(
      p.attributes ->> 'sheet_size',
      '^\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*(?:ft)?\s*$'
    ) as parts
  from public.products p
  join public.categories c on c.id = p.category_id
  where c.slug in ('plywood', 'mica-laminates')
    and not p.is_sheet_product
)
update public.products p
set
  is_sheet_product = true,
  sheet_length_ft = (s.parts[1])::numeric,
  sheet_width_ft = (s.parts[2])::numeric
from sized s
where s.id = p.id
  and s.parts is not null;
