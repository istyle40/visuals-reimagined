import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { signOut } from "@/app/actions/auth";

export function PrivateHeader({ back }: { back?: boolean }) {
  return (
    <header className="private-header">
      <Logo />
      <nav aria-label="Private gallery navigation">
        {back && <Link href="/client">← My Galleries</Link>}
        {!back && <span>My Galleries</span>}
        <form action={signOut}><button type="submit"><LogOut size={15} /> Sign Out</button></form>
      </nav>
    </header>
  );
}
