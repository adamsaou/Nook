-- Nook — Scheduled Focus Sprints.
-- Run in the Supabase SQL Editor, after schema.sql.
--
-- A "sprint" is a shared focus session at a fixed time slot (e.g. every :00/:30).
-- Users commit to an upcoming slot; at start time they focus together with live
-- presence. This is the calm, non-gamified return loop (an appointment, not a streak).

-- ============================================================
-- Tables
-- ============================================================
create table if not exists public.sprints (
  id               uuid primary key default gen_random_uuid(),
  starts_at        timestamptz not null,
  duration_minutes int not null check (duration_minutes between 5 and 120),
  created_at       timestamptz not null default now(),
  unique (starts_at, duration_minutes)
);
create index if not exists sprints_starts_at_idx on public.sprints (starts_at);

create table if not exists public.sprint_participants (
  sprint_id  uuid not null references public.sprints(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  completed  boolean not null default false,
  primary key (sprint_id, user_id)
);
create index if not exists sprint_participants_user_idx on public.sprint_participants (user_id);

-- ============================================================
-- Join a sprint slot (lazily creates the slot). SECURITY DEFINER so the insert
-- bypasses RLS but only ever adds the caller — same pattern as join_room.
-- ============================================================
create or replace function public.join_sprint(p_starts_at timestamptz, p_duration int)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_sprint_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_duration < 5 or p_duration > 120 then
    raise exception 'Invalid duration';
  end if;
  -- Only allow joining real upcoming slots (not the distant past / far future).
  if p_starts_at < now() - interval '1 hour' or p_starts_at > now() + interval '24 hours' then
    raise exception 'Slot out of range';
  end if;

  insert into public.sprints (starts_at, duration_minutes)
  values (p_starts_at, p_duration)
  on conflict (starts_at, duration_minutes) do nothing;

  select id into v_sprint_id
  from public.sprints
  where starts_at = p_starts_at and duration_minutes = p_duration;

  insert into public.sprint_participants (sprint_id, user_id)
  values (v_sprint_id, v_uid)
  on conflict (sprint_id, user_id) do nothing;

  return v_sprint_id;
end;
$$;

grant execute on function public.join_sprint(timestamptz, int) to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.sprints              enable row level security;
alter table public.sprint_participants  enable row level security;

-- Upcoming sprints + their participant rosters are public to authed users
-- (so we can show "X going" and who's in). Writes go through join_sprint / own rows.
create policy "sprints_select" on public.sprints
  for select to authenticated using (true);

create policy "sprint_participants_select" on public.sprint_participants
  for select to authenticated using (true);
create policy "sprint_participants_insert_self" on public.sprint_participants
  for insert to authenticated with check (auth.uid() = user_id);
create policy "sprint_participants_update_own" on public.sprint_participants
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Realtime: live participant counts
-- ============================================================
alter publication supabase_realtime add table public.sprint_participants;
