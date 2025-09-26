import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,          // keep session in localStorage
      autoRefreshToken: true,        // refresh in background
      detectSessionInUrl: true,      // handle callbacks automatically too
      storageKey: "mun-auth",        // custom key (avoids collisions)
    },
  }
);