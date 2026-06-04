import { signout } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "./Wordmark";

export function AppHeader({ username }: { username?: string | null }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <Wordmark />
      <div className="flex items-center gap-3 text-sm">
        {username && <span className="text-foreground/60">@{username}</span>}
        <form action={signout}>
          <Button type="submit" variant="outlined" className="px-4 py-2 text-xs">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
