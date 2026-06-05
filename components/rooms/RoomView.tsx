"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ShareRoom } from "./ShareRoom";
import { DEFAULT_FOCUS_MINUTES } from "@/lib/constants";

type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
};

type Member = {
  userId: string;
  username: string;
  focusing: boolean;
  endsAt: number | null;
};

function format(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.max(0, totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RoomView({
  roomId,
  roomName,
  userId,
  username,
  joinCode,
  initialMessages,
}: {
  roomId: string;
  roomName: string;
  userId: string;
  username: string;
  joinCode: string;
  initialMessages: ChatMessage[];
}) {
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [members, setMembers] = useState<Member[]>([]);
  const [draft, setDraft] = useState("");
  const [focusing, setFocusing] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const presenceChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const usernames = useRef<Map<string, string>>(
    new Map(initialMessages.map((m) => [m.user_id, m.username])),
  );
  usernames.current.set(userId, username);

  // ---- Presence: who's here + who's focusing ----
  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    });
    presenceChannel.current = channel;

    const recompute = () => {
      const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
      const list: Member[] = Object.values(state)
        .map((entries) => {
          // A refresh can briefly leave a stale entry behind before the old
          // connection times out — pick the most recently updated one.
          const p = entries.reduce((a, b) =>
            Number(b.updatedAt ?? 0) >= Number(a.updatedAt ?? 0) ? b : a,
          );
          return {
            userId: String(p.userId ?? ""),
            username: String(p.username ?? "anon"),
            focusing: Boolean(p.focusing),
            endsAt: typeof p.endsAt === "number" ? p.endsAt : null,
          };
        })
        .filter((m) => m.userId);
      setMembers(list);
    };

    channel
      .on("presence", { event: "sync" }, recompute)
      .on("presence", { event: "join" }, recompute)
      .on("presence", { event: "leave" }, recompute);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channel.track({ userId, username, focusing: false, endsAt: null, updatedAt: Date.now() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
      presenceChannel.current = null;
    };
  }, [supabase, roomId, userId, username]);

  // ---- Chat: stream new messages ----
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            content: string;
            created_at: string;
          };
          let uname: string = usernames.current.get(row.user_id) ?? "";
          if (!uname) {
            const { data } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", row.user_id)
              .single();
            uname = data?.username ?? "anon";
            usernames.current.set(row.user_id, uname);
          }
          setMessages((prev) =>
            prev.some((m) => m.id === row.id)
              ? prev
              : [...prev, { ...row, username: uname }],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId]);

  useEffect(() => {
    const beat = () => {
      void supabase.rpc("touch_room", { p_room_id: roomId});
    };
    beat();
    const id = setInterval(beat, 30000);
    return () => clearInterval(id);
  }, [supabase, roomId]);

  // ---- One ticker: drives all displayed timers + completion ----
  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (focusing && endsAt !== null && t >= endsAt) {
        void endFocus(true);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusing, endsAt]);

  function startFocus() {
    const ends = Date.now() + DEFAULT_FOCUS_MINUTES * 60 * 1000;
    setNow(Date.now());
    setFocusing(true);
    setEndsAt(ends);
    presenceChannel.current?.track({ userId, username, focusing: true, endsAt: ends, updatedAt: Date.now() });
  }

  async function endFocus(completed: boolean) {
    const startedAt = endsAt
      ? endsAt - DEFAULT_FOCUS_MINUTES * 60 * 1000
      : Date.now();
    setFocusing(false);
    setEndsAt(null);
    presenceChannel.current?.track({ userId, username, focusing: false, endsAt: null, updatedAt: Date.now() });
    await supabase.from("focus_sessions").insert({
      user_id: userId,
      room_id: roomId,
      planned_minutes: DEFAULT_FOCUS_MINUTES,
      started_at: new Date(startedAt).toISOString(),
      ended_at: new Date().toISOString(),
      completed,
      reflection: null,
    });
  }

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    await supabase.from("messages").insert({
      room_id: roomId,
      user_id: userId,
      content,
    });
  }

  const myRemaining =
    focusing && endsAt !== null ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : DEFAULT_FOCUS_MINUTES * 60;
  const focusingCount = members.filter((m) => m.focusing).length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/rooms" className="text-sm text-foreground/50 hover:underline">
            ← All rooms
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {roomName}<span className="text-accent">.</span>
          </h1>
        </div>
        <span className="text-sm text-foreground/60">
          {members.length} here · {focusingCount} focusing
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
        {/* Left: focus + presence */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-foreground/10 bg-surface p-6 shadow-sm">
            <div className="font-mono text-5xl font-semibold tabular-nums">
              {format(myRemaining)}
            </div>
            {focusing ? (
              <Button variant="outlined" onClick={() => void endFocus(false)}>
                End session
              </Button>
            ) : (
              <Button variant="primary" onClick={startFocus} className="px-8 py-3">
                Start Focus
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-foreground/10 bg-surface p-4 shadow-sm">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
              In this room
            </h2>
            <ul className="flex flex-col gap-1.5">
              {members.map((m) => {
                const left =
                  m.focusing && m.endsAt
                    ? Math.max(0, Math.ceil((m.endsAt - now) / 1000))
                    : null;
                return (
                  <li key={m.userId} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className={m.focusing ? "text-accent" : "text-foreground/30"}>●</span>
                      {m.username}
                      {m.userId === userId && <span className="text-foreground/40"> (you)</span>}
                    </span>
                    <span className="font-mono text-xs text-foreground/50">
                      {left !== null ? format(left) : "idle"}
                    </span>
                  </li>
                );
              })}
              {members.length === 0 && (
                <li className="text-sm text-foreground/40">Connecting…</li>
              )}
            </ul>
          </div>

          <ShareRoom code={joinCode} />
        </div>

        {/* Right: chat */}
        <div className="flex min-h-[24rem] flex-col rounded-2xl border border-foreground/10 bg-surface shadow-sm">
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m) => (
              <div key={m.id} className="text-sm">
                <span className="font-semibold">{m.username}</span>{" "}
                <span className="text-foreground/80">{m.content}</span>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-sm text-foreground/40">No messages yet. Say hi 👋</p>
            )}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-foreground/10 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              placeholder="Message the room…"
              className="flex-1 rounded-lg border border-foreground/15 bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <Button type="submit" variant="primary" className="px-4 py-2 text-sm">
              Send
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
