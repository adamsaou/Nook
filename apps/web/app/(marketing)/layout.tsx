import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Marketing shell (the public landing). Kept fully separate from the app:
 * a signed-in user never sees marketing — they're sent straight into the product.
 */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/focus");

  return <>{children}</>;
}
