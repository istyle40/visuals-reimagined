import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayStatus } from "@/lib/gallery/status";

export const dynamic = "force-dynamic";
export default async function GalleriesAdmin() { await requireAdmin(); const { data: galleries = [] } = await createAdminClient().from("galleries").select("*,gallery_images(id,final_path),gallery_members(id)").order("created_at", { ascending: false }); return <main className="admin-shell"><AdminNav /><header className="admin-subhead"><div><p className="portal-kicker">Proofing workflow</p><h1>Private Galleries</h1></div><Link className="portal-primary" href="/admin/galleries/new"><Plus /> New gallery</Link></header><section className="admin-gallery-list">{(galleries || []).map((gallery) => <article key={gallery.id}><div className="status-pill">{displayStatus(gallery.workflow_status, gallery.expires_at)}</div><h2>{gallery.title}</h2><dl><div><dt>Clients</dt><dd>{gallery.gallery_members?.length || 0}</dd></div><div><dt>Previews</dt><dd>{gallery.gallery_images?.length || 0}</dd></div><div><dt>Finals</dt><dd>{gallery.gallery_images?.filter((i: { final_path: string | null }) => i.final_path).length || 0}</dd></div><div><dt>Payment</dt><dd>{gallery.payment_status.replaceAll("_", " ")}</dd></div></dl><Link href={`/admin/galleries/${gallery.id}`}>Manage gallery <ArrowRight /></Link></article>)}{!galleries?.length && <div className="portal-empty compact"><h2>No galleries yet.</h2><Link href="/admin/galleries/new">Create the first gallery</Link></div>}</section></main>; }
