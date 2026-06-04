import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/shared/Wordmark";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-3xl border border-foreground/10 bg-surface p-8 shadow-sm">
        <div className="flex flex-col gap-1 text-center">
          <Wordmark className="mx-auto" />
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-foreground/60">Focus together in study rooms.</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <form action={signup} className="flex flex-col gap-3">
          <input
            name="username"
            type="text"
            required
            minLength={2}
            maxLength={32}
            placeholder="Username"
            className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
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
            minLength={6}
            placeholder="Password (min 6 characters)"
            className="w-full rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" variant="primary" className="mt-1 w-full py-3">
            Sign up
          </Button>
        </form>

        <p className="text-center text-sm text-foreground/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
