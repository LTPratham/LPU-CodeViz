import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("Supabase keys are missing. Auth functions will run in offline demo mode.");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: (callback: any) => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        signOut: async () => ({ error: null }),
        signUp: async () => ({ data: { user: null }, error: new Error("Authentication disabled (Offline Mode)") }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error("Authentication disabled (Offline Mode)") }),
        signInWithOtp: async () => ({ data: { user: null }, error: new Error("Authentication disabled (Offline Mode)") }),
        verifyOtp: async () => ({ data: { user: null }, error: new Error("Authentication disabled (Offline Mode)") }),
      }
    } as unknown as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, anonKey);
}

