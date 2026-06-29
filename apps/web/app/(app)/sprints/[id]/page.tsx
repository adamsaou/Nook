import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SprintSession } from "@/components/sprints/SprintSession";

export default async function SprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sprint } = await supabase
    .from("sprints")
    .select("id, starts_at, duration_minutes")
    .eq("id", id)
    .maybeSingle();
  if (!sprint) notFound();

  // Auto-join if they opened the link directly (idempotent).
  await supabase
    .from("sprint_participants")
    .upsert(
      { sprint_id: id, user_id: user.id },
      { onConflict: "sprint_id,user_id", ignoreDuplicates: true },
    );

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <SprintSession
      sprintId={sprint.id}
      startsAt={sprint.starts_at}
      durationMinutes={sprint.duration_minutes}
      userId={user.id}
      username={profile?.username ?? "anon"}
    />
  );
}
