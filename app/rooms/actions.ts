"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function roomsError(message: string): never {
  redirect(`/rooms?error=${encodeURIComponent(message)}`);
}

export async function createRoom(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const visibility =
    String(formData.get("visibility") ?? "public") === "private" ? "private" : "public";

  if (name.length < 1) roomsError("Room name is required");

  const { data, error } = await supabase
    .from("rooms")
    .insert({ name, visibility, created_by: user.id })
    .select("id")
    .single();
  if (error) roomsError(error.message);

  revalidatePath("/rooms");
  redirect(`/rooms/${data.id}`);
}

export async function joinRoom(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roomId = String(formData.get("roomId") ?? "");
  if (!roomId) roomsError("Missing room");

  const { error } = await supabase
    .from("room_members")
    .upsert({ room_id: roomId, user_id: user.id }, { onConflict: "room_id,user_id" , ignoreDuplicates: true});
  if (error) roomsError(error.message);

  revalidatePath("/rooms");
  redirect(`/rooms/${roomId}`);
}

export async function joinRandom() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id")
    .eq("visibility", "public");
  if (!rooms || rooms.length === 0) roomsError("No public rooms yet — create one!");

  const random = rooms[Math.floor(Math.random() * rooms.length)];
  const { error } = await supabase
    .from("room_members")
    .upsert({ room_id: random.id, user_id: user.id }, { onConflict: "room_id,user_id" , ignoreDuplicates: true});
  if (error) roomsError(error.message);

  redirect(`/rooms/${random.id}`);
}
