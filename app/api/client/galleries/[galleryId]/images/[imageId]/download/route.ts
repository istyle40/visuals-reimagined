import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canDownloadFinal, requireGalleryMember } from "@/lib/permissions/gallery";
import { uuidSchema } from "@/lib/validation/schemas";

export async function GET(_: Request, { params }: { params: Promise<{ galleryId: string; imageId: string }> }) {
  const raw = await params; const galleryId = uuidSchema.parse(raw.galleryId); const imageId = uuidSchema.parse(raw.imageId);
  const session = await requireGalleryMember(galleryId);
  if (!canDownloadFinal(session.gallery)) return NextResponse.json({ error: "Downloads are not available." }, { status: 403 });
  const { data: image } = await session.supabase.from("gallery_images").select("id,final_path,is_downloadable").eq("id", imageId).eq("gallery_id", galleryId).single();
  const { data: selection } = await session.supabase.from("image_selections").select("status").eq("image_id", imageId).eq("user_id", session.user.id).single();
  if (!image?.final_path || !image.is_downloadable || selection?.status !== "approved") return NextResponse.json({ error: "This final file is not available." }, { status: 403 });
  const admin = createAdminClient(); const { data, error } = await admin.storage.from("gallery-finals").createSignedUrl(image.final_path, 60, { download: true });
  if (error || !data) return NextResponse.json({ error: "The download could not be prepared." }, { status: 500 });
  await admin.from("gallery_activity").insert({ gallery_id: galleryId, image_id: imageId, user_id: session.user.id, event_type: "final_downloaded", metadata: { mode: "individual" } });
  return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
}
