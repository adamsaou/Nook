import Link from "next/link";

/** The "Nook." wordmark with the green accent dot. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`text-2xl font-bold tracking-tight ${className}`}>
      Nook<span className="text-accent">.</span>
    </Link>
  );
}
