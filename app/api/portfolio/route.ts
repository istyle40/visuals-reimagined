import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("portfolio_images").select("id,title,alt_text,storage_path,width,height").eq("is_published", true).order("sort_order").order("created_at");
    if (error) throw error;
    const images = (data || []).map((image) => ({ id: image.id, title: image.title || "Untitled portrait", alt: image.alt_text || "Visuals Reimagined photo shoot", src: admin.storage.from("portfolio-public").getPublicUrl(image.storage_path).data.publicUrl, width: image.width, height: image.height }));
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
