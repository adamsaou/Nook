import type { NookClient } from "./client";

/** Join (creating if needed) the sprint at a slot; returns its id in `data`. */
export function joinSprint(
  supabase: NookClient,
  input: { startsAt: string; duration: number },
) {
  return supabase.rpc("join_sprint", {
    p_starts_at: input.startsAt,
    p_duration: input.duration,
  });
}

/** Existing sprints at the given slot ISO times, with participant counts. */
export function listUpcomingSprints(
  supabase: NookClient,
  slotIsos: string[],
  durationMinutes: number,
) {
  return supabase
    .from("sprints")
    .select("id, starts_at, duration_minutes, sprint_participants(count)")
    .in("starts_at", slotIsos)
    .eq("duration_minutes", durationMinutes);
}

/** Which of `sprintIds` the user has already joined. */
export function listMyJoinedSprints(
  supabase: NookClient,
  userId: string,
  sprintIds: string[],
) {
  return supabase
    .from("sprint_participants")
    .select("sprint_id")
    .eq("user_id", userId)
    .in("sprint_id", sprintIds);
}

/** A single sprint's detail, or null if it doesn't exist. */
export function getSprint(supabase: NookClient, sprintId: string) {
  return supabase
    .from("sprints")
    .select("id, starts_at, duration_minutes")
    .eq("id", sprintId)
    .maybeSingle();
}

/** Idempotently add the user to a sprint (auto-join on direct link open). */
export function autoJoinSprint(
  supabase: NookClient,
  sprintId: string,
  userId: string,
) {
  return supabase
    .from("sprint_participants")
    .upsert(
      { sprint_id: sprintId, user_id: userId },
      { onConflict: "sprint_id,user_id", ignoreDuplicates: true },
    );
}

/** Mark the user's participation in a sprint as completed. */
export function markSprintCompleted(
  supabase: NookClient,
  sprintId: string,
  userId: string,
) {
  return supabase
    .from("sprint_participants")
    .update({ completed: true })
    .eq("sprint_id", sprintId)
    .eq("user_id", userId);
}
