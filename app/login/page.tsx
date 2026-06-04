import Link from "next/link";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/shared/Wordmark";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-foreground/10 bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-1 text-center">
          <Wordmark className="mx-auto" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-foreground/60">Log in to join study rooms.</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={login} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next ?? "/rooms"} />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="primary" className="mt-1 w-full py-3">
            Log in
          </Button>
        </form>

        <p className="text-center text-sm text-foreground/60">
          No account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
