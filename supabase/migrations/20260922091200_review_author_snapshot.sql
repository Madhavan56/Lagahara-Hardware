-- Public review listings need a display name, but profiles RLS only allows
-- reading your own row (correctly — it would otherwise leak every
-- customer's full name to anonymous visitors). Snapshot a privacy-safe
-- display name onto the review at insert time instead of joining profiles.

alter table public.reviews add column reviewer_name text not null default 'Verified Buyer';

create or replace function public.set_review_author_name()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  full_name text;
  first_part text;
  second_part text;
begin
  select p.full_name into full_name from public.profiles p where p.id = new.user_id;

  if full_name is null or trim(full_name) = '' then
    new.reviewer_name := 'Verified Buyer';
    return new;
  end if;

  first_part := split_part(trim(full_name), ' ', 1);
  second_part := split_part(trim(full_name), ' ', 2);

  if second_part = '' then
    new.reviewer_name := first_part;
  else
    new.reviewer_name := first_part || ' ' || left(second_part, 1) || '.';
  end if;

  return new;
end;
$$;

create trigger reviews_set_author_name
  before insert on public.reviews
  for each row execute function public.set_review_author_name();
