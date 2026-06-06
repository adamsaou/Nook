"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import {
  getLastDuration,
  logSession,
  setLastDuration,
  type FocusReflection,
} from "@/lib/storage";
import {
  DEFAULT_FOCUS_MINUTES,
  FOCUS_PRESETS_MINUTES,
  FOCUS_STEP_MINUTES,
  MAX_FOCUS_MINUTES,
  MIN_FOCUS_MINUTES,
} from "@/lib/constants";

type Phase = "idle" | "running" | "done";

function format(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function clampMinutes(minutes: number) {
  return Math.min(MAX_FOCUS_MINUTES, Math.max(MIN_FOCUS_MINUTES, minutes));
}

export default function FocusSession({ userId }: { userId: string | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const [durationMin, setDurationMin] = useState(DEFAULT_FOCUS_MINUTES);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  // When the user last landed on the idle screen — used to measure time-to-start.
  const idleSince = useRef<number>(Date.now());

  // Restore the last-used duration once on mount. Done in an effect (not lazy
  // initial state) so the server render and first client render both use the
  // default — reading localStorage during render would cause a hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDurationMin(getLastDuration(DEFAULT_FOCUS_MINUTES));
  }, []);

  // Countdown driven by a target timestamp so it stays accurate even if the
  // tab is backgrounded (no drift from counting ticks). State is only updated
  // from inside the interval callback.
  useEffect(() => {
    if (phase !== "running" || endsAt === null) return;

    const id = setInterval(() => {
      const left = Math.round((endsAt - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        finish(true);
      } else {
        setRemaining(left);
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endsAt]);

  function changeDuration(next: number) {
    const minutes = clampMinutes(next);
    setDurationMin(minutes);
    setLastDuration(minutes);
  }

  function start() {
    const now = Date.now();
    track("session_start", {
      plannedMinutes: durationMin,
      timeToStartMs: now - idleSince.current,
    });
    setStartedAt(now);
    setEndsAt(now + durationMin * 60 * 1000);
    setRemaining(durationMin * 60);
    setPhase("running");
  }

  function finish(didComplete: boolean) {
    setEndedAt(Date.now());
    setCompleted(didComplete);
    setPhase("done");
    track(didComplete ? "session_complete" : "session_end_early", {
      plannedMinutes: durationMin,
    });
  }

  function recordSession(reflection: FocusReflection) {
    if (startedAt === null || endedAt === null) return;

    // Everyone gets a local log; logged-in users also persist to the cloud
    // so it shows up in their /profile mirror.
    logSession({ startedAt, endedAt, plannedMinutes: durationMin, completed, reflection });

    if (userId) {
      void supabase.from("focus_sessions").insert({
        user_id: userId,
        room_id: null,
        planned_minutes: durationMin,
        started_at: new Date(startedAt).toISOString(),
        ended_at: new Date(endedAt).toISOString(),
        completed,
        reflection,
      });
    }
  }

  function toIdle() {
    setStartedAt(null);
    setEndedAt(null);
    setRemaining(durationMin * 60);
    setPhase("idle");
    idleSince.current = Date.now();
  }

  function reflect(helped: boolean) {
    const reflection: FocusReflection = helped ? "helped" : "did-not-help";
    track("reflect", { value: reflection });
    recordSession(reflection);
    toIdle();
  }

  function startAnother() {
    recordSession(null); // log the finished session without a reflection
    toIdle();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col items-center gap-8 rounded-3xl border border-foreground/10 bg-surface px-8 py-14 text-center shadow-sm">
          {phase === "idle" && (
            <>
              <div className="font-mono text-7xl font-semibold tabular-nums">
                {format(durationMin * 60)}
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeDuration(durationMin - FOCUS_STEP_MINUTES)}
                    className="h-9 w-9 rounded-full border border-foreground/20 text-lg leading-none hover:bg-foreground/5"
                    aria-label="Decrease duration"
                  >
                    –
                  </button>
                  <div className="flex gap-2">
                    {FOCUS_PRESETS_MINUTES.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => changeDuration(preset)}
                        className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                          durationMin === preset
                            ? "bg-foreground text-background"
                            : "border border-foreground/20 hover:bg-foreground/5"
                        }`}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => changeDuration(durationMin + FOCUS_STEP_MINUTES)}
                    className="h-9 w-9 rounded-full border border-foreground/20 text-lg leading-none hover:bg-foreground/5"
                    aria-label="Increase duration"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button variant="primary" onClick={start} className="px-10 py-4 text-base">
                Start Focus
              </Button>
            </>
          )}

          {phase === "running" && (
            <>
              <div className="font-mono text-7xl font-semibold tabular-nums sm:text-8xl">
                {format(remaining)}
              </div>
              <Button variant="outlined" onClick={() => finish(false)}>
                End session
              </Button>
            </>
          )}

          {phase === "done" && (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Nice work<span className="text-accent">.</span>
                </h1>
                <p className="text-foreground/60">Did this help you start?</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => reflect(true)}>
                  👍 Yes
                </Button>
                <Button variant="outlined" onClick={() => reflect(false)}>
                  👎 No
                </Button>
              </div>
              <Button variant="secondary" onClick={startAnother}>
                Start another
              </Button>
            </>
          )}
        </div>
    </main>
  );
}
