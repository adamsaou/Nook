import Link from "next/link";
import { signout } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { label: "Focus", href: "/focus" },
  { label: "Rooms", href: "/rooms" },
  { label: "Profile", href: "/profile" },
];

/** Shared, auth-aware top navigation for the app pages. */
export function AppNav({ username }: { username?: string | null }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 sm:px-10">
      <div className="flex items-center gap-6">
        <Wordmark />
        <nav className="hidden items-center gap-4 text-sm text-foreground/60 sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {username ? (
          <>
            <span className="hidden text-foreground/60 sm:inline">@{username}</span>
            <form action={signout}>
              <Button type="submit" variant="outlined" className="px-4 py-2 text-xs">
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <Link href="/login">
            <Button variant="primary" className="px-4 py-2 text-xs">
              Log in
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
