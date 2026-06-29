import Link from "next/link";
import { listMyJoinedSprints, listUpcomingSprints } from "@nook/api";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { joinSprint } from "./actions";
import { formatSlotTime, formatStartsIn, nextSlots } from "@/lib/sprints";
import { SPRINT_DEFAULT_DURATION, SPRINT_LOOKAHEAD } from "@/lib/constants";

export default async function SprintsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line react-hooks/purity -- server component: per-request clock read
  const now = Date.now();
  const slots = nextSlots(new Date(now), SPRINT_LOOKAHEAD);
  const slotIsos = slots.map((s) => s.toISOString());

  const { data: existing } = await listUpcomingSprints(
    supabase,
    slotIsos,
    SPRINT_DEFAULT_DURATION,
  );

  const sprintIds = (existing ?? []).map((s) => s.id as string);
  let joinedIds = new Set<string>();
  if (user && sprintIds.length > 0) {
    const { data: mine } = await listMyJoinedSprints(
      supabase,
      user.id,
      sprintIds,
    );
    joinedIds = new Set((mine ?? []).map((m) => m.sprint_id as string));
  }

  // Map each slot's ISO -> { id, count } for the rows that already exist.
  const byIso = new Map<string, { id: string; count: number }>();
  for (const s of existing ?? []) {
    const count =
      (s.sprint_participants as { count: number }[] | null)?.[0]?.count ?? 0;
    byIso.set(new Date(s.starts_at as string).toISOString(), {
      id: s.id as string,
      count,
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Sprints<span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-foreground/60">
          Lock in at a set time with whoever shows up in silence, synchronization and together.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <ul className="flex flex-col gap-2">
        {slots.map((slot, i) => {
          const iso = slot.toISOString();
          const row = byIso.get(iso);
          const count = row?.count ?? 0;
          const joined = row ? joinedIds.has(row.id) : false;
          const isNext = i === 0;

          return (
            <li
              key={iso}
              className={`flex items-center justify-between rounded-2xl border bg-surface px-5 py-4 shadow-sm ${
                isNext ? "border-accent/60" : "border-foreground/10"
              }`}
            >
              <div className="flex flex-col">
                <span className="text-lg font-semibold tabular-nums">
                  {formatSlotTime(slot)}
                  {isNext && (
                    <span className="ml-2 text-xs font-medium uppercase tracking-wide text-accent">
                      next
                    </span>
                  )}
                </span>
                <span className="text-sm text-foreground/50">
                  {SPRINT_DEFAULT_DURATION} min · {formatStartsIn(slot.getTime() - now)} ·{" "}
                  {count} {count === 1 ? "person" : "people"} going
                </span>
              </div>

              {joined && row ? (
                <Link href={`/sprints/${row.id}`}>
                  <Button variant="outlined" className="px-5 py-2 text-sm">
                    Enter
                  </Button>
                </Link>
              ) : (
                <form action={joinSprint}>
                  <input type="hidden" name="startsAt" value={iso} />
                  <input type="hidden" name="duration" value={SPRINT_DEFAULT_DURATION} />
                  <Button type="submit" variant="primary" className="px-5 py-2 text-sm">
                    Join
                  </Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
