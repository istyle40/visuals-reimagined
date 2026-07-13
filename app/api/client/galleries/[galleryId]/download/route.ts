import JSZip from "jszip";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canDownloadFinal, requireGalleryMember } from "@/lib/permissions/gallery";
import { safeFileName, uuidSchema } from "@/lib/validation/schemas";

export const maxDuration = 60;

export async function GET(_: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  const galleryId = uuidSchema.parse((await params).galleryId); const session = await requireGalleryMember(galleryId);
  if (!canDownloadFinal(session.gallery)) return NextResponse.json({ error: "Downloads are not available." }, { status: 403 });
  const { data: selections } = await session.supabase.from("image_selections").select("image_id").eq("gallery_id", galleryId).eq("user_id", session.user.id).eq("status", "approved");
  const ids = (selections || []).map((item) => item.image_id); if (!ids.length) return NextResponse.json({ error: "No approved final photographs are available." }, { status: 404 });
  const { data: images } = await session.supabase.from("gallery_images").select("id,final_path,original_filename,is_downloadable").eq("gallery_id", galleryId).in("id", ids).eq("is_downloadable", true);
  const eligible = (images || []).filter((image) => image.final_path); if (!eligible.length) return NextResponse.json({ error: "No final photographs are available." }, { status: 404 });
  const admin = createAdminClient(); const zip = new JSZip();
  for (const image of eligible) {
    const { data, error } = await admin.storage.from("gallery-finals").download(image.final_path!);
    if (!error && data) zip.file(safeFileName(image.original_filename), await data.arrayBuffer());
  }
  const archive = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE", compressionOptions: { level: 6 } });
  await admin.from("gallery_activity").insert({ gallery_id: galleryId, user_id: session.user.id, event_type: "final_downloaded", metadata: { mode: "complete_gallery", image_count: eligible.length } });
  return new NextResponse(Buffer.from(archive), { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="${safeFileName(session.gallery.title)}-finals.zip"`, "Cache-Control": "private, no-store, max-age=0" } });
}
