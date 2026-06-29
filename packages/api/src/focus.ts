import type { NookClient } from "./client";

export type FocusReflection = "helped" | "did-not-help" | null;

/**
 * Persist a finished focus session and return its id. Callers that only want
 * to record (not reference the id later) can ignore the result.
 */
export function logFocusSession(
  supabase: NookClient,
  input: {
    userId: string;
    roomId: string | null;
    plannedMinutes: number;
    startedAt: string;
    endedAt: string;
    completed: boolean;
    reflection: FocusReflection;
  },
) {
  return supabase
    .from("focus_sessions")
    .insert({
      user_id: input.userId,
      room_id: input.roomId,
      planned_minutes: input.plannedMinutes,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      completed: input.completed,
      reflection: input.reflection,
    })
    .select("id")
    .single();
}

/** Attach a reflection to an already-logged session. */
export function updateFocusReflection(
  supabase: NookClient,
  sessionId: string,
  reflection: FocusReflection,
) {
  return supabase
    .from("focus_sessions")
    .update({ reflection })
    .eq("id", sessionId);
}

/** A user's focus sessions started on/after `sinceIso` (for the profile mirror). */
export function listRecentFocusSessions(
  supabase: NookClient,
  userId: string,
  sinceIso: string,
) {
  return supabase
    .from("focus_sessions")
    .select("started_at, planned_minutes")
    .eq("user_id", userId)
    .gte("started_at", sinceIso);
}
