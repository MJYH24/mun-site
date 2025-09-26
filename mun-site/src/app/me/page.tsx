"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ProfileRow = {
  id: string | null;
  email: string;
  full_name: string | null;
  role: string | null;
  grade: string | null; // '≤8' | '9' | '10' | '11' | '12' | null
  bio: string | null;
  past_conferences: number | null;
  awards: string | null;
};

const grades = ["≤8", "9", "10", "11", "12"];

export default function MePage() {
  const router = useRouter();

  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [row, setRow] = useState<ProfileRow | null>(null);

  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [bio, setBio] = useState("");
  // NOTE: store as string so the input can be empty ("")
  const [pastConfs, setPastConfs] = useState<string>(""); 
  const [awards, setAwards] = useState("");

  const [role, setRole] = useState<string>("delegate"); // display only
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        // wait for auth event before redirecting
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
          if (session?.user?.email) initProfile(session.user.email);
          else router.replace("/login");
        });
        return () => sub.subscription.unsubscribe();
      }
      if (mounted && data.user.email) await initProfile(data.user.email);
    })();
    return () => { mounted = false; };
  }, [router]);

  async function initProfile(email: string) {
    setAuthEmail(email);

    // ensure row exists
    await supabase.from("users").upsert({ email }, { onConflict: "email" });

    const { data: p, error } = await supabase
      .from("users")
      .select("id, email, full_name, role, grade, bio, past_conferences, awards")
      .eq("email", email)
      .single();

    if (error) {
      console.error("profile fetch error:", error.message);
      setMsg("❌ Couldn't load your profile");
      setLoading(false);
      return;
    }

    const safe: ProfileRow = {
      id: p?.id ?? null,
      email: p?.email ?? email,
      full_name: p?.full_name ?? "",
      role: p?.role ?? "delegate",
      grade: p?.grade ?? "",
      bio: p?.bio ?? "",
      past_conferences: typeof p?.past_conferences === "number" ? p.past_conferences : null,
      awards: p?.awards ?? "",
    };

    setRow(safe);
    setFullName(String(safe.full_name || ""));
    setRole(String(safe.role || "delegate"));
    setGrade(String(safe.grade || ""));
    setBio(String(safe.bio || ""));
    // convert to string; allow empty if null
    setPastConfs(safe.past_conferences === null ? "" : String(safe.past_conferences));
    setAwards(String(safe.awards || ""));
    setLoading(false);
  }

  async function handleSave() {
    if (!authEmail) return;

    setMsg("");
    if (grade && !grades.includes(grade)) {
      setMsg("❌ Grade must be one of ≤8, 9, 10, 11, 12");
      return;
    }

    setSaving(true);

    // Convert string → number or null
    const pastConf =
      pastConfs.trim() === ""
        ? null
        : Number.isFinite(Number(pastConfs))
        ? Number(pastConfs)
        : null; // if invalid, treat as null

    const payload = {
      email: authEmail,
      full_name: fullName.trim() || null,
      grade: grade || null,
      bio: bio.trim() || null,
      past_conferences: pastConf, // <-- can be null now
      awards: awards.trim() || null,
    };

    const { error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      console.error("save error:", error);
      setMsg("❌ " + error.message);
    } else {
      setMsg("✅ Profile saved");
      await initProfile(authEmail);
    }
    setSaving(false);
  }

  if (loading) return <main className="p-6">Loading your profile…</main>;
  if (!row) return <main className="p-6">No profile found.</main>;

  const btn =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out " +
    "shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px] active:translate-y-0";

  const input =
    "w-full px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 " +
    "placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

  return (
    <main className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">My Profile</h1>
          <p className="text-zinc-600 mt-1">
            Role: <span className="capitalize">{role}</span>
          </p>
        </div>

        {row.id && (
          <Link href={`/profile/${row.id}`} className={btn}>
            View Public Profile
          </Link>
        )}
      </div>

      {/* Name / Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            className={input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Maxim Jiang"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Role</label>
          <input className={`${input} bg-zinc-100`} value={role} disabled />
        </div>
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm font-semibold mb-1">Grade</label>
        <select
          className={input}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          <option value="">Select your grade</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold mb-1">About You</label>
        <textarea
          className={input}
          rows={4}
          placeholder="Tell us a bit about yourself…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Past conferences / Awards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-1">
            Past Conferences Attended
          </label>
          <input
            type="number"
            min={0}
            className={input}
            // store as string so it may be empty
            value={pastConfs}
            onChange={(e) => setPastConfs(e.target.value)}
            placeholder="(optional)"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Leave empty if you don’t want to show this.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Awards</label>
          <input
            className={input}
            placeholder="e.g. Best Delegate, Honorable Mention…"
            value={awards}
            onChange={(e) => setAwards(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className={btn}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
        {msg && (
          <span
            className={`text-sm ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </span>
        )}
      </div>
    </main>
  );
}