"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type U = {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  grade: string | null;
};

export default function ParticipantsPage() {
  const [users, setUsers] = useState<U[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, grade")
        .order("full_name", { ascending: true });
      if (!error) setUsers(data || []);
    })();
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow space-y-6">
      <h1 className="text-3xl font-bold">All Participants</h1>

      <ul className="divide-y divide-zinc-200">
        {users.map((u) => (
          <li key={u.id} className="py-3">
            <Link href={`/profile/${u.id}`} className="text-blue-600 hover:underline">
              {u.full_name || u.email}
            </Link>
            <span className="text-zinc-600"> — {u.role || "delegate"}{u.grade ? ` • Grade ${u.grade}` : ""}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}