import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // eslint-disable-next-line react-hooks/purity -- server component: per-request clock read
  const nowMs = Date.now();

  const [{ data: profile }, { data: sessions }] = await Promise.all([
    supabase.from("profiles").select("username").eq("id", user.id).single(),
    supabase
      .from("focus_sessions")
      .select("started_at, planned_minutes")
      .eq("user_id", user.id)
      .gte("started_at", new Date(nowMs - 7 * 86_400_000).toISOString()),
  ]);

  const daysWithFocus = new Set<string>();
  let totalMinutes = 0;
  for (const s of sessions ?? []) {
    daysWithFocus.add(dayKey(new Date(s.started_at as string)));
    totalMinutes += (s.planned_minutes as number) ?? 0;
  }
  const sessionCount = (sessions ?? []).length;

  const today = new Date(nowMs);
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() - (6 - i) * 86_400_000);
    return {
      key: dayKey(d),
      focused: daysWithFocus.has(dayKey(d)),
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
    };
  });
  const daysFocused = last7.filter((d) => d.focused).length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {profile?.username ?? "You"}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-1 text-foreground/60">
          A quiet mirror of your focus — no streaks, no pressure.
        </p>
      </div>

      {/* This week */}
      <section className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
          This week
        </h2>

        <div className="flex items-end justify-between gap-2">
          {last7.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-2">
              <span
                className={`h-8 w-8 rounded-full ${
                  d.focused ? "bg-accent" : "border border-foreground/15"
                }`}
              />
              <span className="text-xs text-foreground/40">{d.label}</span>
            </div>
          ))}
        </div>

        <p className="text-lg font-semibold">
          {daysFocused}
          <span className="text-foreground/40"> / 7 days</span>
        </p>
      </section>

      {/* Totals */}
      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm">
          <p className="text-sm text-foreground/50">Focus time</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{formatMinutes(totalMinutes)}</p>
        </div>
        <div className="rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm">
          <p className="text-sm text-foreground/50">Sessions</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{sessionCount}</p>
        </div>
      </section>

      {sessionCount === 0 && (
        <p className="text-center text-sm text-foreground/40">
          No sessions yet this week. Start a focus and your mirror fills in.
        </p>
      )}
    </main>
  );
}
