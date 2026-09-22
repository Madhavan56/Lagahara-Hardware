-- Public contact form submissions. Anyone (including anon) can submit;
-- only admins can read them.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

create policy "contact_messages: anyone can submit"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact_messages: admin read"
  on public.contact_messages for select
  to authenticated
  using (public.is_admin());

create policy "contact_messages: admin update"
  on public.contact_messages for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages: admin delete"
  on public.contact_messages for delete
  to authenticated
  using (public.is_admin());
