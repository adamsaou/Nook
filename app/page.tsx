import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { APP_DESCRIPTION } from "@/lib/constants";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-5xl font-extrabold tracking-tight sm:text-6xl">
          Nook<span className="text-accent">.</span>
        </span>
        <p className="max-w-md text-lg text-foreground/60">{APP_DESCRIPTION}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/focus">
          <Button variant="primary" className="px-8 py-3 text-base">Start focusing</Button>
        </Link>
        <Link href="/rooms">
          <Button variant="outlined" className="px-8 py-3 text-base">Study rooms</Button>
        </Link>
      </div>

      <Link href="/login" className="text-sm text-foreground/50 underline-offset-4 hover:underline">
        Log in
      </Link>
    </main>
  );

}
