-- Blocked dates table for property availability management
-- Hosts can block date ranges with an optional reason

create table if not exists public.blocked_dates (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blocked_dates_dates_order check (end_date >= start_date)
);

-- Index for fast property lookups and date range queries
create index if not exists blocked_dates_property_id_idx on public.blocked_dates (property_id);
create index if not exists blocked_dates_date_range_idx on public.blocked_dates (property_id, start_date, end_date);

-- RLS: anyone can view blocked dates (needed for guest calendar rendering)
-- Hosts can manage their own property's blocked dates (matched by auth.uid() via properties table)
alter table public.blocked_dates enable row level security;

-- Public read: anyone (including unauthenticated guests) can see blocked dates
create policy "blocked_dates_public_read"
  on public.blocked_dates
  for select
  using (true);

-- Host insert: authenticated users can block dates for properties they own
create policy "blocked_dates_host_insert"
  on public.blocked_dates
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.properties
      where properties.folder_name = blocked_dates.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- Host update: authenticated users can update blocks they own
create policy "blocked_dates_host_update"
  on public.blocked_dates
  for update
  to authenticated
  using (
    exists (
      select 1 from public.properties
      where properties.folder_name = blocked_dates.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- Host delete: authenticated users can delete blocks for their own properties
create policy "blocked_dates_host_delete"
  on public.blocked_dates
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.properties
      where properties.folder_name = blocked_dates.property_id
        and properties.owner_id = auth.uid()
    )
  );

-- Service role (admin) can bypass RLS for admin dashboard
-- (Service role keys bypass RLS by default, no extra policy needed)

-- Auto-update updated_at on row change
create or replace function public.handle_blocked_dates_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blocked_dates_updated_at
  before update on public.blocked_dates
  for each row execute function public.handle_blocked_dates_updated_at();
