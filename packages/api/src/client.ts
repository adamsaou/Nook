import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client every @nook/api function takes as its first argument.
 * The caller owns construction (cookie-bound on the server, browser client in
 * the client, whatever a native app uses) — this package only runs queries.
 * RLS is the security boundary, so these functions assume the client carries
 * the acting user's session.
 */
export type NookClient = SupabaseClient;
