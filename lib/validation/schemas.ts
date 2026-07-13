import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254);
export const commentSchema = z.string().trim().min(1).max(1000);
export const uuidSchema = z.string().uuid();
export const selectionSchema = z.enum(["unreviewed", "approved", "rejected"]);
export const workflowSchema = z.enum(["preview_available", "awaiting_selection", "editing", "awaiting_payment", "ready", "archived"]);
export const paymentSchema = z.enum(["not_requested", "awaiting_payment", "paid", "refunded"]);

export function safeFileName(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (cleaned.replace(/^\.+/, "") || "image").slice(0, 120);
}
