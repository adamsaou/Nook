![Lines of Code](https://img.shields.io/tokei/lines/github/adamsaou/Nook?color=16F5A3&label=lines%20of%20code)

# Nook.

**A calm focus environment — start working in seconds, then focus alongside others.**

🔗 **[Live demo →](https://nook-three-rosy.vercel.app/focus)**

Nook helps students and creators beat procrastination by removing friction: one tap starts a focus session, and silent **study rooms** add presence-based accountability — no gamification, no fake rewards.

<!-- Add a screenshot for the biggest impact:  ![Nook](docs/screenshot.png) -->

---

## 🧠 Vision

Most productivity tools fail because they pile on complexity, gamification, and pressure. Nook does the opposite:

- **Zero-friction focus** — start in one tap, no setup
- **Silent co-working** — see who's focusing, live
- **Calm, minimal interface** — no streaks, no points, no noise

> Help people start working in seconds, not minutes.

---

## ✨ Features

- ⏱️ **Instant focus timer** — solo, no login required; customizable duration that remembers your last setting, plus a quick "did this help?" reflection.
- 🏠 **Study rooms** — create public or private rooms, join from the list, drop into a random one, or join by code.
- 🟢 **Realtime presence** — see who's in the room and who's currently focusing, updating live.
- 💬 **Room chat** — lightweight, persistent, real-time.
- 🔗 **Invite by code or share link** — private rooms stay unlisted but easy to share.
- 🔑 **Auth** — email/password plus **Google**, **Discord**, and **Slack** sign-in.
- 🧹 **Self-cleaning rooms** — empty rooms auto-delete so the list stays fresh.

---

## 🛠️ Tech stack

- **[Next.js](https://nextjs.org)** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **[Supabase](https://supabase.com)** — Postgres, Auth, and Realtime (Presence + Postgres Changes), secured with Row Level Security
- **[Vercel](https://vercel.com)** — hosting + Web Analytics

---

## 🚀 Run locally

```bash
git clone https://github.com/adamsaou/Nook.git
cd Nook
npm install
```

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Add your keys** to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
   ```
3. **Run the SQL** in the Supabase SQL Editor, in order:
   `supabase/schema.sql` → `room-cleanup.sql` → `join-room.sql` → `private-rooms.sql`
4. **Enable auth providers** (Email, and optionally Google / Discord / Slack) in Supabase → Authentication.
5. **Start it:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project structure

```
app/
├─ (auth)/        login & signup (centered shell)
├─ (app)/         focus, rooms, profile (shared nav + session)
└─ auth/          OAuth callback + server actions
components/        ui, focus, rooms, auth, shared
lib/               supabase clients, helpers, constants
supabase/          SQL schema, policies & functions
docs/              project notes (vision, roadmap, rooms design)
```

---

## 📄 License

Source-available under the **[PolyForm Shield License 1.0.0](LICENSE)**.

You're welcome to read the code, run it for yourself, and contribute — but you **may not use it to build a product that competes with Nook** (e.g. running a rival hosted service). Contributions are licensed under the same terms; copyright stays with the author.
