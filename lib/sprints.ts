import { SPRINT_SLOT_MINUTES } from "@/lib/constants";

/**
 * The next `count` slot boundaries strictly after `from`
 * (e.g. with a 30-min interval: 9:30, 10:00, 10:30, …).
 */
export function nextSlots(
  from: Date,
  count: number,
  intervalMin: number = SPRINT_SLOT_MINUTES,
): Date[] {
  const ms = intervalMin * 60 * 1000;
  const firstMs = Math.floor(from.getTime() / ms) * ms + ms;
  return Array.from({ length: count }, (_, i) => new Date(firstMs + i * ms));
}

/** Local clock label for a slot, e.g. "9:30 AM". */
export function formatSlotTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Short "starts in" label from a millisecond delta, e.g. "in 12 min" / "now". */
export function formatStartsIn(msUntil: number): string {
  if (msUntil <= 0) return "now";
  const totalMin = Math.round(msUntil / 60000);
  if (totalMin < 60) return `in ${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `in ${h}h ${m}m` : `in ${h}h`;
}
