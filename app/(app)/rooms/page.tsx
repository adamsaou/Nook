import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { createRoom, joinByCode, joinRandom, joinRoom } from "./actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: publicRooms }, { data: memberships }] = await Promise.all([
    supabase
      .from("rooms")
      .select("id, name, visibility, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("room_members")
      .select("room_id, rooms(id, name, visibility)")
      .eq("user_id", user!.id),
  ]);

  const myRoomIds = new Set((memberships ?? []).map((m) => m.room_id));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Study rooms<span className="text-accent">.</span>
          </h1>
          <p className="mt-1 text-foreground/60">
            Your space to focus with others, drop in anytime and stay as long as you like.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        {/* Create + random */}
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-surface p-5 shadow-sm">
          <form action={createRoom} className="flex flex-col gap-3 sm:flex-row">
            <input
              name="name"
              required
              maxLength={60}
              placeholder="New room name"
              className="flex-1 rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <select
              name="visibility"
              defaultValue="public"
              className="rounded-lg border border-foreground/15 bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
            <SubmitButton>
              Create
            </SubmitButton>
          </form>
          <form action={joinRandom}>
            <Button type="submit" variant="secondary" className="w-full py-2.5">
              🎲 Join a random room
            </Button>
          </form>
          <form action={joinByCode} className="flex gap-2">
            <input name = "code" required maxLength={6} placeholder="Enter a join code" className="flex-1 rounded-lg border border-foreground/15 bg-surface px-4 py-2.5 text-sm uppercase tracking-widest outline-none focus:border-accent"
            />
            <Button type="submit" variant="outlined" className="py-2.5">
              Join
            </Button>
          </form>
        </div>

        {/* Public rooms */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/50">
            Public rooms
          </h2>
          {publicRooms && publicRooms.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {publicRooms.map((room) => (
                <li
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-foreground/10 bg-surface px-4 py-3"
                >
                  <span className="font-medium">{room.name}</span>
                  {myRoomIds.has(room.id) ? (
                    <Link href={`/rooms/${room.id}`}>
                      <Button variant="outlined" className="px-4 py-1.5 text-xs">
                        Enter
                      </Button>
                    </Link>
                  ) : (
                    <form action={joinRoom}>
                      <input type="hidden" name="roomId" value={room.id} />
                      <Button type="submit" variant="primary" className="px-4 py-1.5 text-xs">
                        Join
                      </Button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground/50">No public rooms yet. Create the first one!</p>
          )}
        </section>
    </main>
  );
}
