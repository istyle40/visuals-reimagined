import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeFileName, uuidSchema } from "@/lib/validation/schemas";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]); const MAX = 50 * 1024 * 1024;
const watermark = Buffer.from(`<svg width="1200" height="180"><style>.w{fill:white;font:500 34px Arial;letter-spacing:8px;opacity:.55}</style><text x="600" y="105" text-anchor="middle" class="w">VISUALS REIMAGINED — CLIENT PROOF</text></svg>`);

export async function POST(request: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  await requireAdmin(); const galleryId = uuidSchema.parse((await params).galleryId); const form = await request.formData();
  const mode = form.get("mode") === "final" ? "final" : "preview"; const files = form.getAll("files").filter((item): item is File => item instanceof File); const imageIdRaw = form.get("imageId");
  if (!files.length) return NextResponse.json({ error: "Choose at least one image." }, { status: 400 });
  if (mode === "final" && (files.length !== 1 || typeof imageIdRaw !== "string")) return NextResponse.json({ error: "Final uploads must be paired to one preview." }, { status: 400 });
  const admin = createAdminClient(); const results: Array<{ name: string; ok: boolean; error?: string }> = [];
  for (const file of files) {
    try {
      if (!allowed.has(file.type) || file.size > MAX || file.size === 0) throw new Error("Unsupported image type or file size.");
      const input = Buffer.from(await file.arrayBuffer()); const meta = await sharp(input).metadata(); if (!meta.width || !meta.height) throw new Error("Invalid image file.");
      const unique = `${galleryId}/${randomUUID()}`; const original = safeFileName(file.name);
      if (mode === "preview") {
        const output = await sharp(input).rotate().resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true }).composite([{ input: watermark, gravity: "south" }]).webp({ quality: 82 }).toBuffer();
        const path = `${unique}.webp`; const uploaded = await admin.storage.from("gallery-previews").upload(path, output, { contentType: "image/webp", upsert: false }); if (uploaded.error) throw uploaded.error;
        const inserted = await admin.from("gallery_images").insert({ gallery_id: galleryId, preview_path: path, filename: safeFileName(`${file.name.replace(/\.[^.]+$/, "")}.webp`), original_filename: original, width: meta.width, height: meta.height, alt_text: "Private gallery photograph" }); if (inserted.error) { await admin.storage.from("gallery-previews").remove([path]); throw inserted.error; }
      } else {
        const imageId = uuidSchema.parse(imageIdRaw); const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"; const path = `${unique}.${extension}`;
        const uploaded = await admin.storage.from("gallery-finals").upload(path, input, { contentType: file.type, upsert: false }); if (uploaded.error) throw uploaded.error;
        const updated = await admin.from("gallery_images").update({ final_path: path, is_downloadable: true, original_filename: original }).eq("id", imageId).eq("gallery_id", galleryId); if (updated.error) { await admin.storage.from("gallery-finals").remove([path]); throw updated.error; }
      }
      results.push({ name: file.name, ok: true });
    } catch (error) { results.push({ name: file.name, ok: false, error: error instanceof Error ? error.message : "Upload failed" }); }
  }
  await admin.from("gallery_activity").insert({ gallery_id: galleryId, event_type: mode === "preview" ? "previews_uploaded" : "final_uploaded", metadata: { results: results.map(({ name, ok }) => ({ name, ok })) } });
  return NextResponse.json({ results }, { status: results.some((item) => item.ok) ? 200 : 400 });
}
