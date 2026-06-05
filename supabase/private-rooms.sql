-- Nook — private rooms via join code (+ shareable link).
-- Run in the Supabase SQL Editor, after schema.sql.

-- 1. Readable 6-char code generator (avoids 0/O/1/I confusion).
create or replace function public.gen_join_code()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text := '';
  i int;
begin
  for i in 1..6 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end;
$$;

-- 2. Add join_code to rooms: backfill existing, then require + default + unique.
alter table public.rooms add column if not exists join_code text;
update public.rooms set join_code = public.gen_join_code() where join_code is null;
alter table public.rooms alter column join_code set not null;
alter table public.rooms alter column join_code set default public.gen_join_code();
create unique index if not exists rooms_join_code_idx on public.rooms (join_code);

-- 3. Join by code (works for private rooms too). Returns the room id to redirect to.
create or replace function public.join_room_by_code(p_code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select id into v_room_id
  from public.rooms
  where join_code = upper(trim(p_code));

  if v_room_id is null then
    raise exception 'Invalid join code';
  end if;

  insert into public.room_members (room_id, user_id)
  values (v_room_id, v_uid)
  on conflict (room_id, user_id) do nothing;

  return v_room_id;
end;
$$;

grant execute on function public.join_room_by_code(text) to authenticated;
