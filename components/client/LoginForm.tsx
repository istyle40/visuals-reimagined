"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { requestMagicLink, type LoginState } from "@/app/actions/auth";

const initial: LoginState = { status: "idle", message: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);
  return (
    <form action={action} className="portal-form">
      <label htmlFor="client-email">Email address</label>
      <div className="portal-input-wrap"><Mail aria-hidden="true" size={18} /><input id="client-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></div>
      <button className="portal-primary" disabled={pending} type="submit">
        {pending ? <LoaderCircle className="spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
        {pending ? "Sending secure link" : "Send private access link"}
      </button>
      <div className={`portal-message ${state.status}`} role="status" aria-live="polite">{state.message}</div>
    </form>
  );
}
