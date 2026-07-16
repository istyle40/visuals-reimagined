import { Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { AiImageCreator } from "@/components/admin/AiImageCreator";
export const dynamic="force-dynamic";
export default async function Page(){await requireAdmin();return <main className="admin-shell"><AdminNav/><header className="admin-subhead creator-head"><div><p className="portal-kicker">Private studio tool</p><h1>AI Image <em>Creator</em></h1></div><p><Sparkles/> Upload a reference, direct the photoshoot with simple controls, then create it privately with Grok Imagine.</p></header><AiImageCreator/></main>}
