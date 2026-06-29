import type { RoomVisibility } from "@nook/types";
import type { NookClient } from "./client";

export type RoomKind = "silent" | "voice";

/** Create a room and return its id (`{ data: { id }, error }`). */
export function createRoom(
  supabase: NookClient,
  input: {
    name: string;
    visibility: RoomVisibility;
    kind: RoomKind;
    createdBy: string;
  },
) {
  return supabase
    .from("rooms")
    .insert({
      name: input.name,
      visibility: input.visibility,
      kind: input.kind,
      created_by: input.createdBy,
    })
    .select("id")
    .single();
}

/** Join a room by id (membership handled server-side by the RPC). */
export function joinRoom(supabase: NookClient, roomId: string) {
  return supabase.rpc("join_room", { p_room_id: roomId });
}

/** Join a room by its short share code; returns the room id in `data`. */
export function joinRoomByCode(supabase: NookClient, code: string) {
  return supabase.rpc("join_room_by_code", { p_code: code });
}

/** Ids of every public room — used to pick a random one to join. */
export function listPublicRoomIds(supabase: NookClient) {
  return supabase.from("rooms").select("id").eq("visibility", "public");
}

/** Public rooms for the lobby, newest first. */
export function listPublicRooms(supabase: NookClient) {
  return supabase
    .from("rooms")
    .select("id, name, visibility, kind, created_at")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(50);
}

/** Rooms the user is a member of (with the joined room summary). */
export function listMyMemberships(supabase: NookClient, userId: string) {
  return supabase
    .from("room_members")
    .select("room_id, rooms(id, name, visibility)")
    .eq("user_id", userId);
}

/** A single room's detail, or null if it doesn't exist. */
export function getRoom(supabase: NookClient, roomId: string) {
  return supabase
    .from("rooms")
    .select("id, name, visibility, created_by, join_code, kind")
    .eq("id", roomId)
    .maybeSingle();
}

/** Whether the user is already a member of a room (row or null). */
export function getRoomMembership(
  supabase: NookClient,
  roomId: string,
  userId: string,
) {
  return supabase
    .from("room_members")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();
}

/** Most recent messages for a room, oldest first, with author usernames. */
export function getRoomMessages(supabase: NookClient, roomId: string) {
  return supabase
    .from("messages")
    .select("id, user_id, content, created_at, profiles(username)")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(50);
}

/** Post a chat message to a room. */
export function insertMessage(
  supabase: NookClient,
  input: { roomId: string; userId: string; content: string },
) {
  return supabase.from("messages").insert({
    room_id: input.roomId,
    user_id: input.userId,
    content: input.content,
  });
}

/** Heartbeat that keeps a room marked active. */
export function touchRoom(supabase: NookClient, roomId: string) {
  return supabase.rpc("touch_room", { p_room_id: roomId });
}
