-- Nook — Study Rooms schema (Supabase / Postgres)
-- Run this in the Supabase SQL Editor. Review before using in production.
--
-- Tables: profiles, rooms, room_members, messages, focus_sessions
-- Presence ("who's focusing right now") is ephemeral and handled by Supabase
-- Realtime Presence on the client — it intentionally has NO table.

-- ============================================================
-- Profiles (1:1 with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text not null check (char_length(username) between 2 and 32),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Rooms
-- ============================================================
create table if not exists public.rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 60),
  visibility  text not null default 'public' check (visibility in ('public', 'private')),
  created_by  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists rooms_visibility_idx on public.rooms (visibility, created_at desc);

-- Add the creator as the room owner automatically.
create or replace function public.handle_new_room()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.room_members (room_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

drop trigger if exists on_room_created on public.rooms;
create trigger on_room_created
  after insert on public.rooms
  for each row execute function public.handle_new_room();

-- ============================================================
-- Memberships
-- ============================================================
create table if not exists public.room_members (
  room_id    uuid not null references public.rooms(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null default 'member' check (role in ('owner', 'member')),
  joined_at  timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index if not exists room_members_user_idx on public.room_members (user_id);

-- Membership check as SECURITY DEFINER so policies don't recurse through RLS.
create or replace function public.is_room_member(p_room_id uuid, p_user_id uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.room_members
    where room_id = p_room_id and user_id = p_user_id
  );
$$;

-- ============================================================
-- Chat messages
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.rooms(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);
create index if not exists messages_room_idx on public.messages (room_id, created_at);

-- ============================================================
-- Focus sessions (cloud history for logged-in users)
-- Mirrors the localStorage log; room_id is set when focusing inside a room.
-- ============================================================
create table if not exists public.focus_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  room_id          uuid references public.rooms(id) on delete set null,
  planned_minutes  int not null check (planned_minutes between 1 and 240),
  started_at       timestamptz not null,
  ended_at         timestamptz not null,
  completed        boolean not null,
  reflection       text check (reflection in ('helped', 'did-not-help')),
  created_at       timestamptz not null default now()
);
create index if not exists focus_sessions_user_idx on public.focus_sessions (user_id, started_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.rooms          enable row level security;
alter table public.room_members   enable row level security;
alter table public.messages       enable row level security;
alter table public.focus_sessions enable row level security;

-- Profiles: any authed user can read (to show names/avatars); edit only your own.
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Rooms: public rooms visible to all; private only to members; owner manages.
create policy "rooms_select" on public.rooms
  for select to authenticated
  using (visibility = 'public' or public.is_room_member(id, auth.uid()));
create policy "rooms_insert" on public.rooms
  for insert to authenticated with check (auth.uid() = created_by);
create policy "rooms_update_own" on public.rooms
  for update to authenticated using (auth.uid() = created_by);
create policy "rooms_delete_own" on public.rooms
  for delete to authenticated using (auth.uid() = created_by);

-- Memberships: see members of rooms you're in; join/leave yourself.
create policy "members_select" on public.room_members
  for select to authenticated using (public.is_room_member(room_id, auth.uid()));
create policy "members_insert_self" on public.room_members
  for insert to authenticated with check (auth.uid() = user_id);
create policy "members_delete_self" on public.room_members
  for delete to authenticated using (auth.uid() = user_id);

-- Messages: read/write only within rooms you belong to.
create policy "messages_select" on public.messages
  for select to authenticated using (public.is_room_member(room_id, auth.uid()));
create policy "messages_insert" on public.messages
  for insert to authenticated
  with check (auth.uid() = user_id and public.is_room_member(room_id, auth.uid()));
create policy "messages_delete_own" on public.messages
  for delete to authenticated using (auth.uid() = user_id);

-- Focus sessions: strictly your own.
create policy "focus_sessions_select_own" on public.focus_sessions
  for select to authenticated using (auth.uid() = user_id);
create policy "focus_sessions_insert_own" on public.focus_sessions
  for insert to authenticated with check (auth.uid() = user_id);

-- ============================================================
-- Realtime
-- Chat streams via Postgres changes; presence needs no table.
-- ============================================================
alter publication supabase_realtime add table public.messages;
