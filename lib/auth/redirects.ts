const allowed = ["/client", "/client/galleries/"];

export function safeInternalRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/client";
  return allowed.some((prefix) => value === prefix || value.startsWith(prefix)) ? value : "/client";
}
