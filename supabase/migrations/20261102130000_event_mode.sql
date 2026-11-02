-- =============================================================================
-- Event Mode (Mevoriq Meet): while a person's event is live, every contact
-- shared back with them is linked to it and tagged, so they get a recap after.
-- Events are personal. The server writes them with the secret key; clients can only read their own.
-- =============================================================================

create table public.network_events (
  id             uuid primary key default gen_random_uuid(),
  owner_user_id  uuid not null references public.profiles (id) on delete cascade,
  name           text not null check (char_length(btrim(name)) between 1 and 80),
  tag            text not null check (tag ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(tag) <= 30),
  started_at     timestamptz not null default now(),
  ended_at       timestamptz null,
  created_at     timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at)
);
create index network_events_owner_idx on public.network_events (owner_user_id, started_at desc);
-- At most one open event per person (an open event older than 18 hours no longer tags contacts; see lib/events.ts).
create unique index network_events_one_open_idx on public.network_events (owner_user_id) where ended_at is null;

alter table public.leads add column event_id uuid null references public.network_events (id) on delete set null;
create index leads_event_idx on public.leads (event_id) where event_id is not null;

alter table public.network_events enable row level security;
create policy "network_events: owner read" on public.network_events for select to authenticated
  using (owner_user_id = (select auth.uid()));
