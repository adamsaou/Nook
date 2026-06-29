# Onboarding (for the team)

Welcome to Nook. This is the one doc to read before you start. It covers setup, how we run things day to day, where code lives, and our git workflow.

Nook is a calm focus app (Focus timer, Sprints, Rooms with voice). Today it ships as a web app; the repo is structured as a monorepo so we can add desktop, mobile, and a browser extension later without rewriting the core logic.

---

## 1. Setup

You need **Node 20+** and **pnpm**. This is a pnpm + Turborepo monorepo, so do not use `npm` here.

```bash
npm install -g pnpm          # one time, if you don't have pnpm
git clone https://github.com/adamsaou/Nook.git
cd Nook
pnpm install                 # from the repo root, installs every workspace
```

### Environment

The web app reads its keys from `apps/web/.env.local` (this file is gitignored, ask Adam for the values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Self-hosted TURN/voice and any other secrets are set as Vercel env vars, never committed.

---

## 2. Running things

Run everything from the **repo root**. Turborepo figures out the rest.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the web app (http://localhost:3000) |
| `pnpm build` | Production build of all apps |
| `pnpm lint` | Lint everything |
| `pnpm type-check` | TypeScript check across the repo |

Turbo caches results, so a second run of an unchanged task is instant.

---

## 3. Where code lives

```
apps/web/        The Next.js 16 app (package @nook/web). All current product UI + logic.
packages/        Shared, cross-platform code. Being filled in now (Phase 1):
                   @nook/types   Supabase + shared TS types
                   @nook/api     data functions (Supabase client injected, RLS = security)
                   @nook/core    pure domain logic (sprints, analytics, constants)
                   @nook/store   Zustand state with pluggable storage
                   @nook/voice   WebRTC mesh voice hook
                   @nook/ui-*    brand tokens + shared web components
tooling/         Shared tsconfig + eslint configs
supabase/        SQL migrations + RLS policies
docs/            This doc, architecture notes, roadmap
```

**Rule of thumb:** `apps/*` import from `packages/*`. Packages never import from apps. This is what keeps the shared core platform-agnostic.

### Where we are headed

We are mid-restructure. The web app is the source of truth, and we are extracting its logic into the `packages/*` above so every future platform calls the exact same code. The web app stays working and green after every extraction step.

---

## 4. Git workflow

- Branch per task: `feat/<area>-<short>`, `fix/<area>-<short>`, `infra/<short>`.
- Keep commits green: `pnpm lint`, `pnpm type-check`, `pnpm build` should pass before you push.
- Open a PR into `main`; the other person skims it before merge. Squash-merge to keep `main` linear.
- Never commit secrets (`.env.local`, TURN creds, Supabase keys).

### Commit messages

Format: `Type(scope): imperative subject`

```
Types:  Feature | Fix | Refactor | Chore | Docs | UI | Infra
Scope:  web | api | store | core | voice | ui | supabase | repo   (optional)
```

Examples:
- `Infra(repo): scaffold Turborepo + pnpm workspaces`
- `Refactor(api): move room actions into @nook/api`
- `UI(web): tidy the focus ring spacing`

To avoid stepping on each other, prefer working in different packages. `@nook/api` is the most shared, so give a heads-up before large changes there.

---

## 5. Troubleshooting installs

On a slow or flaky connection, `pnpm install` can fail on large native binaries (for example `@next/swc-win32-x64-msvc`, ~41 MB) with `error (23)` or a `TimeoutError`. pnpm has no download resume, so a dropped connection restarts the file from zero.

The repo already ships sane defaults in `.npmrc` (long timeouts, `network-concurrency=1` so one file gets full bandwidth). If a big file still will not land:

```bash
# 1. Download it with curl, which CAN resume:
curl.exe -L --retry 8 -C - -o swc.tgz \
  "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.2.7.tgz"

# 2. Put it in a gitignored vendor/ folder, then add a TEMPORARY override
#    in pnpm-workspace.yaml (pnpm v11 reads overrides from there, not package.json):
#
#    overrides:
#      "@next/swc-win32-x64-msvc": "file:./vendor/swc.tgz"
#
# 3. pnpm install   (uses the local file, no network for that package)
#
# 4. Remove the override, then regenerate a clean, portable lockfile offline:
pnpm install --lockfile-only --offline
pnpm install --offline
```

The vendored tarball is byte-identical to the registry copy, so the lockfile integrity stays correct and the override never needs to be committed.

---

Questions: ask Adam. Welcome aboard.
