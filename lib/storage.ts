const SESSIONS_KEY = "nook.sessions";
const LAST_DURATION_KEY = "nook.lastDurationMinutes";

export type FocusReflection = "helped" | "did-not-help" | null;

export type FocusSessionRecord = {
  startedAt: number;
  endedAt: number;
  plannedMinutes: number;
  completed: boolean; // true if it ran to 0, false if ended early
  reflection: FocusReflection;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getLastDuration(fallbackMinutes: number): number {
  if (!canUseStorage()) return fallbackMinutes;
  const value = Number(window.localStorage.getItem(LAST_DURATION_KEY));
  return Number.isFinite(value) && value > 0 ? value : fallbackMinutes;
}

export function setLastDuration(minutes: number): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LAST_DURATION_KEY, String(minutes));
}

export function getSessions(): FocusSessionRecord[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as FocusSessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function logSession(record: FocusSessionRecord): void {
  if (!canUseStorage()) return;
  const sessions = getSessions();
  sessions.push(record);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}