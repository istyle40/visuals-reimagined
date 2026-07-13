import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
export { canDownloadFinal, galleryExpired } from "@/lib/permissions/rules";

export async function requireGalleryMember(galleryId: string) {
  const session = await requireUser();
  const { data: gallery } = await session.supabase
    .from("galleries")
    .select("*")
    .eq("id", galleryId)
    .single();
  if (!gallery) notFound();
  return { ...session, gallery };
}
