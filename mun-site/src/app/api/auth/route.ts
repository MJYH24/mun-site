import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

export async function POST(request: Request) {
  const { email, full_name } = await request.json();

  // Check if user exists
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!existing) {
    await supabase.from("users").insert([
      {
        email,
        full_name,
        role: "delegate", // default role
      },
    ]);
  }

  return NextResponse.json({ ok: true });
}