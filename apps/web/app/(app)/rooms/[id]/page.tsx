import { notFound, redirect } from "next/navigation";
import {
  getRoom,
  getRoomMembership,
  getRoomMessages,
  getUsername,
  joinRoom,
} from "@nook/api";
import { createClient } from "@/lib/supabase/server";
import { RoomView } from "@/components/rooms/RoomView";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: room } = await getRoom(supabase, id);
  if (!room) notFound();

  // Ensure membership (auto-join public rooms entered directly).
  const { data: membership } = await getRoomMembership(supabase, id, user.id);
  if (!membership) {
    if (room.visibility === "public") {
      await joinRoom(supabase, id);
    } else {
      redirect(`/rooms?error=${encodeURIComponent("That room is private")}`);
    }
  }

  const { data: profile } = await getUsername(supabase, user.id);

  const { data: rows } = await getRoomMessages(supabase, id);

  const initialMessages = (rows ?? []).map((m) => ({
    id: m.id as string,
    user_id: m.user_id as string,
    content: m.content as string,
    created_at: m.created_at as string,
    username:
      (m.profiles as { username?: string } | null)?.username ?? "anon",
  }));

  return (
    <RoomView
      roomId={room.id}
      roomName={room.name}
      userId={user.id}
      username={profile?.username ?? "anon"}
      joinCode={room.join_code}
      kind={room.kind}
      initialMessages={initialMessages}
    />
  );
}
