// src/app/auth/callback/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        // New PKCE/magic-link flow: ?code=...
        const code = search.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code); // <-- pass string
          if (error) throw error;

          router.replace("/me");
          return;
        }

        // Legacy hash fallback
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
          router.replace("/me");
          return;
        }

        router.replace("/login?error=no_tokens");
      } catch (e) {
        console.error("Auth callback error:", e);
        router.replace("/login?error=auth");
      }
    })();
  }, [router, search]);

  return <main className="p-6">Signing you in…</main>;
}