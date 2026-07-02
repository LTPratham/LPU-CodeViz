import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  let role = "student";
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|; )mock_role=([^;]*)/);
    if (match) role = match[1];
  }

  const mockUser = {
    id: "test-user-id",
    email: role === "teacher" ? "teacher@university.edu" : "student@university.edu",
    user_metadata: { full_name: role === "teacher" ? "Dr. Alice Smith" : "Jane Doe" },
    app_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString()
  };

  const mockProfile = {
    id: "test-user-id",
    full_name: role === "teacher" ? "Dr. Alice Smith" : "Jane Doe",
    avatar_url: null,
    role: (role === "student" || role === "teacher") ? role : null,
    email: role === "teacher" ? "teacher@university.edu" : "student@university.edu",
    xp: role === "teacher" ? 0 : 1250,
    streak_days: role === "teacher" ? 0 : 12
  };

  const mockQueryBuilder = (table: string) => {
    const builder: any = {
      select: (cols: string, opts?: any) => builder,
      insert: (val: any) => builder,
      update: (val: any) => builder,
      upsert: (val: any) => builder,
      delete: () => builder,
      eq: (col: string, val: any) => builder,
      neq: (col: string, val: any) => builder,
      gt: (col: string, val: any) => builder,
      lt: (col: string, val: any) => builder,
      in: (col: string, val: any) => builder,
      order: (col: string, opts: any) => builder,
      limit: (n: number) => builder,
      single: async () => {
        if (table === "profiles") {
          return { data: mockProfile, error: null };
        }
        return { data: null, error: null };
      },
      maybeSingle: async () => {
        if (table === "profiles") {
          return { data: mockProfile, error: null };
        }
        return { data: null, error: null };
      },
      count: 0,
      then: (onfulfilled: any) => {
        let data: any = [];
        let count: number | null = null;
        if (table === "profiles") {
          data = mockProfile;
        } else if (table === "trace_history") {
          data = [
            { id: "1", lang: "python", data_structure: "binary_tree", code: "def insert(root, key):\n    if root is None:\n        return Node(key)\n...", step_count: 8, created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: "2", lang: "python", data_structure: "bst", code: "def bst_insert(root, key):\n    ...", step_count: 12, created_at: new Date(Date.now() - 7200000).toISOString() }
          ];
        } else if (table === "student_progress") {
          data = [
            { algorithm_type: "binary_tree", trace_count: 8, last_traced_at: new Date().toISOString() },
            { algorithm_type: "bst", trace_count: 5, last_traced_at: new Date().toISOString() }
          ];
        } else if (table === "enrollments") {
          if (role === "teacher") {
            count = 15;
            data = [];
          } else {
            data = [
              {
                classroom: {
                  id: "class-1",
                  name: "Design & Analysis of Algorithms",
                  course_code: "CSE-301",
                  teacher: { full_name: "Dr. Alice Smith" }
                }
              }
            ];
          }
        } else if (table === "assignments") {
          data = [
            {
              id: "assign-1",
              title: "Binary Tree Visualizer Assignment",
              deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
              description: "Visualize a BST and insert 5 keys.",
              course_code: "CSE-301",
              classroom_id: "class-1",
              classroom: { name: "Design & Analysis of Algorithms" }
            }
          ];
        } else if (table === "submissions") {
          data = [
            { id: "sub-1", assignment_id: "assign-1", xp_awarded: 100, created_at: new Date().toISOString() }
          ];
        } else if (table === "classrooms") {
          data = [
            { id: "class-1", name: "Design & Analysis of Algorithms", course_code: "CSE-301", student_count: 15 },
            { id: "class-2", name: "Data Structures & Algorithms Laboratory", course_code: "CSE-302", student_count: 22 }
          ];
        }
        return Promise.resolve(onfulfilled({ data, error: null, count }));
      }
    };
    return builder;
  };

  const client = {
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      getSession: async () => ({ data: { session: { user: mockUser } }, error: null }),
      onAuthStateChange: (callback: any) => {
        setTimeout(() => callback("SIGNED_IN", { user: mockUser }), 10);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signOut: async () => {
        if (typeof window !== "undefined") {
          document.cookie = "mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        }
        return { error: null };
      },
      signUp: async () => ({ data: { user: mockUser }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
      signInWithOtp: async () => ({ data: { user: mockUser }, error: null }),
      verifyOtp: async () => ({ data: { user: mockUser }, error: null }),
      signInWithOAuth: async () => ({ data: { user: mockUser }, error: null }),
    },
    from: mockQueryBuilder,
    rpc: async (fn: string, args?: any) => {
      return { data: null, error: null };
    }
  };

  return client as any;
}
