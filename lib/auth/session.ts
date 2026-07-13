import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/client-login");
  const { data: profile } = await supabase.from("profiles").select("id,email,full_name,role,is_active").eq("id", user.id).single();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    redirect("/client-login?error=access");
  }
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "admin") redirect("/client?error=forbidden");
  return session;
}
