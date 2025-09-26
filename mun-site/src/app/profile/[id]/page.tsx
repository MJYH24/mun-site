"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  grade: string | null;
  bio: string | null;
  past_conferences: number | null;
  awards: string | null;
  country: string | null;
  committee: string | null;
};

export default function PublicProfile() {
  const { id } = useParams();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      setMeEmail(sess?.session?.user?.email ?? null);

      const { data, error } = await supabase
        .from("users")
        .select(
          "id, full_name, email, role, grade, bio, past_conferences, awards, country, committee"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        router.replace("/users");
        return;
      }

      setProfile(data as UserProfile);
      setLoading(false);
    })();
  }, [id, router]);

  if (loading) return <main className="p-8">Loading profile…</main>;
  if (!profile) return <main className="p-8">Profile not found.</main>;

  const isMe = meEmail && meEmail === profile.email;
  const displayRole =
    profile.role && profile.role !== ""
      ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
      : "Delegate";

  return (
    <main className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900">
            {profile.full_name || "Unnamed Delegate"}
          </h1>
          <p className="text-zinc-600 mt-1">
            {displayRole} • {profile.grade ? `Grade ${profile.grade}` : "Grade —"}
          </p>
          <p className="text-sm text-zinc-400 mt-1">{profile.email}</p>
        </div>

        {isMe && (
          <Link
            href="/me"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-300
                       bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out
                       shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px]"
          >
            Edit My Profile
          </Link>
        )}
      </div>

      {/* Bio */}
      <section className="rounded-lg border border-zinc-200 p-5 bg-zinc-50">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">About</h2>
        <p className="text-zinc-700 whitespace-pre-line min-h-[40px]">
          {profile.bio && profile.bio.trim() !== ""
            ? profile.bio
            : "No biography provided yet."}
        </p>
      </section>

      {/* This Year&apos;s Assignment (apostrophe escaped) */}
      <section className="rounded-lg border border-zinc-200 p-5 bg-zinc-50">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          This Year&apos;s Assignment
        </h2>
        <p className="text-zinc-700">
          <span className="font-medium">Country:</span>{" "}
          {profile.country && profile.country.trim() !== ""
            ? profile.country
            : "— (Not assigned yet)"}
        </p>
        <p className="text-zinc-700 mt-1">
          <span className="font-medium">Committee:</span>{" "}
          {profile.committee && profile.committee.trim() !== ""
            ? profile.committee
            : "— (Not assigned yet)"}
        </p>
      </section>

      {/* Past Conferences */}
      <section className="rounded-lg border border-zinc-200 p-5 bg-zinc-50">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">
          Past Conferences
        </h2>
        <p className="text-zinc-700">
          {profile.past_conferences && profile.past_conferences > 0
            ? `${profile.past_conferences} conference${
                profile.past_conferences > 1 ? "s" : ""
              } attended`
            : "— (No conferences recorded yet)"}
        </p>
      </section>

      {/* Awards */}
      <section className="rounded-lg border border-zinc-200 p-5 bg-zinc-50">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Awards</h2>
        <p className="text-zinc-700 min-h-[30px]">
          {profile.awards && profile.awards.trim() !== ""
            ? profile.awards
            : "— (No awards listed yet)"}
        </p>
      </section>
    </main>
  );
}