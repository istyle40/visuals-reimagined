"use client";
import { useActionState } from "react";
import { createClient, type AdminState } from "@/app/actions/admin";
const initial: AdminState = { ok: false, message: "" };
export function ClientCreateForm() { const [state, action, pending] = useActionState(createClient, initial); return <form action={action} className="admin-form"><h2>Create and invite client</h2><label>Full name<input name="full_name" required maxLength={120} /></label><label>Email address<input name="email" type="email" required /></label><button className="portal-primary" disabled={pending}>{pending ? "Creating…" : "Create client and send invite"}</button><p className={state.ok ? "success" : "error"} role="status">{state.message}</p></form>; }
