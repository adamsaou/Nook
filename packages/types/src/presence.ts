/** Realtime presence/chat payloads shared across Nook apps. */

/** Live presence payload tracked on a room's realtime channel. */
export type PresenceState = {
  userId: string;
  username: string;
  focusing: boolean;
  endsAt: number | null;
};
