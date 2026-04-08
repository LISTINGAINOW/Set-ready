alter table public.users
  add column if not exists reset_password_token_hash text,
  add column if not exists reset_password_expires_at timestamptz,
  add column if not exists reset_password_sent_at timestamptz;

create index if not exists users_reset_password_token_hash_idx
  on public.users (reset_password_token_hash)
  where reset_password_token_hash is not null;
