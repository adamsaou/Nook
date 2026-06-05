import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Share-link target: /rooms/join?code=XXXXXX — joins via the code, then forwards
// into the room. ("join" is a static segment so it never collides with [id].)
export default async function JoinByLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  if (!code) redirect(`/rooms?error=${encodeURIComponent("Missing join code")}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/rooms/join?code=${code}`)}`);
  }

  const { data, error } = await supabase.rpc("join_room_by_code", { p_code: code });
  if (error) {
    redirect(`/rooms?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/rooms/${data}`);
}
