import type { NookClient } from "./client";

/** A user's username (`{ data: { username }, error }`). */
export function getUsername(supabase: NookClient, userId: string) {
  return supabase.from("profiles").select("username").eq("id", userId).single();
}
