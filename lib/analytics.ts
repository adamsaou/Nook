import { track as vercelTrack } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean | null>;

/**
 * Best-effort event tracking for validating the MVP hypothesis.
 * - In development, logs to the console so you can see events without a deploy.
 * - In production (on Vercel), forwards to Vercel Web Analytics.
 * Never throws — analytics must not break the focus loop.
 */
export function track(event: string, props?: EventProps): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[analytics]", event, props ?? {});
  }
  try {
    vercelTrack(event, props);
  } catch {
    // ignore — analytics is non-critical
  }
}