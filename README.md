# Nook

A minimalist, understimulated focus ecosystem built to eliminate the friction of starting deep work.

🔗 **[Live Demo](https://nook-study.vercel.app)**

---

## 🛠️ The Philosophy

Most productivity apps are broken. They treat your brain like a slot machine—flooding you with streaks, badges, and gamified noise to keep you clicking. But when the artificial dopamine wears off, the burnout kicks in.

Nook takes the opposite approach: **understimulation**. No fake rewards, no scrolling, no points. Just a quiet, high-signal workspace designed to help you drop into a flow state within seconds, either solo or alongside a global community.

---

## ✨ Features

* **Instant Stateful Timer:** Start a session with one tap. No login required. The timer remembers your last configuration and prompts a frictionless, single-question reflection post-session.
* **Realtime Peer Presence:** Join shared, silent co-working spaces powered by real-time database syncing. See exactly who is actively focusing alongside you without the distraction of heavy video streams.
* **Ephemeral Study Rooms:** Create public, private, or unlisted code-protected spaces. To keep the database clean and lightweight, empty rooms automatically self-delete.
* **Lightweight Chat:** Persistent, real-time text channels embedded inside rooms for quick accountability check-ins.
* **Flexible Authentication:** Full row-level security (RLS) backing classic email/password sign-in alongside Google, Discord, and Slack OAuth providers.

---

## 💻 Tech Stack

* **Monorepo:** Turborepo + pnpm workspaces (cross-platform foundation; the web app lives in `apps/web`)
* **Frontend Framework:** Next.js 16 (App Router) + TypeScript
* **Styling:** Tailwind CSS v4
* **Backend & Realtime:** Supabase (PostgreSQL, Realtime Presence, Broadcast channels, and Row Level Security)
* **Deployment & Monitoring:** Vercel (Hosting + Web Analytics)

> 👋 **New to the repo (e.g. a co-founder)?** Read [`docs/ONBOARDING.md`](docs/ONBOARDING.md) first — it covers setup, how we run things, the package layout, and our git workflow.

---

## 🚀 Local Development

### Prerequisites

This is a **pnpm + Turborepo** monorepo. You need Node 20+ and pnpm:

```bash
npm install -g pnpm        # if you don't have it
git clone https://github.com/adamsaou/Nook.git
cd Nook
pnpm install               # installs all workspaces from the repo root
```

> 🐢 **On a slow/flaky connection?** pnpm can time out on large native binaries (it has no download resume). See [`docs/ONBOARDING.md`](docs/ONBOARDING.md#troubleshooting-installs) for the fix.

### Environment Configuration

1. Initialize a new project at [supabase.com](https://supabase.com).
2. Create a `.env.local` file in **`apps/web/`** and populate your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Setup

Run the migration scripts in your Supabase SQL Editor in the following order to set up schemas, triggers, and stored procedures:

1. `supabase/schema.sql` (Core database tables & RLS policies)
2. `room-cleanup.sql` (Cron/Function to auto-delete empty spaces)
3. `join-room.sql` (RPC functions for user routing)
4. `private-rooms.sql` (Access control logic)

> ⚠️ **Note:** Make sure to toggle on your preferred OAuth providers (Google, Discord, or Slack) within your Supabase Authentication dashboard.

### Spin Up the Server

From the repo root (turbo runs the web app):

```bash
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view your local instance. Other root commands: `pnpm build`, `pnpm lint`, `pnpm type-check`.

---

## 📁 Repository Structure

```text
apps/
└─ web/            # The Next.js 16 app (package @nook/web)
   ├─ app/         # (auth) shells · (app) focus engine, rooms, profiles · auth/ callbacks
   ├─ components/  # UI primitives, timer elements, shared layouts
   ├─ lib/         # Supabase clients, hooks, constants (extracting into packages/* — Phase 1)
   └─ proxy.ts     # Next 16 auth middleware (gates the app behind login)
packages/          # Shared cross-platform code (being populated in Phase 1: @nook/types, api, core, store, voice, ui)
tooling/           # Shared tsconfig / eslint configs
supabase/          # SQL migrations, RLS policies, database functions
docs/              # Onboarding, architecture notes, roadmap
turbo.json         # Turborepo task pipeline
pnpm-workspace.yaml
```

> The cross-platform direction (desktop/mobile/extension) and the package extraction plan are summarized in [`docs/ONBOARDING.md`](docs/ONBOARDING.md).

---

## 📄 License

Source-available under the **[PolyForm Shield License 1.0.0](LICENSE)**. 

You are free to audit the codebase, run it locally, and submit contributions. However, you may not use this software to build, host, or commercialize a competitive productivity or co-working product. Contributions are accepted under the same terms; copyright remains with the author.
