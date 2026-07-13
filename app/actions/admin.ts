"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailSchema, paymentSchema, uuidSchema, workflowSchema } from "@/lib/validation/schemas";
import { publicEnv } from "@/lib/env";

export type AdminState = { ok: boolean; message: string };
const idle: AdminState = { ok: false, message: "" };

export async function createClient(_: AdminState = idle, formData: FormData): Promise<AdminState> {
  await requireAdmin(); const email = emailSchema.safeParse(formData.get("email")); const name = String(formData.get("full_name") || "").trim().slice(0, 120);
  if (!email.success || !name) return { ok: false, message: "Enter a valid name and email." };
  const admin = createAdminClient(); const { siteUrl } = publicEnv();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email.data, { redirectTo: `${siteUrl}/auth/callback?next=/client`, data: { full_name: name } });
  if (error || !data.user) return { ok: false, message: error?.message || "Client invite could not be created." };
  const profile = await admin.from("profiles").upsert({ id: data.user.id, email: email.data, full_name: name, role: "client", is_active: true });
  if (profile.error) return { ok: false, message: "The invitation was sent, but the client profile could not be saved." };
  revalidatePath("/admin/clients"); return { ok: true, message: "Client created and private invitation sent." };
}

export async function resendClientInvite(formData: FormData) {
  await requireAdmin(); const email = emailSchema.parse(formData.get("email")); const admin = createAdminClient(); const { siteUrl } = publicEnv();
  await admin.auth.admin.inviteUserByEmail(email, { redirectTo: `${siteUrl}/auth/callback?next=/client` }); revalidatePath("/admin/clients");
}

export async function updateClient(formData: FormData) {
  await requireAdmin(); const id = uuidSchema.parse(formData.get("id")); const fullName = String(formData.get("full_name") || "").trim().slice(0,120); const active = formData.get("is_active") === "true";
  if (!fullName) throw new Error("Client name is required."); await createAdminClient().from("profiles").update({ full_name: fullName, is_active: active }).eq("id", id).eq("role", "client"); revalidatePath("/admin/clients");
}

export async function createGallery(_: AdminState, formData: FormData): Promise<AdminState> {
  const session = await requireAdmin(); const title = String(formData.get("title") || "").trim().slice(0,160); if (!title) return { ok: false, message: "Gallery title is required." };
  const memberIds = formData.getAll("members").map(String).filter((id) => uuidSchema.safeParse(id).success); if (!memberIds.length) return { ok: false, message: "Assign at least one client." };
  const admin = createAdminClient(); const { data: gallery, error } = await admin.from("galleries").insert({
    title, description: String(formData.get("description") || "").trim() || null, session_info: String(formData.get("session_info") || "").trim() || null,
    selection_deadline: String(formData.get("selection_deadline") || "") || null, expires_at: String(formData.get("expires_at") || "") || null, created_by: session.user.id
  }).select("id").single();
  if (error || !gallery) return { ok: false, message: error?.message || "Gallery could not be created." };
  const assigned = await admin.from("gallery_members").insert(memberIds.map((user_id) => ({ gallery_id: gallery.id, user_id }))); if (assigned.error) { await admin.from("galleries").delete().eq("id", gallery.id); return { ok: false, message: "Gallery assignment could not be saved." }; }
  redirect(`/admin/galleries/${gallery.id}`);
}

