import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/shared/AppHeader";
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

  const { data: room } = await supabase
    .from("rooms")
    .select("id, name, visibility, created_by")
    .eq("id", id)
    .maybeSingle();
  if (!room) notFound();

  // Ensure membership (auto-join public rooms entered directly).
  const { data: membership } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("room_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) {
    if (room.visibility === "public") {
      await supabase
        .from("room_members")
        .upsert({ room_id: id, user_id: user.id }, { onConflict: "room_id,user_id" });
    } else {
      redirect(`/rooms?error=${encodeURIComponent("That room is private")}`);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: rows } = await supabase
    .from("messages")
    .select("id, user_id, content, created_at, profiles(username)")
    .eq("room_id", id)
    .order("created_at", { ascending: true })
    .limit(50);

  const initialMessages = (rows ?? []).map((m) => ({
    id: m.id as string,
    user_id: m.user_id as string,
    content: m.content as string,
    created_at: m.created_at as string,
    username:
      (m.profiles as { username?: string } | null)?.username ?? "anon",
  }));

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader username={profile?.username} />
      <RoomView
        roomId={room.id}
        roomName={room.name}
        userId={user.id}
        username={profile?.username ?? "anon"}
        initialMessages={initialMessages}
      />
    </div>
  );
}
