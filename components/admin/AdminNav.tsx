import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";

export function AdminNav() {
  return <header className="admin-nav"><Logo /><nav aria-label="Administration"><Link href="/admin">Overview</Link><Link href="/admin/create">AI Creator</Link><Link href="/admin/portfolio">Public Photoshoots</Link><Link href="/admin/clients">Clients</Link><Link href="/admin/galleries">Galleries</Link><form action={signOut}><button>Sign out</button></form></nav></header>;
}
