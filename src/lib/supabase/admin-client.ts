import "server-only";
import { createClient } from "@supabase/supabase-js";

function need(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export function createAdminClient() {
  const url = need("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRole = need("SUPABASE_SERVICE_ROLE");
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}