import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("activities").select("*").order("order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const supabase = createServerClient();
  const { data, error } = await supabase.from("activities").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
