import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { displayStatus } from "@/lib/gallery/status";
import { PrivateHeader } from "@/components/client/PrivateHeader";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const { supabase, profile, user } = await requireUser();
  const { data: galleries = [] } = await supabase.from("galleries").select("*,gallery_images(id,preview_path),image_selections(id,status,user_id)").order("created_at", { ascending: false });
  const cards = await Promise.all((galleries || []).map(async (gallery) => {
    const images = gallery.gallery_images || [];
    const coverPath = gallery.cover_image_path || images[0]?.preview_path;
    const signed = coverPath ? await supabase.storage.from("gallery-previews").createSignedUrl(coverPath, 300) : null;
    const reviewed = (gallery.image_selections || []).filter((item: { user_id: string; status: string }) => item.user_id === user.id && item.status !== "unreviewed").length;
    return { ...gallery, imageCount: images.length, reviewed, coverUrl: signed?.data?.signedUrl || null };
  }));
  return (
    <main className="portal-shell">
      <PrivateHeader />
      <section className="dashboard-head"><p className="portal-kicker">Private client collection</p><h1>Welcome back,<br /><em>{profile.full_name || "Client"}</em></h1><p>Your photographs, selections and completed downloads are kept together here.</p></section>
      {cards.length ? <section className="dashboard-grid" aria-label="Your galleries">
        {cards.map((gallery) => <article className="dashboard-card" key={gallery.id}>
          <div className="dashboard-cover">{gallery.coverUrl ? <Image src={gallery.coverUrl} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" /> : <Images aria-hidden="true" />}</div>
          <div className="dashboard-card-body"><div className="status-pill">{displayStatus(gallery.workflow_status, gallery.expires_at)}</div><h2>{gallery.title}</h2>
            <dl><div><dt>Photographs</dt><dd>{gallery.imageCount}</dd></div><div><dt>Review progress</dt><dd>{gallery.reviewed} of {gallery.imageCount}</dd></div><div><dt>Selection deadline</dt><dd>{gallery.selection_deadline ? new Date(gallery.selection_deadline).toLocaleDateString() : "Open"}</dd></div><div><dt>Gallery expires</dt><dd>{gallery.expires_at ? new Date(gallery.expires_at).toLocaleDateString() : "No expiry"}</dd></div></dl>
            <Link className="portal-primary" href={`/client/galleries/${gallery.id}`}>Open Gallery <ArrowRight size={16} /></Link>
          </div>
        </article>)}
      </section> : <section className="portal-empty"><Images /><h2>Your gallery is being prepared.</h2><p>There are no galleries assigned to this email yet. Contact the studio if you expected one to appear.</p><a href="mailto:hello@visualsreimagined.com">Contact the Studio</a></section>}
    </main>
  );
}