export async function updateGallery(formData: FormData) {
  await requireAdmin(); const id = uuidSchema.parse(formData.get("id")); const workflow = workflowSchema.parse(formData.get("workflow_status")); const payment = paymentSchema.parse(formData.get("payment_status"));
  const admin = createAdminClient(); const { data: existing } = await admin.from("galleries").select("expires_at").eq("id", id).single();
  const { count: finals } = await admin.from("gallery_images").select("id", { count: "exact", head: true }).eq("gallery_id", id).not("final_path", "is", null);
  if (payment === "paid" && !finals) throw new Error("Payment cannot unlock downloads until at least one final file exists.");
  const downloadsEnabled = formData.get("downloads_enabled") === "on";
  const expired = existing?.expires_at && new Date(existing.expires_at).getTime() <= Date.now();
  const ready = payment === "paid" && downloadsEnabled && !expired && Boolean(finals);
  const update = {
    workflow_status: ready ? "ready" : workflow, payment_status: payment, payment_confirmed_at: payment === "paid" ? new Date().toISOString() : null,
    amount_due: Number(formData.get("amount_due") || 0) || null, amount_paid: Number(formData.get("amount_paid") || 0) || null, currency: String(formData.get("currency") || "EUR").toUpperCase().slice(0,3),
    payment_reference: String(formData.get("payment_reference") || "").trim() || null, payment_url: String(formData.get("payment_url") || "").trim() || null, payment_notes: String(formData.get("payment_notes") || "").trim() || null,
    downloads_enabled: downloadsEnabled, comments_enabled: formData.get("comments_enabled") === "on", selections_enabled: formData.get("selections_enabled") === "on", selections_locked: formData.get("selections_locked") === "on",
    selection_deadline: String(formData.get("selection_deadline") || "") || null, expires_at: String(formData.get("expires_at") || "") || null
  };
  const { error } = await admin.from("galleries").update(update).eq("id", id); if (error) throw new Error(error.message);
  await admin.from("gallery_activity").insert({ gallery_id: id, user_id: (await requireAdmin()).user.id, event_type: payment === "paid" ? "payment_confirmed" : "gallery_updated", metadata: { workflow_status: update.workflow_status, payment_status: payment, downloads_enabled: downloadsEnabled } });
  revalidatePath(`/admin/galleries/${id}`); revalidatePath(`/client/galleries/${id}`);
}

export async function archiveGallery(formData: FormData) {
  await requireAdmin(); const id = uuidSchema.parse(formData.get("id")); const reactivate = formData.get("reactivate") === "true";
  await createAdminClient().from("galleries").update({ workflow_status: reactivate ? "preview_available" : "archived" }).eq("id", id); revalidatePath(`/admin/galleries/${id}`);
}

export async function updateGalleryImage(formData: FormData) {
  await requireAdmin(); const galleryId = uuidSchema.parse(formData.get("gallery_id")); const imageId = uuidSchema.parse(formData.get("image_id"));
  const admin = createAdminClient(); const { error } = await admin.from("gallery_images").update({ title: String(formData.get("title") || "").trim() || null, alt_text: String(formData.get("alt_text") || "").trim().slice(0,300) || "Private gallery photograph", sort_order: Number(formData.get("sort_order") || 0), is_downloadable: formData.get("is_downloadable") === "on" }).eq("id", imageId).eq("gallery_id", galleryId);
  if (error) throw new Error(error.message); if (formData.get("set_cover") === "on") { const { data } = await admin.from("gallery_images").select("preview_path").eq("id", imageId).single(); if (data) await admin.from("galleries").update({ cover_image_path: data.preview_path }).eq("id", galleryId); }
  revalidatePath(`/admin/galleries/${galleryId}`);
}

export async function assignGalleryMember(formData: FormData) {
  await requireAdmin(); const galleryId = uuidSchema.parse(formData.get("gallery_id")); const userId = uuidSchema.parse(formData.get("user_id"));
  const { error } = await createAdminClient().from("gallery_members").upsert({ gallery_id: galleryId, user_id: userId }, { onConflict: "gallery_id,user_id" }); if (error) throw new Error(error.message); revalidatePath(`/admin/galleries/${galleryId}`);
}

export async function removeGalleryMember(formData: FormData) {
  await requireAdmin(); const galleryId = uuidSchema.parse(formData.get("gallery_id")); const userId = uuidSchema.parse(formData.get("user_id"));
  await createAdminClient().from("gallery_members").delete().eq("gallery_id", galleryId).eq("user_id", userId); revalidatePath(`/admin/galleries/${galleryId}`);
}
