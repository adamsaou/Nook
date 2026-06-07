-- Nook — Voice rooms.
-- Run in the Supabase SQL Editor, after schema.sql.
--
-- Rooms are either 'silent' (presence + chat only) or 'voice' (adds WebRTC mic).
-- Existing rooms default to 'silent'.

alter table public.rooms
  add column if not exists kind text not null default 'silent'
  check (kind in ('silent', 'voice'));
