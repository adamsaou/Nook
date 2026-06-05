"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

/** In-room invite panel: shows the join code and copies code / share link. */
export function ShareRoom({ code }: { code: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  async function copy(kind: "code" | "link") {
    const text =
      kind === "code" ? code : `${window.location.origin}/rooms/join?code=${code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard blocked — ignore
    }
  }

  return (
    <div className="rounded-2xl border border-foreground/10 bg-surface p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
        Invite
      </h2>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-lg tracking-[0.3em]">{code}</span>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            className="px-3 py-1.5 text-xs"
            onClick={() => copy("code")}
          >
            {copied === "code" ? "Copied!" : "Copy code"}
          </Button>
          <Button
            variant="primary"
            className="px-3 py-1.5 text-xs"
            onClick={() => copy("link")}
          >
            {copied === "link" ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
