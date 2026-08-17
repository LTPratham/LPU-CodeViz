import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function VisualizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const mockRole = cookieStore.get("mock_role")?.value;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !mockRole) {
    redirect("/login?redirect=/visualize");
  }

  return <>{children}</>;
}
