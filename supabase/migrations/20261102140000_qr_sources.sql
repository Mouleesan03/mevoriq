-- =============================================================================
-- QR source labels: views per card, per day, per labelled QR (print, badge, ...).
-- Counts only; nothing about the visitor. Keys must match lib/cards/sources.ts.
-- =============================================================================

create table public.card_source_daily (
  card_id     uuid not null references public.cards (id) on delete cascade,
  event_date  date not null,
  source      text not null check (source in ('print', 'badge', 'signature', 'slides', 'social')),
  count       integer not null default 0 check (count >= 0),
  primary key (card_id, event_date, source)
);
create index card_source_daily_date_idx on public.card_source_daily (event_date);

create or replace function public.record_card_source(p_card_id uuid, p_source text) returns void
language sql security definer set search_path = '' as $$
  insert into public.card_source_daily (card_id, event_date, source, count)
  values (p_card_id, (now() at time zone 'utc')::date, p_source, 1)
  on conflict (card_id, event_date, source) do update set count = public.card_source_daily.count + 1;
$$;
revoke all on function public.record_card_source(uuid, text) from public, anon, authenticated;

alter table public.card_source_daily enable row level security;
create policy "card_source_daily: owner read" on public.card_source_daily for select to authenticated
  using (exists (select 1 from public.cards c where c.id = card_id and c.owner_user_id = (select auth.uid())));
