import Link from "next/link";
import { CreditCard, Download, LockKeyhole } from "lucide-react";
import { notFound } from "next/navigation";
import { PrivateHeader } from "@/components/client/PrivateHeader";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { canDownloadFinal, galleryExpired, requireGalleryMember } from "@/lib/permissions/gallery";
import { displayStatus } from "@/lib/gallery/status";

export const dynamic = "force-dynamic";

export default async function PrivateGallery({ params }: { params: Promise<{ galleryId: string }> }) {
  const { galleryId } = await params; const session = await requireGalleryMember(galleryId);
  const { data: images } = await session.supabase.from("gallery_images").select("*").eq("gallery_id", galleryId).order("sort_order");
  if (!images) notFound();
  const { data: selections = [] } = await session.supabase.from("image_selections").select("*").eq("gallery_id", galleryId).eq("user_id", session.user.id);
  const { data: comments = [] } = await session.supabase.from("image_comments").select("*").eq("gallery_id", galleryId).order("created_at");
  const selectionMap = new Map((selections || []).map((item) => [item.image_id, item]));
  const photos = await Promise.all(images.map(async (image) => {
    const { data } = await session.supabase.storage.from("gallery-previews").createSignedUrl(image.preview_path, 300);
    if (!data?.signedUrl) return null;
    const selected = selectionMap.get(image.id);
    return { ...image, url: data.signedUrl, selection: { status: selected?.status || "unreviewed", is_favourite: selected?.is_favourite || false }, comments: (comments || []).filter((c) => c.image_id === image.id), downloadable: Boolean(image.final_path && image.is_downloadable && (selected?.status === "approved")) };
  }));
  const expired = galleryExpired(session.gallery.expires_at); const downloads = canDownloadFinal(session.gallery);
  const readOnly = expired || session.gallery.selections_locked || !session.gallery.selections_enabled || session.gallery.workflow_status === "archived";
  return <main className="portal-shell gallery-shell"><PrivateHeader back />
    <header className="gallery-head"><div><p className="portal-kicker">{displayStatus(session.gallery.workflow_status, session.gallery.expires_at)}</p><h1>{session.gallery.title}</h1><p>{session.gallery.description}</p></div><dl><div><dt>Session</dt><dd>{session.gallery.session_info || "Private photography session"}</dd></div><div><dt>Selection deadline</dt><dd>{session.gallery.selection_deadline ? new Date(session.gallery.selection_deadline).toLocaleDateString() : "Open"}</dd></div><div><dt>Gallery expires</dt><dd>{session.gallery.expires_at ? new Date(session.gallery.expires_at).toLocaleDateString() : "No expiry"}</dd></div></dl></header>
    {expired && <div className="workflow-banner danger"><LockKeyhole /><div><strong>This private gallery has expired.</strong><p>Contact the studio if you need access restored.</p></div><a href="mailto:hello@visualsreimagined.com">Contact the Studio</a></div>}
    {session.gallery.workflow_status === "editing" && <div className="workflow-banner"><div><strong>Your selected photographs are being refined.</strong><p>Previews, selections and comments remain available while final editing is completed.</p></div></div>}
    {session.gallery.payment_status === "awaiting_payment" && <div className="workflow-banner payment"><CreditCard /><div><strong>Your selected images are ready.</strong><p>Final high-resolution downloads will become available after payment has been confirmed.</p></div>{session.gallery.payment_url ? <a href={session.gallery.payment_url} rel="noopener noreferrer">Complete Payment</a> : <a href="mailto:hello@visualsreimagined.com">Contact the Studio</a>}</div>}
    {downloads && <div className="workflow-banner ready"><Download /><div><strong>Your high-resolution photographs are ready.</strong><p>Download approved images individually or prepare the complete gallery.</p></div><Link href={`/api/client/galleries/${galleryId}/download`}>Download Complete Gallery</Link></div>}
    <GalleryExperience galleryId={galleryId} photos={photos.filter(Boolean) as never[]} userId={session.user.id} readOnly={readOnly} commentsEnabled={session.gallery.comments_enabled} canDownload={downloads} />
  </main>;
}
