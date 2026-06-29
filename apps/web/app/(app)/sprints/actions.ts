"use server";

import { redirect } from "next/navigation";
import { joinSprint as joinSprintQuery } from "@nook/api";
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

  const { data, error } = await joinSprintQuery(supabase, {
    startsAt,
    duration,
  });
  if (error) {
    redirect(`/sprints?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/sprints/${data}`);
}
