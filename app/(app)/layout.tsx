import { ViewTransition } from "react";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/shared/AppNav";

/** Shell for the in-app pages (focus, rooms, profile): shared nav + session. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppNav username={username} />
      <ViewTransition>{children}</ViewTransition>
    </div>
  );
}
