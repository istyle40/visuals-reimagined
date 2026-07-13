import { AdminNav } from "@/components/admin/AdminNav";
import { GalleryCreateForm } from "@/components/admin/GalleryCreateForm";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export default async function NewGallery() { await requireAdmin(); const { data: clients = [] } = await createAdminClient().from("profiles").select("id,full_name,email").eq("role","client").eq("is_active",true).order("full_name"); return <main className="admin-shell"><AdminNav /><header className="admin-subhead"><div><p className="portal-kicker">New private collection</p><h1>Create Gallery</h1></div></header><GalleryCreateForm clients={clients || []} /></main>; }
