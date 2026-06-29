import { notFound, redirect } from "next/navigation";
import { autoJoinSprint, getSprint, getUsername } from "@nook/api";
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

  const { data: sprint } = await getSprint(supabase, id);
  if (!sprint) notFound();

  // Auto-join if they opened the link directly (idempotent).
  await autoJoinSprint(supabase, id, user.id);

  const { data: profile } = await getUsername(supabase, user.id);

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
