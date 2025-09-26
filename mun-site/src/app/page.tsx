"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function PublicLanding() {
  const router = useRouter();

  // If already logged in, go to /home
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data?.session?.user) router.replace("/home");
    })();
    return () => { mounted = false; };
  }, [router]);

  // Reusable button class (white, subtle hover)
  const btn =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out " +
    "shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px] active:translate-y-0";

  return (
    <main className="animate-fade-in">
      {/* ===== HERO (edge-to-edge, ~50vh) ===== */}
      {/* ===== HERO (edge-to-edge, ~50vh) ===== */}
      <section className="relative w-full h-[50vh] min-h-[360px] overflow-hidden">
        <Image
          src="/hero.jpg" // ensure /public/hero.jpg exists
          alt="Conference"
          fill
          priority
          className="object-cover"
        />

        {/* overlay BELOW text */}
        <div className="absolute inset-0 z-0 bg-black/50" />

        {/* text ABOVE overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          {/* MASSIVE, BLOCKY, WHITE */}
          <div
            role="heading"
            aria-level={1}
            className="uppercase font-extrabold text-white leading-[0.9] drop-shadow-2xl
                       text-[12vw] md:text-[96px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            MUNOTR XIX
          </div>

          {/* Bigger than before, smaller than title */}
          <div className="mt-4 font-bold text-white opacity-95 drop-shadow-md
                          text-[5.2vw] md:text-[32px]">
            November 7–8, 2025
          </div>
        </div>
      </section>

      {/* ===== INTRO + CTA (no extra sections) ===== */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          Welcome to MUN On The Rhine
        </h2>
        <p className="mt-4 text-zinc-600 leading-7">
          Join delegates from our school for two days of focused diplomacy,
          research-driven debate, and impactful resolutions in our school.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className={btn}>Sign Up</Link>
          <Link href="/login" className={btn}>Log In</Link>
        </div>
      </section>
    </main>
  );
}