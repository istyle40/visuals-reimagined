import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serviceRoleKey } from "@/lib/env";

export function createAdminClient() {
  const env = publicEnv();
  return createClient(env.supabaseUrl, serviceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } });
}
