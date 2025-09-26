"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useRequireSession() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!data?.session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    })();
    return () => { active = false; };
  }, [router]);

  return ready; // false until session confirmed
}