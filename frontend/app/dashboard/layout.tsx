import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import DashboardTopBar from "./DashboardTopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  // Fetch profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, email")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "student";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <DashboardTopBar profile={profile} userId={user.id} />
      <main
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
