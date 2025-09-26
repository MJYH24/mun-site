"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "mun-auth",
    },
  }
);

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const btn =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-zinc-300 bg-white text-zinc-800 font-semibold transition-all duration-300 ease-out shadow-sm hover:shadow-lg hover:border-zinc-400 hover:bg-zinc-50 hover:-translate-y-[2px] active:translate-y-0";
  const input =
    "w-full px-3 py-2 rounded-md border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");

    if (!fullName.trim()) return setMsg("❌ Full name is required");
    if (!email.trim()) return setMsg("❌ Email is required");
    if (password.length < 6) return setMsg("❌ Password must be at least 6 characters");
    if (passcode !== process.env.NEXT_PUBLIC_CONF_PASSCODE)
      return setMsg("❌ Invalid conference passcode");

    setLoading(true);

    try {
      const { error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (signErr && !/already\s*registered/i.test(signErr.message)) {
        setMsg("❌ " + signErr.message);
        setLoading(false);
        return;
      }

      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
      if (loginErr && !/email not confirmed/i.test(loginErr.message)) {
        setMsg("❌ " + loginErr.message);
        setLoading(false);
        return;
      }

      const { error: upsertErr } = await supabase
        .from("users")
        .upsert(
          { email, full_name: fullName.trim(), role: "delegate" },
          { onConflict: "email" }
        );
      if (upsertErr) {
        setMsg("❌ " + upsertErr.message);
        setLoading(false);
        return;
      }

      const { data: sessData } = await supabase.auth.getSession();
      if (!sessData?.session) {
        setMsg("✅ Account created. Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      router.replace("/home");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Something went wrong";
      setMsg("❌ " + message);
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-16">
      <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 text-center">Create your account</h1>
        <p className="text-center text-zinc-600 mt-1">
          Join <span className="font-medium">MUN On The Rhine</span>
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-zinc-700 mb-1">Full name</label>
            <input
              className={input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Maxim Jiang"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className={input + " pr-10"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute inset-y-0 right-3 my-auto text-sm text-zinc-500 hover:text-zinc-700"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-700 mb-1">Conference passcode</label>
            <input
              type="password"
              className={input}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
              autoComplete="off"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button type="submit" disabled={loading} className={btn}>
              {loading ? "Creating…" : "Sign Up"}
            </button>
            <Link href="/login" className="text-sm text-blue-700 hover:underline">
              Already have an account? Log in
            </Link>
          </div>

          {msg && (
            <p className={`text-sm mt-2 ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}