import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function StudentDashboardLayout({
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

  if (!user && mockRole !== "student") {
    redirect("/login?redirect=/dashboard/student");
  }

  // If mock role is active, skip db check
  if (mockRole === "student") {
    return <>{children}</>;
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const role = profile?.role ?? "student";

  if (role === "teacher" || role === "hod" || role === "admin") {
    redirect("/dashboard/teacher");
  }

  return <>{children}</>;
}
