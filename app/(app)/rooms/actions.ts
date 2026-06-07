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
  const kind = 
    String(formData.get("kind") ?? "silent") === "voice" ? "voice" : "silent";

  if (name.length < 1) roomsError("Room name is required");

  const { data, error } = await supabase
    .from("rooms")
    .insert({ name, visibility, kind, created_by: user.id })
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

  const { error } = await supabase.rpc("join_room", { p_room_id: roomId });
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
  const { error } = await supabase.rpc("join_room", { p_room_id: random.id });
  if (error) roomsError(error.message);

  redirect(`/rooms/${random.id}`);
}

export async function joinByCode(formData: FormData){
  const supabase = await createClient();
  const{
    data: { user },
  } = await supabase.auth.getUser();
  if(!user) redirect("/login");

  const code = String(formData.get("code") ?? "").trim();
  if(!code) roomsError("Enter a join code");

  const { data, error} = await supabase.rpc("join_room_by_code", {p_code: code});
  if (error) roomsError(error.message);

  redirect(`/rooms/${data}`);
}
