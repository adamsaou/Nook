import FocusSession from "@/components/focus/FocusSession";
import { createClient } from "@/lib/supabase/server";

export default async function FocusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <FocusSession userId={user?.id ?? null} />;
}
