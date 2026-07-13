"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireGalleryMember } from "@/lib/permissions/gallery";
import { commentSchema, selectionSchema, uuidSchema } from "@/lib/validation/schemas";

async function writableGallery(galleryId: string, kind: "selection" | "comment") {
  const session = await requireGalleryMember(galleryId);
  const expired = session.gallery.expires_at && new Date(session.gallery.expires_at).getTime() <= Date.now();
  const allowed = kind === "selection"
    ? session.gallery.selections_enabled && !session.gallery.selections_locked
    : session.gallery.comments_enabled;
  if (expired || !allowed) throw new Error("This gallery is currently read-only.");
  return session;
}

async function ensureImage(supabase: Awaited<ReturnType<typeof requireGalleryMember>>["supabase"], galleryId: string, imageId: string) {
  const { data } = await supabase.from("gallery_images").select("id").eq("id", imageId).eq("gallery_id", galleryId).single();
  if (!data) throw new Error("Photograph not found.");
}

export async function updateSelection(input: { galleryId: string; imageId: string; status: string; favourite: boolean }) {
  const galleryId = uuidSchema.parse(input.galleryId); const imageId = uuidSchema.parse(input.imageId);
  const status = selectionSchema.parse(input.status);
  const session = await writableGallery(galleryId, "selection");
  await ensureImage(session.supabase, galleryId, imageId);
  const { error } = await session.supabase.from("image_selections").upsert({
    gallery_id: galleryId, image_id: imageId, user_id: session.user.id, status, is_favourite: Boolean(input.favourite)
  }, { onConflict: "image_id,user_id" });
  if (error) throw new Error("Your selection could not be saved.");
  revalidatePath(`/client/galleries/${galleryId}`);
  return { ok: true };
}

export async function createComment(input: { galleryId: string; imageId: string; comment: string }) {
  const galleryId = uuidSchema.parse(input.galleryId); const imageId = uuidSchema.parse(input.imageId);
  const comment = commentSchema.parse(input.comment);
  const session = await writableGallery(galleryId, "comment");
  await ensureImage(session.supabase, galleryId, imageId);
  const { data, error } = await session.supabase.from("image_comments").insert({ gallery_id: galleryId, image_id: imageId, user_id: session.user.id, comment }).select("id").single();
  if (error) throw new Error("Your comment could not be saved.");
  await createAdminClient().from("gallery_activity").insert({ gallery_id: galleryId, image_id: imageId, user_id: session.user.id, event_type: "comment_created", metadata: { comment_id: data.id } });
  revalidatePath(`/client/galleries/${galleryId}`);
  return { ok: true };
}

export async function editComment(input: { galleryId: string; commentId: string; comment: string }) {
  const galleryId = uuidSchema.parse(input.galleryId); const commentId = uuidSchema.parse(input.commentId);
  const comment = commentSchema.parse(input.comment);
  const session = await writableGallery(galleryId, "comment");
  const { error } = await session.supabase.from("image_comments").update({ comment }).eq("id", commentId).eq("gallery_id", galleryId).eq("user_id", session.user.id);
  if (error) throw new Error("Your comment could not be updated.");
  revalidatePath(`/client/galleries/${galleryId}`); return { ok: true };
}

export async function deleteComment(input: { galleryId: string; commentId: string }) {
  const galleryId = uuidSchema.parse(input.galleryId); const commentId = uuidSchema.parse(input.commentId);
  const session = await writableGallery(galleryId, "comment");
  const { error } = await session.supabase.from("image_comments").delete().eq("id", commentId).eq("gallery_id", galleryId).eq("user_id", session.user.id);
  if (error) throw new Error("Your comment could not be deleted.");
  revalidatePath(`/client/galleries/${galleryId}`); return { ok: true };
}
