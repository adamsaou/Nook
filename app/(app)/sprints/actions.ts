"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinSprint(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const startsAt = String(formData.get("startsAt") ?? "");
  const duration = Number(formData.get("duration") ?? 0);
  if (!startsAt || !duration) {
    redirect(`/sprints?error=${encodeURIComponent("Invalid sprint")}`);
  }

  const { data, error } = await supabase.rpc("join_sprint", {
    p_starts_at: startsAt,
    p_duration: duration,
  });
  if (error) {
    redirect(`/sprints?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/sprints/${data}`);
}
