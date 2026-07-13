import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { LoginForm } from "@/components/client/LoginForm";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Private Gallery | Visuals Reimagined", robots: { index: false, follow: false } };

export default async function ClientLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="portal-login">
      <div className="portal-prism portal-prism-a" aria-hidden="true" /><div className="portal-prism portal-prism-b" aria-hidden="true" />
      <header className="portal-login-header"><Logo /><Link href="/">Return to studio</Link></header>
      <section className="portal-login-card">
        <div className="portal-eyebrow"><LockKeyhole size={14} /> Private client access</div>
        <h1>Your Private<br /><em>Gallery</em></h1>
        <p>Enter the email address used for your photography session. We’ll send you a secure one-time access link.</p>
        {error && <p className="portal-alert" role="alert">That access link is no longer valid. Request a new secure link below.</p>}
        <LoginForm />
        <small>For your privacy, access links expire automatically and may only be used by the intended recipient.</small>
      </section>
    </main>
  );
}
