"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const ALLOWED = new Set(["executive", "developer"]); // who can access

export default function AdminHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meName, setMeName] = useState<string>("");
  const [meRole, setMeRole] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) Require session
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id || null;
      const email = sess?.session?.user?.email || null;
      if (!uid || !email) {
        router.replace("/login");
        return;
      }

      // 2) Ensure I have a users row (creates one if missing)
      await supabase
        .from("users")
        .upsert({ user_id: uid, email }, { onConflict: "user_id" });

      // 3) Fetch my profile (prefer user_id)
      let role = "";
      let fullName = "";

      const byUid = await supabase
        .from("users")
        .select("full_name, role")
        .eq("user_id", uid)
        .single();

      if (!byUid.error && byUid.data) {
        role = (byUid.data.role || "").toString();
        fullName = byUid.data.full_name || "";
      } else {
        const byEmail = await supabase
          .from("users")
          .select("full_name, role")
          .eq("email", email)
          .single();
        if (!byEmail.error && byEmail.data) {
          role = (byEmail.data.role || "").toString();
          fullName = byEmail.data.full_name || "";
        }
      }

      const roleKey = role.trim().toLowerCase(); // 👈 case-insensitive
      if (!ALLOWED.has(roleKey)) {
        // not allowed → bounce
        router.replace("/");
        return;
      }

      if (mounted) {
        setMeName(fullName || email);
        setMeRole(roleKey);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-8">Loading admin…</div>
      </main>
    );
  }

  const card = "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm";
  const btn =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out " +
    "shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px] active:translate-y-0";

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admin Dashboard</h1>
          <p className="text-zinc-600 mt-1">
            Signed in as <span className="font-medium">{meName}</span> (
            <span className="capitalize">{meRole}</span>)
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/users" className={btn}>View Participants</Link>
          <Link href="/me" className={btn}>My Profile</Link>
        </div>
      </div>

      {/* Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">People & Assignments</h2>
          <p className="text-zinc-600 mt-1">Manage delegates, chairs, and assignments.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/assign" className={btn}>Assign Country & Committee</Link>
            <Link href="/users" className={btn}>Participants List</Link>
          </div>
        </section>

        <section className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Announcements</h2>
          <p className="text-zinc-600 mt-1">Post global or committee updates.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/announcements" className={btn}>Open Announcements</Link>
          </div>
        </section>

        <section className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Committees</h2>
          <p className="text-zinc-600 mt-1">Configure committees, topics, countries.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/committees" className={btn}>Manage Committees</Link>
          </div>
        </section>

        <section className={card}>
          <h2 className="text-xl font-semibold text-zinc-900">Analytics & Tools</h2>
          <p className="text-zinc-600 mt-1">Participation, voting, warnings, speeches.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/admin/analytics" className={btn}>Open Analytics</Link>
          </div>
        </section>
      </div>
    </main>
  );
}