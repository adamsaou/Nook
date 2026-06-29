/** Row shapes for Supabase tables, shared across Nook apps. */

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type RoomVisibility = "public" | "private";

export type Room = {
  id: string;
  name: string;
  visibility: RoomVisibility;
  created_by: string;
  created_at: string;
};

export type Message = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
};
