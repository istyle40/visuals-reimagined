const requiredPublic = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SITE_URL"] as const;

export function publicEnv() {
  const missing = requiredPublic.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!.replace(/\/$/, "")
  };
}

export function serviceRoleKey() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing required server variable: SUPABASE_SERVICE_ROLE_KEY");
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}
