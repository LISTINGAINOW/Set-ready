-- Create inquiries table for Find Me a Location concierge feature
create table if not exists public.inquiries (
  id                   bigint generated always as identity primary key,
  property_id          text,
  name                 text not null,
  email                text not null,
  phone                text,
  company              text,
  message              text,
  production_type      text,
  preferred_city       text,
  dates_needed         text,
  duration             text,
  crew_size            text,
  budget_range         text,
  must_have_features   text[],
  description          text,
  status               text not null default 'new',
  source               text default 'find-location',
  created_at           timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.inquiries enable row level security;

-- Block all direct access from non-service clients
create policy "inquiries_no_anon_select" on public.inquiries
  for select using (false);

create policy "inquiries_no_anon_insert" on public.inquiries
  for insert with check (false);

create policy "inquiries_no_anon_update" on public.inquiries
  for update using (false);

create policy "inquiries_no_anon_delete" on public.inquiries
  for delete using (false);
