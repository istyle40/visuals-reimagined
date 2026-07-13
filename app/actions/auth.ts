"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailSchema } from "@/lib/validation/schemas";
import { publicEnv } from "@/lib/env";

export type LoginState = { status: "idle" | "success" | "error"; message: string };

export async function requestMagicLink(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  const generic = "If your email is assigned to a gallery, a secure access link is on its way.";
  if (!parsed.success) return { status: "success", message: generic };
  try {
    const supabase = await createClient();
    const { siteUrl } = publicEnv();
    await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl}/auth/callback?next=/client` }
    });
    return { status: "success", message: generic };
  } catch {
    return { status: "error", message: "We could not send an access link just now. Please try again shortly." };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/client-login");
}
