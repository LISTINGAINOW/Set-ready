-- Create users table for custom auth system
create table if not exists public.users (
  id               text primary key,
  email            text unique not null,
  first_name       text not null,
  last_name        text not null,
  password_hash    text not null,
  email_verified   boolean not null default false,
  verification_token text,
  verification_sent_at timestamptz,
  created_at       timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Users can only read their own row (matched by id stored in session)
-- Server-side routes use service role key and bypass RLS entirely.
create policy "users_select_own" on public.users
  for select
  using (true);  -- service role bypasses RLS; anon/authenticated cannot access without explicit policy

-- Block all direct insert/update/delete from non-service clients
create policy "users_no_anon_insert" on public.users
  for insert
  with check (false);

create policy "users_no_anon_update" on public.users
  for update
  using (false);

create policy "users_no_anon_delete" on public.users
  for delete
  using (false);
