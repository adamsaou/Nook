# Study Rooms — Design

Post-MVP feature: shared focus spaces with live presence and chat.

## Decisions

| Area      | Choice                                                      |
| --------- | ---------------------------------------------------------- |
| Backend   | **Supabase** (Postgres + Auth + Realtime)                  |
| Identity  | **Full accounts** (Supabase Auth: email, optional OAuth)   |
| Room v1   | **Co-presence + chat** (no shared group timer yet)         |
| Auth gate | Rooms require login; solo `/focus` stays usable logged-out |

## Scope (v1)

- Browse **public** rooms → join
- **Create** a room (public or private/shareable)
- **Join random** public room
- Inside a room:
  - **Live presence**: who's here and who's currently focusing (status + their timer)
  - **Chat**: lightweight text, persisted
  - Your existing focus timer runs in the room context and logs to `focus_sessions`

Out of scope for v1: shared/synced group timer, moderation tools, DMs, reactions, invites/roles beyond owner/member.

## Data model

See [`supabase/schema.sql`](../supabase/schema.sql) for the runnable SQL.

- **profiles** — 1:1 with `auth.users`; `username`, `avatar_url`. Auto-created via trigger on signup.
- **rooms** — `name`, `visibility` (public/private), `created_by`. Creator auto-added as `owner` via trigger.
- **room_members** — `(room_id, user_id)` PK, `role` (owner/member).
- **messages** — room chat; persisted; streamed via Realtime Postgres changes.
- **focus_sessions** — cloud history of sessions (mirrors localStorage); `room_id` set when focusing in a room.

**Presence is NOT a table.** "Who's focusing right now" is ephemeral and handled by Supabase **Realtime Presence** on a per-room channel — auto-cleans on disconnect, so no stale rows.

### Security (RLS)

- Profiles: readable by any authed user; editable only by owner.
- Rooms: public rooms readable by all; private only by members; mutable only by owner.
- Members / messages: scoped to rooms you belong to, via a `SECURITY DEFINER` `is_room_member()` helper (avoids RLS recursion).
- Focus sessions: strictly your own rows.

## Realtime strategy

- **Presence** → `channel('room:{id}')` with `.track({ username, status, endsAt })`. Drives the live member/focus list.
- **Chat** → subscribe to Postgres changes on `messages` filtered by `room_id`; insert to send.

## Build phases

1. **Supabase setup** — project, run `schema.sql`, env vars, browser + server clients (`@supabase/ssr`).
2. **Auth** — signup/login, username, middleware session refresh, route protection for `/rooms`.
3. **Rooms list** (`/rooms`) — list public rooms, create, join, random.
4. **Room page** (`/rooms/[id]`) — presence list + in-room focus timer + chat.
5. **Cloud sessions** — write `focus_sessions` for logged-in users (keep localStorage for guests).

## Setup checklist (manual, by project owner)

1. Create a project at supabase.com.
2. Project Settings → API → copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. SQL Editor → paste & run `supabase/schema.sql`.
4. Authentication → enable Email provider (and Google OAuth if desired).
5. Realtime is on by default; `schema.sql` adds `messages` to the realtime publication.

> ⚠️ Implementation note: this repo runs a newer Next.js than usual (see `AGENTS.md`).
> Before writing the auth/SSR integration, check the bundled guides in
> `node_modules/next/dist/docs/` — the App Router auth/middleware APIs may differ.
