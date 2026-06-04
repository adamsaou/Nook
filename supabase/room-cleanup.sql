-- Nook — empty-room cleanup (heartbeat + pg_cron)
-- Run in the Supabase SQL Editor, AFTER schema.sql.
--
-- Model: while anyone is in a room, the client pings `touch_room` every ~30s,
-- bumping rooms.last_active_at. A pg_cron job deletes rooms that have gone
-- quiet for 5 minutes (all tabs closed / crashed). Self-healing, server-side.

-- 1. Track last activity per room.
alter table public.rooms
  add column if not exists last_active_at timestamptz not null default now();

-- 2. Heartbeat RPC. SECURITY DEFINER so any *member* (not just the owner) can
--    bump the timestamp without a broad UPDATE policy on rooms.
create or replace function public.touch_room(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if public.is_room_member(p_room_id, auth.uid()) then
    update public.rooms set last_active_at = now() where id = p_room_id;
  end if;
end;
$$;

grant execute on function public.touch_room(uuid) to authenticated;

-- 3. Schedule cleanup every 2 minutes (deletes rooms idle > 5 min).
--    Requires the pg_cron extension — enable it first (see note below) if
--    `create extension` errors out in the SQL editor.
create extension if not exists pg_cron;

-- Re-runnable: drop any existing job of this name, then create it.
do $$
begin
  perform cron.unschedule('nook-cleanup-stale-rooms');
exception
  when others then null; -- job didn't exist yet
end $$;

select cron.schedule(
  'nook-cleanup-stale-rooms',
  '*/2 * * * *',
  $$ delete from public.rooms where last_active_at < now() - interval '5 minutes' $$
);
