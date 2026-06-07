"use client";

import { Button } from "@/components/ui/Button";
import { useVoiceRoom } from "@/lib/voice/useVoiceRoom";

export function VoiceControls({
  roomId,
  userId,
  username,
}: {
  roomId: string;
  userId: string;
  username: string;
}) {
  const voice = useVoiceRoom({ roomId, userId, username });

  return (
    <div className="rounded-2xl border border-foreground/10 bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/50">
          Voice{voice.count > 0 ? ` · ${voice.count} in` : ""}
        </h2>

        {voice.joined ? (
          <div className="flex gap-2">
            <Button
              variant={voice.muted ? "primary" : "outlined"}
              className="px-3 py-1.5 text-xs"
              onClick={voice.toggleMute}
            >
              {voice.muted ? "🔇 Unmute" : "🎙️ Mute"}
            </Button>
            <Button variant="outlined" className="px-3 py-1.5 text-xs" onClick={voice.leave}>
              Leave
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            className="px-4 py-1.5 text-xs"
            disabled={voice.joining || voice.full}
            onClick={() => void voice.join()}
          >
            {voice.full ? "Voice full" : voice.joining ? "Joining…" : "Join voice"}
          </Button>
        )}
      </div>

      {voice.error && <p className="mb-2 text-xs text-red-600">{voice.error}</p>}

      {voice.joined ? (
        <ul className="flex flex-wrap gap-2">
          {voice.members.map((m) => {
            const speaking = voice.speakingIds.includes(m.userId);
            return (
              <li
                key={m.userId}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition ${
                  speaking ? "bg-accent/15 ring-2 ring-accent" : "bg-foreground/5"
                }`}
              >
                <span className={speaking ? "text-accent" : "text-foreground/25"}>●</span>
                {m.username}
                {m.userId === userId && " (you)"}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-foreground/40">
          {voice.count > 0
            ? `${voice.count} in voice. Join to listen and talk.`
            : "No one's in voice yet. Be the first."}
        </p>
      )}
    </div>
  );
}
