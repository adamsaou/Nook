"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { logFocusSession } from "@nook/api";
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
import styles from "./focus.module.css";

type Phase = "idle" | "running" | "done";

// Ring geometry. C (circumference) drives the depleting progress arc.
const SIZE = 240;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

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
    setRemaining(minutes * 60);
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
      void logFocusSession(supabase, {
        userId,
        roomId: null,
        plannedMinutes: durationMin,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
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

  const total = durationMin * 60;
  const progress = phase === "running" ? Math.max(0, Math.min(1, remaining / total)) : 1;
  const dashoffset = C * (1 - progress);

  return (
    <main className={styles.wrap}>
      <div className={styles.grain} />

      <div className={styles.card}>
        <div className={styles.ringWrap}>
          {phase === "running" && <div className={styles.glow} aria-hidden="true" />}
          <svg className={styles.ring} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
            <circle
              className={styles.track}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              strokeWidth={STROKE}
              fill="none"
            />
            <circle
              className={styles.progress}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={dashoffset}
            />
          </svg>

          <div className={styles.center}>
            {phase === "done" ? (
              <span className={styles.check}>✓</span>
            ) : (
              <span className={styles.time}>
                {format(phase === "running" ? remaining : total)}
              </span>
            )}
            <span className={styles.phaseLabel}>
              {phase === "idle" ? "ready" : phase === "running" ? "focusing" : "complete"}
            </span>
          </div>
        </div>

        {phase === "idle" && (
          <div className={styles.controls}>
            <div className={styles.stepper}>
              <button
                onClick={() => changeDuration(durationMin - FOCUS_STEP_MINUTES)}
                className={styles.step}
                aria-label="Decrease duration"
              >
                –
              </button>
              <div className={styles.presets}>
                {FOCUS_PRESETS_MINUTES.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => changeDuration(preset)}
                    className={`${styles.preset} ${
                      durationMin === preset ? styles.presetActive : ""
                    }`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
              <button
                onClick={() => changeDuration(durationMin + FOCUS_STEP_MINUTES)}
                className={styles.step}
                aria-label="Increase duration"
              >
                +
              </button>
            </div>
            <button onClick={start} className={styles.primary}>
              Start focus
            </button>
          </div>
        )}

        {phase === "running" && (
          <div className={styles.controls}>
            <button onClick={() => finish(false)} className={styles.ghost}>
              End session
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className={styles.controls}>
            <div style={{ textAlign: "center" }}>
              <h1 className={styles.doneTitle}>
                Nice work<span className={styles.dot}>.</span>
              </h1>
              <p className={styles.doneSub}>Did this help you start?</p>
            </div>
            <div className={styles.row}>
              <button onClick={() => reflect(true)} className={styles.ghost}>
                👍 Yes
              </button>
              <button onClick={() => reflect(false)} className={styles.ghost}>
                👎 No
              </button>
            </div>
            <button onClick={startAnother} className={styles.primary}>
              Start another
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
