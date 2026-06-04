# Project Start

Nook is a study platform built with [Next.js](https://nextjs.org) (App Router) and TypeScript.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

| Path           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `app/`         | Routes (App Router). Each folder is a route segment |
| `components/`  | Reusable React components (`ui/`, `focus/`, `shared/`) |
| `lib/`         | Framework-agnostic helpers and constants            |
| `public/`      | Static assets served as-is (`branding/`)            |
| `styles/`      | Global stylesheets                                  |
| `docs/`        | Project documentation                               |

## Conventions

- Import via the `@/*` alias (e.g. `import { cn } from "@/lib/utils"`).
- Route UI lives in `app/<segment>/page.tsx`.
