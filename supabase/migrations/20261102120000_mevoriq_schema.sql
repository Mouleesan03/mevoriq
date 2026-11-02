-- =============================================================================
-- Mevoriq — complete database schema (Postgres / Supabase)
-- Documented in docs/database.md. Mirrors lib/data/models.ts and lib/cards/types.ts.
--
-- Access model
--   * The Next.js server talks to the database with the Supabase SECRET key (service role)
--     and enforces every permission in lib/data/access.ts before reading or writing.
--   * Row Level Security is ENABLED on every table. Owner-scoped policies below make direct
--     client access safe as defense in depth; anonymous visitors get no table access at all.
--   * Public card pages are rendered by the server from a whitelisted projection.
-- =============================================================================

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text not null default '' check (char_length(display_name) <= 80),
  email            extensions.citext not null,
  avatar_media_id  uuid null,                       -- FK added after media table
  locale           text not null default 'en',
  status           text not null default 'active' check (status in ('active', 'suspended')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index profiles_email_key on public.profiles (email);
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

-- Create a profile automatically when someone signs up (email link or Google).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Keep profile email in sync if the user changes it in Supabase Auth.
create or replace function public.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_email_changed after update of email on auth.users for each row execute function public.handle_user_email_change();

-- -----------------------------------------------------------------------------
-- Media (card photos, organization logos). Files live in Storage bucket "card-media".
-- -----------------------------------------------------------------------------
create table public.media (
  id             uuid primary key default gen_random_uuid(),
  owner_user_id  uuid not null references public.profiles (id) on delete cascade,
  kind           text not null check (kind in ('avatar', 'logo')),
  mime           text not null default 'image/webp' check (mime = 'image/webp'),
  width          integer not null check (width between 1 and 4096),
  height         integer not null check (height between 1 and 4096),
  bytes          integer not null check (bytes between 1 and 5242880),
  storage_path   text not null unique,
  created_at     timestamptz not null default now()
);
create index media_owner_idx on public.media (owner_user_id);
alter table public.profiles add constraint profiles_avatar_fk foreign key (avatar_media_id) references public.media (id) on delete set null;

-- -----------------------------------------------------------------------------
-- Organizations (teams)
-- -----------------------------------------------------------------------------
create table public.organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (char_length(name) between 2 and 80),
  slug           extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  owner_id       uuid not null references public.profiles (id),
  logo_media_id  uuid null references public.media (id) on delete set null,
  -- Brand preset: {template, accent, company, website, lockedFields[], adminsCanViewLeads}
  brand          jsonb not null default jsonb_build_object(
                   'template', 'modern-corporate', 'accent', '#2448E8', 'company', '', 'website', '',
                   'lockedFields', jsonb_build_array('theme', 'company'), 'adminsCanViewLeads', false),
  status         text not null default 'active' check (status in ('active', 'suspended')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint organizations_brand_shape check (
    jsonb_typeof(brand) = 'object'
    and brand ->> 'template' in ('minimal-white', 'midnight-executive', 'editorial-studio', 'aurora-gradient', 'modern-corporate')
    and brand ->> 'accent' ~ '^#[0-9A-Fa-f]{6}$'
    and jsonb_typeof(brand -> 'lockedFields') = 'array'
  )
);
create trigger organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();

create table public.organization_members (
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  role             text not null check (role in ('owner', 'admin', 'manager', 'member')),
  status           text not null default 'active' check (status in ('active', 'deactivated')),
  joined_at        timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index organization_members_user_idx on public.organization_members (user_id) where status = 'active';
create unique index organization_one_owner on public.organization_members (organization_id) where role = 'owner';

create table public.organization_invitations (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  email            extensions.citext not null,
  role             text not null check (role in ('admin', 'manager', 'member')),
  token_hash       text not null unique,          -- sha256 of the single-use token; raw token is never stored
  expires_at       timestamptz not null,
  accepted_at      timestamptz null,
  revoked_at       timestamptz null,
  created_by       uuid not null references public.profiles (id),
  created_at       timestamptz not null default now()
);
create index organization_invitations_org_idx on public.organization_invitations (organization_id) where accepted_at is null and revoked_at is null;

-- -----------------------------------------------------------------------------
-- Cards
--   Card content (contacts, links, theme) is stored as validated JSON on the card row:
--   it is always read and written as one unit, keeps edits atomic with the optimistic
--   `version` check, and preserves link order. Constraints enforce the shape.
-- -----------------------------------------------------------------------------
create table public.reserved_slugs (slug extensions.citext primary key);
insert into public.reserved_slugs (slug) values
  ('admin'),('app'),('api'),('u'),('login'),('logout'),('signup'),('register'),('pricing'),('features'),('templates'),
  ('onboarding'),('settings'),('help'),('support'),('about'),('contact'),('privacy'),('terms'),('cookies'),('blog'),
  ('mevoriq'),('official'),('team'),('teams'),('meet'),('root'),('system'),('null'),('undefined'),('www'),('auth'),('invite');

create table public.cards (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid not null references public.profiles (id) on delete cascade,
  organization_id  uuid null references public.organizations (id) on delete cascade,
  avatar_media_id  uuid null references public.media (id) on delete set null,
  slug             extensions.citext not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  label            text not null check (char_length(label) between 1 and 60),
  context          text not null default 'professional' check (context in ('professional', 'freelancer', 'event', 'creator', 'personal')),
  full_name        text not null check (char_length(full_name) between 1 and 100),
  pronouns         text not null default '' check (char_length(pronouns) <= 30),
  headline         text not null default '' check (char_length(headline) <= 100),
  company          text not null default '' check (char_length(company) <= 100),
  bio              text not null default '' check (char_length(bio) <= 280),
  contacts         jsonb not null default '{"email":"","phone":"","whatsapp":"","website":"","location":""}'::jsonb,
  links            jsonb not null default '[]'::jsonb,
  theme            jsonb not null default '{"template":"minimal-white","accent":"#2448E8"}'::jsonb,
  status           text not null default 'draft' check (status in ('draft', 'published', 'archived', 'suspended')),
  published_at     timestamptz null,
  version          integer not null default 1 check (version >= 1),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint cards_contacts_shape check (
    jsonb_typeof(contacts) = 'object'
    and coalesce(contacts ->> 'phone', '') ~ '^(\+[1-9][0-9]{7,14})?$'
    and coalesce(contacts ->> 'whatsapp', '') ~ '^(\+[1-9][0-9]{7,14})?$'
    and coalesce(contacts ->> 'website', '') ~* '^(https?://.+)?$'
  ),
  constraint cards_links_shape check (jsonb_typeof(links) = 'array' and jsonb_array_length(links) <= 12),
  constraint cards_theme_shape check (
    theme ->> 'template' in ('minimal-white', 'midnight-executive', 'editorial-studio', 'aurora-gradient', 'modern-corporate')
    and theme ->> 'accent' ~ '^#[0-9A-Fa-f]{6}$'
  )
);
create index cards_owner_status_idx on public.cards (owner_user_id, status);
create index cards_org_status_idx on public.cards (organization_id, status) where organization_id is not null;
create trigger cards_updated_at before update on public.cards for each row execute function public.set_updated_at();

create or replace function public.reject_reserved_slug() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.reserved_slugs r where r.slug = new.slug) then
    raise exception 'slug % is reserved', new.slug using errcode = '23514';
  end if;
  return new;
end $$;
create trigger cards_reserved_slug before insert or update of slug on public.cards for each row execute function public.reject_reserved_slug();

-- Former addresses keep redirecting so printed QR codes never break.
create table public.card_slug_history (
  old_slug    extensions.citext primary key,
  card_id     uuid not null references public.cards (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index card_slug_history_card_idx on public.card_slug_history (card_id);

-- -----------------------------------------------------------------------------
-- Contacts shared back by visitors (leads)
-- -----------------------------------------------------------------------------
create table public.leads (
  id                 uuid primary key default gen_random_uuid(),
  card_id            uuid not null references public.cards (id) on delete cascade,
  owner_user_id      uuid not null references public.profiles (id) on delete cascade,
  organization_id    uuid null references public.organizations (id) on delete set null,
  name               text not null check (char_length(name) between 1 and 100),
  email              extensions.citext not null,
  phone              text not null default '' check (phone ~ '^(\+[1-9][0-9]{7,14})?$'),
  company            text not null default '' check (char_length(company) <= 100),
  message            text not null default '' check (char_length(message) <= 500),
  consent_version    text not null,
  consent_at         timestamptz not null,
  marketing_consent  boolean not null default false,
  status             text not null default 'new' check (status in ('new', 'following_up', 'done', 'archived')),
  tags               text[] not null default '{}' check (cardinality(tags) <= 10),
  note               text not null default '' check (char_length(note) <= 2000),
  follow_up_at       date null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index leads_card_created_idx on public.leads (card_id, created_at desc);
create index leads_owner_status_idx on public.leads (owner_user_id, status);
create index leads_org_idx on public.leads (organization_id) where organization_id is not null;
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Analytics: daily counts only (no visitor identifiers, IPs or locations)
-- -----------------------------------------------------------------------------
create table public.card_event_daily (
  card_id     uuid not null references public.cards (id) on delete cascade,
  event_date  date not null,
  event_type  text not null check (event_type in ('view', 'unique_view', 'save_contact', 'link_click', 'qr_download', 'exchange')),
  count       integer not null default 0 check (count >= 0),
  primary key (card_id, event_date, event_type)
);
create index card_event_daily_date_idx on public.card_event_daily (event_date);

create or replace function public.record_card_event(p_card_id uuid, p_type text) returns void
language sql security definer set search_path = '' as $$
  insert into public.card_event_daily (card_id, event_date, event_type, count)
  values (p_card_id, (now() at time zone 'utc')::date, p_type, 1)
  on conflict (card_id, event_date, event_type) do update set count = public.card_event_daily.count + 1;
$$;

-- -----------------------------------------------------------------------------
-- Moderation, support and operations
-- -----------------------------------------------------------------------------
create table public.abuse_reports (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references public.cards (id) on delete cascade,
  slug            text not null,
  reason          text not null check (reason in ('impersonation', 'spam', 'offensive', 'scam', 'other')),
  details         text not null default '' check (char_length(details) <= 1000),
  reporter_email  text not null default '',
  state           text not null default 'open' check (state in ('open', 'actioned', 'dismissed')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz null,
  resolved_by     uuid null references public.profiles (id) on delete set null
);
create index abuse_reports_state_idx on public.abuse_reports (state, created_at desc);

create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 100),
  email       extensions.citext not null,
  topic       text not null check (topic in ('general', 'support', 'teams', 'privacy', 'press')),
  message     text not null check (char_length(message) between 10 and 3000),
  state       text not null default 'new' check (state in ('new', 'done')),
  created_at  timestamptz not null default now()
);
create index contact_messages_state_idx on public.contact_messages (state, created_at desc);

create table public.audit_logs (
  id               uuid primary key default gen_random_uuid(),
  actor_id         uuid not null,
  organization_id  uuid null references public.organizations (id) on delete set null,
  entity_type      text not null check (entity_type in ('card', 'organization', 'membership', 'invitation', 'report', 'flag', 'account')),
  entity_id        text not null,
  action           text not null,
  metadata         jsonb not null default '{}'::jsonb,   -- never secrets or lead message contents
  created_at       timestamptz not null default now()
);
create index audit_logs_org_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create table public.feature_flags (
  key          text primary key,
  description  text not null default '',
  enabled      boolean not null default false
);
insert into public.feature_flags (key, description, enabled) values
  ('contact_exchange', 'Visitors can share their details back from a public card.', true),
  ('teams', 'People can create organizations and company cards.', true),
  ('signups', 'New people can create an account.', true),
  ('maintenance_mode', 'Show a maintenance notice on public cards.', false)
on conflict (key) do nothing;

-- Shared fixed-window rate limiter for serverless instances (keys are hashed by the app).
create table public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  count         integer not null
);

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as r (key, window_start, count)
  values (p_key, now(), 1)
  on conflict (key) do update
    set count = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning count into v_count;
  return v_count <= p_limit;
end $$;

-- Housekeeping: call daily (Supabase cron) to drop stale rate-limit rows and expired invitations.
create or replace function public.cleanup_expired() returns void
language sql security definer set search_path = '' as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
  delete from public.organization_invitations where accepted_at is null and expires_at < now() - interval '30 days';
$$;

-- Server-only functions: not callable by anonymous or signed-in clients directly.
revoke all on function public.record_card_event(uuid, text) from public, anon, authenticated;
revoke all on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.cleanup_expired() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_email_change() from public, anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security (defense in depth; the server uses the secret key)
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.media enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.reserved_slugs enable row level security;
alter table public.cards enable row level security;
alter table public.card_slug_history enable row level security;
alter table public.leads enable row level security;
alter table public.card_event_daily enable row level security;
alter table public.abuse_reports enable row level security;      -- no client policies: server only
alter table public.contact_messages enable row level security;   -- no client policies: server only
alter table public.audit_logs enable row level security;
alter table public.feature_flags enable row level security;
alter table public.rate_limits enable row level security;        -- no client policies: server only

create or replace function public.org_role(p_org uuid) returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.organization_members m
  where m.organization_id = p_org and m.user_id = (select auth.uid()) and m.status = 'active';
$$;

create policy "profiles: read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "media: own" on public.media for select to authenticated using (owner_user_id = (select auth.uid()));

create policy "organizations: members read" on public.organizations for select to authenticated using (public.org_role(id) is not null);
create policy "members: members read" on public.organization_members for select to authenticated using (public.org_role(organization_id) is not null);
create policy "invitations: admins read" on public.organization_invitations for select to authenticated using (public.org_role(organization_id) in ('owner', 'admin'));

create policy "reserved_slugs: read" on public.reserved_slugs for select to anon, authenticated using (true);

create policy "cards: personal owner read" on public.cards for select to authenticated
  using (organization_id is null and owner_user_id = (select auth.uid()));
create policy "cards: company member read" on public.cards for select to authenticated
  using (organization_id is not null and (
    (owner_user_id = (select auth.uid()) and public.org_role(organization_id) is not null)
    or public.org_role(organization_id) in ('owner', 'admin', 'manager')));

create policy "slug_history: owner read" on public.card_slug_history for select to authenticated
  using (exists (select 1 from public.cards c where c.id = card_id and c.owner_user_id = (select auth.uid())));

create policy "leads: owner read" on public.leads for select to authenticated using (owner_user_id = (select auth.uid()));
create policy "leads: org admins read when enabled" on public.leads for select to authenticated
  using (organization_id is not null and public.org_role(organization_id) in ('owner', 'admin')
         and exists (select 1 from public.organizations o where o.id = leads.organization_id and (o.brand ->> 'adminsCanViewLeads')::boolean));

create policy "events: owner read" on public.card_event_daily for select to authenticated
  using (exists (select 1 from public.cards c where c.id = card_id and c.owner_user_id = (select auth.uid())));

create policy "audit: org admins read" on public.audit_logs for select to authenticated
  using (organization_id is not null and public.org_role(organization_id) in ('owner', 'admin'));

create policy "flags: read" on public.feature_flags for select to anon, authenticated using (true);

-- -----------------------------------------------------------------------------
-- Storage: public-read bucket for card photos and logos; writes only from the server
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-media', 'card-media', true, 5242880, array['image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "card-media: public read" on storage.objects for select to anon, authenticated using (bucket_id = 'card-media');
