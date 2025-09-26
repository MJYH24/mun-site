"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string | null;
  committee: string | null;
  country: string | null; // delegation
};

const ADMIN_ROLES = ["executive", "developer", "admin"];

export default function ParticipantsPage() {
  const router = useRouter();

  const [meRole, setMeRole] = useState<string>("delegate");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      // require login
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      const email = sess?.session?.user?.email;
      if (!uid || !email) {
        router.replace("/login");
        return;
      }

      // fetch my role (prefer user_id, fallback to email)
      const meByUid = await supabase
        .from("users")
        .select("role")
        .eq("user_id", uid)
        .single();

      let role = (meByUid.data?.role || "").toLowerCase();
      if (!role) {
        const meByEmail = await supabase
          .from("users")
          .select("role")
          .eq("email", email)
          .single();
        role = (meByEmail.data?.role || "delegate").toLowerCase();
      }
      if (mounted) setMeRole(role);

      // fetch participants sorted by committee, then delegation, then name
      // (nullsLast by doing two-pass sort in JS after fetching)
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, committee, country");

      if (error) {
        setMsg("❌ " + error.message);
        setLoading(false);
        return;
      }

      const list = (data || []) as UserRow[];

      // Sort: committee (A→Z, nulls last), then country (A→Z, nulls last), then name
      const sortKey = (v: string | null) =>
        (v ?? "\uffff").toLocaleLowerCase(); // nulls last trick

      list.sort((a, b) => {
        const c = sortKey(a.committee).localeCompare(sortKey(b.committee));
        if (c !== 0) return c;
        const d = sortKey(a.country).localeCompare(sortKey(b.country));
        if (d !== 0) return d;
        const an = (a.full_name || a.email || "").toLocaleLowerCase();
        const bn = (b.full_name || b.email || "").toLocaleLowerCase();
        return an.localeCompare(bn);
      });

      if (mounted) {
        setRows(list);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleDelete(id: string, label: string) {
    if (!ADMIN_ROLES.includes(meRole)) return;
    const ok = window.confirm(
      `Delete ${label}? This cannot be undone.\n\nAre you sure?`
    );
    if (!ok) return;

    setMsg("");
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      setMsg("❌ " + error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setMsg("✅ User deleted");
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-zinc-200 bg-white p-8">Loading participants…</div>
      </main>
    );
  }

  const card = "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm";
  const btn =
    "inline-flex items-center justify-center px-3 py-1.5 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 text-sm font-semibold transition-all duration-200 " +
    "shadow-sm hover:shadow-md hover:border-zinc-400 hover:bg-zinc-50";

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Participants</h1>
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

      <section className={`${card} overflow-x-auto`}>
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold text-zinc-900">Name</th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-zinc-900">Committee</th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-zinc-900">Delegation</th>
              <th className="px-3 py-2 text-left text-sm font-semibold text-zinc-900">Role</th>
              {ADMIN_ROLES.includes(meRole) && (
                <th className="px-3 py-2 text-right text-sm font-semibold text-zinc-900">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {rows.map((u) => {
              const name = u.full_name || u.email;
              const role = (u.role || "delegate").toLowerCase();
              const committee = u.committee || "—";
              const country = u.country || "—";
              return (
                <tr key={u.id} className="hover:bg-zinc-50">
                  <td className="px-3 py-2 text-sm">
                    <Link
                      href={`/profile/${u.id}`}
                      className="text-blue-700 hover:underline"
                    >
                      {name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm">{committee}</td>
                  <td className="px-3 py-2 text-sm">{country}</td>
                  <td className="px-3 py-2 text-sm capitalize">{role}</td>
                  {ADMIN_ROLES.includes(meRole) && (
                    <td className="px-3 py-2 text-sm text-right">
                      <button
                        className={btn}
                        onClick={() => handleDelete(u.id, name)}
                        title="Delete user"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {rows.length === 0 && (
          <p className="text-sm text-zinc-600 mt-4">No participants yet.</p>
        )}
      </section>
    </main>
  );
}