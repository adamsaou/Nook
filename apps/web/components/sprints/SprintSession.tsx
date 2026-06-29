"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Member = { userId: string; username: string };

function format(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function SprintSession({
  sprintId,
  startsAt,
  durationMinutes,
  userId,
  username,
}: {
  sprintId: string;
  startsAt: string;
  durationMinutes: number;
  userId: string;
  username: string;
}) {
  const supabase = useMemo(() => createClient(), []);
  const startsAtMs = useMemo(() => new Date(startsAt).getTime(), [startsAt]);
  const endsAtMs = useMemo(
    () => startsAtMs + durationMinutes * 60_000,
    [startsAtMs, durationMinutes],
  );

  const [now, setNow] = useState(() => Date.now());
  const [members, setMembers] = useState<Member[]>([]);
  const [reflected, setReflected] = useState(false);

  const [mountMs] = useState(() => Date.now());
  const loggedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // ---- Live presence: who's in this sprint ----
  useEffect(() => {
    const channel = supabase.channel(`sprint:${sprintId}`, {
      config: { presence: { key: userId } },
    });

    const recompute = () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
      const list: Member[] = Object.values(state)
        .map((entries) => {
          const p = entries[0] ?? {};
          return { userId: String(p.userId ?? ""), username: String(p.username ?? "anon") };
        })
        .filter((m) => m.userId);
      setMembers(list);
    };

    const handleHide = () => {
      void channel.untrack();
    };
    window.addEventListener("pagehide", handleHide);

    channel
      .on("presence", { event: "sync" }, recompute)
      .on("presence", { event: "join" }, recompute)
      .on("presence", { event: "leave" }, recompute);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") channel.track({ userId, username });
    });

    return () => {
      window.removeEventListener("pagehide", handleHide);
      supabase.removeChannel(channel);
    };
  }, [supabase, sprintId, userId, username]);

  async function logSession() {
    const { data } = await supabase
      .from("focus_sessions")
      .insert({
        user_id: userId,
        room_id: null,
        planned_minutes: durationMinutes,
        started_at: new Date(startsAtMs).toISOString(),
        ended_at: new Date(endsAtMs).toISOString(),
        completed: true,
        reflection: null,
      })
      .select("id")
      .single();
    sessionIdRef.current = (data?.id as string) ?? null;
    await supabase
      .from("sprint_participants")
      .update({ completed: true })
      .eq("sprint_id", sprintId)
      .eq("user_id", userId);
  }

  // ---- Ticker: drives the countdown + logs the session once it ends ----
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAtMs && !loggedRef.current && mountMs < endsAtMs) {
        loggedRef.current = true;
        void logSession();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAtMs]);

  async function reflect(helped: boolean) {
    setReflected(true);
    if (sessionIdRef.current) {
      await supabase
        .from("focus_sessions")
        .update({ reflection: helped ? "helped" : "did-not-help" })
        .eq("id", sessionIdRef.current);
    }
  }

  const phase = now < startsAtMs ? "waiting" : now < endsAtMs ? "running" : "done";
  const secondsToStart = Math.ceil((startsAtMs - now) / 1000);
  const secondsLeft = Math.ceil((endsAtMs - now) / 1000);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <Link href="/sprints" className="text-sm text-foreground/50 hover:underline">
        ← Sprints
      </Link>

      {phase === "waiting" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm uppercase tracking-wide text-foreground/50">Starting in</p>
          <div className="font-mono text-6xl font-semibold tabular-nums">
            {format(secondsToStart)}
          </div>
          <p className="mt-2 text-foreground/60">
            {durationMinutes}-minute focus — get ready.
          </p>
        </div>
      )}

      {phase === "running" && (
        <div className="flex flex-col items-center gap-3">
          <div className="font-mono text-7xl font-semibold tabular-nums sm:text-8xl">
            {format(secondsLeft)}
          </div>
          <p className="text-accent">Focusing together</p>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Nice work<span className="text-accent">.</span>
          </h1>
          {!reflected ? (
            <>
              <p className="text-foreground/60">Did this help you start?</p>
              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => reflect(true)}>
                  👍 Yes
                </Button>
                <Button variant="outlined" onClick={() => reflect(false)}>
                  👎 No
                </Button>
              </div>
            </>
          ) : (
            <p className="text-foreground/60">Logged. See you at the next one.</p>
          )}
          <Link href="/sprints">
            <Button variant="secondary">Back to sprints</Button>
          </Link>
        </div>
      )}

      <div className="w-full rounded-2xl border border-foreground/10 bg-surface p-4 text-left shadow-sm">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          {members.length} here
        </h2>
        <ul className="flex flex-wrap gap-2">
          {members.map((m) => (
            <li key={m.userId} className="rounded-full bg-foreground/5 px-3 py-1 text-sm">
              {m.username}
              {m.userId === userId && " (you)"}
            </li>
          ))}
          {members.length === 0 && (
            <li className="text-sm text-foreground/40">Connecting…</li>
          )}
        </ul>
      </div>
    </main>
  );
}
