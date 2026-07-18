import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { PortfolioUploadPanel } from "@/components/admin/PortfolioUploadPanel";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function PortfolioAdminPage() {
  await requireAdmin();
  return <main className="admin-shell"><AdminNav /><header className="admin-subhead"><div><p className="portal-kicker">Public website</p><h1>Photo Shoots</h1></div><p>Upload photographs directly to the public artistic gallery. <Link href="/photoshoots">View live gallery <ArrowUpRight size={14} /></Link></p></header><PortfolioUploadPanel /></main>;
}
