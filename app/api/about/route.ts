import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("about").select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("about")
    .update(body)
    .eq("id", 1)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
