"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/visualize");
}

export async function signup(formData: FormData, role: "student" | "teacher" = "student", facultyKey?: string) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (role === "teacher") {
    const expectedKey = process.env.FACULTY_VERIFICATION_KEY || "LPU-FACULTY-2026";
    if (facultyKey !== expectedKey) {
      return { error: "Unauthorized: Invalid Faculty Verification Key." };
    }
  }

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  // Auto-create profile with selected role on signup
  if (signUpData?.user) {
    await supabase
      .from("profiles")
      .upsert({
        id: signUpData.user.id,
        email: data.email,
        role: role,
        full_name: data.email.split("@")[0],
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
  }

  revalidatePath("/", "layout");
  redirect("/visualize");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
