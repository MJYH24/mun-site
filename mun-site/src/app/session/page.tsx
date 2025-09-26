"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Central config for the three committees
const COMMITTEES = {
  "ga-beginner": {
    slug: "ga-beginner",
    level: "Beginner",
    name: "General Assembly — Foundational",
    resourcesHref: "/resources/ga-beginner",
    color: "bg-blue-600",
  },
  "eco-intermediate": {
    slug: "eco-intermediate",
    level: "Intermediate",
    name: "ECOSOC — Economic & Social",
    resourcesHref: "/resources/eco-intermediate",
    color: "bg-emerald-600",
  },
  "sc-advanced": {
    slug: "sc-advanced",
    level: "Advanced",
    name: "Security Council — Crisis & Strategy",
    resourcesHref: "/resources/sc-advanced",
    color: "bg-red-600",
  },
} as const;

type Key = keyof typeof COMMITTEES;

function normalizeToSlug(raw?: string | null): Key {
  const v = (raw || "").toLowerCase().trim();

  // If they already store one of our slugs
  if (v in COMMITTEES) return v as Key;

  // Heuristic mapping from free-text committee names to our slugs
  if (v.includes("security")) return "sc-advanced";
  if (v.includes("ecosoc") || v.includes("economic")) return "eco-intermediate";
  if (v.includes("general") || v.includes("ga")) return "ga-beginner";

  // default: beginner GA
  return "ga-beginner";
}

export default function SessionAutoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ full_name?: string | null; role?: string | null; committee?: string | null; country?: string | null; } | null>(null);
  const [slug, setSlug] = useState<Key>("ga-beginner");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const email = sess?.session?.user?.email;
      if (!email) {
        router.replace("/login");
        return;
      }

      // Load the user's committee & country
      const { data, error } = await supabase
        .from("users")
        .select("full_name, role, committee, country")
        .eq("email", email)
        .single();

      if (error) {
        console.error(error);
      }

      const committeeSlug = normalizeToSlug(data?.committee);
      if (mounted) {
        setMe(data ?? null);
        setSlug(committeeSlug);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-8">Loading session…</div>
      </main>
    );
  }

  const cfg = COMMITTEES[slug];
  const role = (me?.role || "delegate").toLowerCase();
  const isChairLike = role === "chair" || role === "executive" || role === "developer";

  // UI tokens
  const card = "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm";
  const btn =
    "inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 text-sm font-semibold transition-all duration-200 " +
    "shadow-sm hover:shadow-md hover:border-zinc-400 hover:bg-zinc-50";
  const pale = "rounded-lg border border-zinc-200 bg-zinc-50 p-4";

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500">{cfg.level}</div>
          <h1 className="text-3xl font-bold text-zinc-900">{cfg.name}</h1>
          <p className="text-zinc-600 mt-1">
            You are {me?.full_name ? <span className="font-medium">{me.full_name}</span> : "signed in"} —{" "}
            <span className="capitalize">{role}</span>
            {me?.country ? <> • Delegation: <span className="font-medium">{me.country}</span></> : null}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={cfg.resourcesHref} className={btn}>Resources</Link>
          <Link href="/committees" className={btn}>Committees</Link>
        </div>
      </header>

      {/* Session “lanes” */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lane 1: Speaker’s List / Queue */}
        <article className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Speaker’s List</h2>
          <p className="text-zinc-600 mt-1">Track and manage the current speaker order.</p>

          <div className={`${pale} mt-4`}>
            <p className="text-sm text-zinc-700">Placeholder: upcoming speakers will appear here.</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>France</li>
              <li>Brazil</li>
              <li>Kenya</li>
            </ul>
            {isChairLike ? (
              <div className="mt-3 flex gap-2">
                <button className={btn}>Add Speaker</button>
                <button className={btn}>Remove</button>
                <button className={btn}>Start Timer</button>
              </div>
            ) : (
              <div className="mt-3">
                <button className={btn}>Request to Speak</button>
              </div>
            )}
          </div>
        </article>

        {/* Lane 2: Motions & Voting */}
        <article className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Motions & Voting</h2>
          <p className="text-zinc-600 mt-1">Raise motions and view voting results.</p>

          <div className={`${pale} mt-4`}>
            <p className="text-sm text-zinc-700">Placeholder: current motion and vote status.</p>
            <div className="mt-2 text-sm text-zinc-700">
              <div>Current motion: —</div>
              <div>Votes: For — | Against — | Abstain —</div>
            </div>

            {isChairLike ? (
              <div className="mt-3 flex gap-2">
                <button className={btn}>Open Vote</button>
                <button className={btn}>Close Vote</button>
                <button className={btn}>New Motion</button>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button className={btn}>Vote For</button>
                <button className={btn}>Vote Against</button>
                <button className={btn}>Abstain</button>
              </div>
            )}
          </div>
        </article>

        {/* Lane 3: Docs & Announcements */}
        <article className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Documents & Announcements</h2>
          <p className="text-zinc-600 mt-1">Resolutions, working papers, and chair updates.</p>

          <div className={`${pale} mt-4 space-y-3`}>
            <div>
              <div className="text-sm font-medium text-zinc-900">Latest announcement</div>
              <div className="text-sm text-zinc-700 mt-1">— (none yet)</div>
              {isChairLike && <button className={`${btn} mt-2`}>Post Announcement</button>}
            </div>

            <div className="pt-2 border-t border-zinc-200">
              <div className="text-sm font-medium text-zinc-900">Documents</div>
              <ul className="mt-1 list-disc pl-5 text-sm text-zinc-700 space-y-1">
                <li><Link className="text-blue-700 hover:underline" href={cfg.resourcesHref}>Committee Resources</Link></li>
                <li><Link className="text-blue-700 hover:underline" href="/resolutions">Draft Resolutions (placeholder)</Link></li>
                <li><Link className="text-blue-700 hover:underline" href="/working-papers">Working Papers (placeholder)</Link></li>
              </ul>
              {isChairLike && <button className={`${btn} mt-2`}>Upload Document</button>}
            </div>
          </div>
        </article>
      </section>

      {/* Session status/footer */}
      <section className="rounded-xl border border-zinc-200 p-5 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.color}`}></span>
          <span className="text-zinc-800 font-medium">In Session — {cfg.name}</span>
        </div>
        <div className="flex gap-2">
          {isChairLike && <button className={btn}>Pause Session</button>}
          <Link href={cfg.resourcesHref} className={btn}>Open Resources</Link>
        </div>
      </section>
    </main>
  );
}