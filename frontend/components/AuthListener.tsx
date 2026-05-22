"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push("/reset-password");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
