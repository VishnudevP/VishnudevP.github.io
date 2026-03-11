import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(url, key);
}

// Browser/client-side client (uses anon key) — lazy singleton
let _client: SupabaseClient | null = null;
export function getClient(): SupabaseClient {
  if (!_client) _client = getSupabaseClient();
  return _client;
}

// Server-side client with service role (for admin mutations)
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    // Return a stub client during build — all queries will return empty data
    return {
      from: () => ({
        select: () => ({ data: null, error: { message: "No Supabase URL" } }),
        single: () => ({ data: null, error: { message: "No Supabase URL" } }),
      }),
    } as unknown as SupabaseClient;
  }

  const key = serviceRoleKey ?? anonKey;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
