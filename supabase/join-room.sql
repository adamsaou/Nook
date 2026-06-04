-- Nook — robust room joining via SECURITY DEFINER.
-- Run in the Supabase SQL Editor.
--
-- Why: inserting into room_members directly was hitting RLS errors. This
-- function runs as the definer (bypasses the table's insert policy) but still
-- uses the caller's validated auth.uid(), so a user can only ever add THEMSELVES.

create or replace function public.join_room(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_visibility text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select visibility into v_visibility from public.rooms where id = p_room_id;
  if v_visibility is null then
    raise exception 'Room not found';
  end if;
  if v_visibility <> 'public' then
    raise exception 'Room is private';
  end if;

  insert into public.room_members (room_id, user_id)
  values (p_room_id, v_uid)
  on conflict (room_id, user_id) do nothing;
end;
$$;

grant execute on function public.join_room(uuid) to authenticated;
