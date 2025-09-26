"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user?.email) {
        router.replace("/login");
        return;
      }
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, [router]);

  if (!ready) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-8">Loading…</div>
      </main>
    );
  }

  // Professional button styles
  const btn =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 transition shadow-sm hover:shadow-md hover:-translate-y-px " +
    "hover:border-zinc-400 active:translate-y-0";

  const btnSm = btn + " text-sm";
  const card = "rounded-xl border border-zinc-200 bg-white p-6";
  const soft = "rounded-xl border border-zinc-200 bg-white p-6";

  return (
    <main className="animate-fade-in">
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
          <div
            role="heading"
            aria-level={1}
            className="uppercase font-extrabold text-white leading-[0.9] drop-shadow-2xl
                       text-[12vw] md:text-[96px]"
            style={{ letterSpacing: "-0.02em" }}
          >
            MUNOTR XIX
          </div>

          <div className="mt-4 font-bold text-white opacity-95 drop-shadow-md
                          text-[5.2vw] md:text-[32px]">
            November 7–8, 2025
          </div>
        </div>
      </section>

      {/* ===== STACKED CONTENT ===== */}
      <section className="max-w-6xl mx-auto px-6 space-y-10 -mt-8 pb-16">
        {/* Quick Actions */}
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-zinc-900">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/committees" className={btn}>View Committees</Link>
              <Link href="/me" className={btn}>Edit Profile</Link>
              <Link href="/login" className={btn}>Change Password</Link>
              <Link href="/session" className={btn}>Enter Committee Session</Link>
            </div>
          </div>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={soft}>
            <h3 className="text-lg font-semibold text-zinc-900">Profile</h3>
            <p className="text-zinc-600 mt-1">Update your name, committee, and country.</p>
            <Link href="/me" className={`${btnSm} mt-3`}>Open Profile</Link>
          </div>

          <div className={soft}>
            <h3 className="text-lg font-semibold text-zinc-900">Committees</h3>
            <p className="text-zinc-600 mt-1">Agendas &amp; country lists.</p>
            <Link href="/committees" className={`${btnSm} mt-3`}>Explore</Link>
          </div>

          <div className={soft}>
            <h3 className="text-lg font-semibold text-zinc-900">Admin</h3>
            <p className="text-zinc-600 mt-1">Delegates &amp; announcements.</p>
            <Link href="/admin" className={`${btnSm} mt-3`}>Go to Admin</Link>
          </div>
        </div>

        {/* Resources */}
        <div className={card}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Conference Resources</h2>
              <p className="text-zinc-600">Rules of procedure, country lists, deadlines.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/resources" className={btn}>Resources</Link>
              <Link href="/committees" className={btn}>Committees</Link>
            </div>
          </div>
        </div>

        {/* ✅ NEW: Participants section */}
        <div className={card}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Meet the Participants</h2>
              <p className="text-zinc-600">Browse all delegates, chairs, and admins.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/users" className={btn}>View Participants</Link>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}