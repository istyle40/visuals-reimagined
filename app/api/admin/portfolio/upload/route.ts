import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxSize = 15 * 1024 * 1024;

export async function POST(request: Request) {
  await requireAdmin();
  const form = await request.formData();
  const files = form.getAll("files").filter((item): item is File => item instanceof File);
  const title = String(form.get("title") || "").trim().slice(0, 120);
  const alt = String(form.get("alt") || "").trim().slice(0, 240);
  if (!files.length) return NextResponse.json({ error: "Choose at least one photograph." }, { status: 400 });
  const admin = createAdminClient();
  let uploaded = 0;
  for (const [index, file] of files.entries()) {
    if (!allowed.has(file.type) || file.size <= 0 || file.size > maxSize) return NextResponse.json({ error: `${file.name} is not a supported image or is larger than 15 MB.` }, { status: 400 });
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height) return NextResponse.json({ error: `${file.name} is not a valid photograph.` }, { status: 400 });
    const output = await sharp(input).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
    const path = `${new Date().getUTCFullYear()}/${randomUUID()}.webp`;
    const storage = await admin.storage.from("portfolio-public").upload(path, output, { contentType: "image/webp", upsert: false });
    if (storage.error) return NextResponse.json({ error: storage.error.message }, { status: 500 });
    const insert = await admin.from("portfolio_images").insert({ storage_path: path, title: title || file.name.replace(/\.[^.]+$/, ""), alt_text: alt || `Visuals Reimagined photo shoot: ${file.name.replace(/\.[^.]+$/, "")}`, width: metadata.width, height: metadata.height, sort_order: Date.now() + index, is_published: true });
    if (insert.error) { await admin.storage.from("portfolio-public").remove([path]); return NextResponse.json({ error: insert.error.message }, { status: 500 }); }
    uploaded += 1;
  }
  return NextResponse.json({ uploaded });
}
