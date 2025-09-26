"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMsg("❌ " + error.message);
      return;
    }

    // session is now set (persisted). Go to dashboard.
    router.replace("/home");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="w-full max-w-md container-card">
        <h1 className="mb-2">Log in</h1>
        <p className="text-muted mb-6">Use your conference account.</p>

        <div className="space-y-4">
          <input
            className="input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} className="button-primary w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
          {msg && <p className={`text-sm ${msg.startsWith("❌") ? "text-red-600" : "text-green-600"}`}>{msg}</p>}
        </div>
      </form>
    </main>
  );
}