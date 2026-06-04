"use client";

import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const PROVIDERS: { id: Provider; label: string }[] = [
  { id: "google", label: "Continue with Google" },
  { id: "discord", label: "Continue with Discord" },
  { id: "slack_oidc", label: "Continue with Slack" },
];

export function OAuthButtons({ next = "/rooms" }: { next?: string }) {
  const supabase = createClient();

  async function signIn(provider: Provider) {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map((p) => (
        <Button
          key={p.id}
          type="button"
          variant="outlined"
          className="w-full py-2.5"
          onClick={() => signIn(p.id)}
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
