"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const email = data?.session?.user?.email || null;
      setIsLoggedIn(!!email);

      if (email) {
        const { data: row } = await supabase
          .from("users")
          .select("full_name, role")
          .eq("email", email)
          .single();

        const first = ((row?.full_name ?? "").trim().split(" ")[0]) || "";
        const role = row?.role
          ? row.role.charAt(0).toUpperCase() + row.role.slice(1)
          : "Delegate";
        setDisplayName(first ? `${role} ${first}` : role);
      } else {
        setDisplayName("");
      }

      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setIsLoggedIn(!!session);
      });
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem("mun-auth");
    } catch {}
    window.location.assign("/login");
  }

  const btn =
    "inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-300 " +
    "bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out " +
    "shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px] active:translate-y-0";

  const navLink =
    "relative text-gray-700 transition-all duration-300 hover:text-blue-600 " +
    "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-blue-600 " +
    "after:w-0 hover:after:w-full after:transition-all after:duration-300";

  return (
    <div className="w-full bg-[#f8fafc] border-b border-[#dbe2ea]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.jpg"
            alt="MUN On The Rhine Logo"
            width={48}
            height={48}
            className="rounded-md object-contain"
            priority
          />
          <span className="text-xl font-bold text-[#0f172a]">MUN On The Rhine</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-gray-700">
          <Link href="/home" className={navLink}>Home</Link>
          <Link href="/committees" className={navLink}>Committees</Link>
          <Link href="/admin" className={navLink}>Admin</Link>
          <Link href="/me" className={navLink}>Profile</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {displayName}
            </span>
          )}

          {!isLoggedIn ? (
            <Link href="/login" className={btn}>Login</Link>
          ) : (
            <button type="button" onClick={handleLogout} className={btn}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}