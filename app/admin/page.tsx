import Link from "next/link";
import { Images, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export default async function AdminDashboard() { await requireAdmin(); const admin = createAdminClient(); const [{ count: clients }, { count: galleries }, { count: payments }] = await Promise.all([admin.from("profiles").select("id", { count: "exact", head: true }).eq("role","client"), admin.from("galleries").select("id", { count: "exact", head: true }), admin.from("galleries").select("id", { count: "exact", head: true }).eq("payment_status","awaiting_payment")]); return <main className="admin-shell"><AdminNav /><header className="admin-head"><p className="portal-kicker">Studio operations</p><h1>Private Gallery<br /><em>Administration</em></h1></header><section className="admin-metrics"><article><Users /><span>{clients || 0}</span><p>Clients</p><Link href="/admin/clients">Manage clients <ArrowRight /></Link></article><article><Images /><span>{galleries || 0}</span><p>Private galleries</p><Link href="/admin/galleries">Manage galleries <ArrowRight /></Link></article><article><ShieldCheck /><span>{payments || 0}</span><p>Awaiting payment</p><Link href="/admin/galleries">Review payment status <ArrowRight /></Link></article></section></main>; }
