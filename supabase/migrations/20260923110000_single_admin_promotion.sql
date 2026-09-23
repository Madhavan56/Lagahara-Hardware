-- Allow at most one administrator and centralize promotions behind a guarded RPC.

create unique index profiles_only_one_admin
  on public.profiles (role)
  where role = 'admin';

create or replace function public.promote_user_to_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'Only administrators may promote users'
      using errcode = 'insufficient_privilege';
  end if;

  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'User profile not found'
      using errcode = 'no_data_found';
  end if;

  -- Serialize promotions so concurrent requests cannot both pass the check.
  perform pg_advisory_xact_lock(hashtextextended('public.profiles.admin-promotion', 0));

  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'An administrator already exists; promotion stopped'
      using errcode = 'check_violation';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_user_id;
end;
$$;

revoke execute on function public.promote_user_to_admin(uuid) from public;
grant execute on function public.promote_user_to_admin(uuid) to authenticated;