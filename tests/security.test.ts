import { describe, expect, it } from "vitest";
import { safeInternalRedirect } from "../lib/auth/redirects";
import { canDownloadFinal, galleryExpired } from "../lib/permissions/rules";
import { commentSchema, safeFileName } from "../lib/validation/schemas";

describe("authentication redirect safety", () => {
  it("accepts only approved internal client destinations", () => {
    expect(safeInternalRedirect("/client")).toBe("/client");
    expect(safeInternalRedirect("/client/galleries/123")).toBe("/client/galleries/123");
    expect(safeInternalRedirect("https://evil.example")).toBe("/client");
    expect(safeInternalRedirect("//evil.example")).toBe("/client");
    expect(safeInternalRedirect("/admin")).toBe("/client");
    expect(safeInternalRedirect("/client\\evil")).toBe("/client");
  });
});

describe("payment-gated downloads", () => {
  it("requires paid status, enabled downloads and a live gallery", () => {
    const live = { payment_status: "paid", downloads_enabled: true, expires_at: new Date(Date.now() + 60_000).toISOString() };
    expect(canDownloadFinal(live)).toBe(true);
    expect(canDownloadFinal({ ...live, payment_status: "awaiting_payment" })).toBe(false);
    expect(canDownloadFinal({ ...live, downloads_enabled: false })).toBe(false);
    expect(canDownloadFinal({ ...live, expires_at: new Date(Date.now() - 60_000).toISOString() })).toBe(false);
    expect(galleryExpired(new Date(Date.now() - 1).toISOString())).toBe(true);
  });
});

describe("untrusted client input", () => {
  it("limits comments and makes archive filenames safe", () => {
    expect(commentSchema.safeParse("A thoughtful adjustment request").success).toBe(true);
    expect(commentSchema.safeParse("x".repeat(1001)).success).toBe(false);
    expect(safeFileName("../../client portrait?.jpg")).toBe("-..-client-portrait-.jpg");
  });
});
