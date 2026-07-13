export function galleryExpired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
}

export function canDownloadFinal(gallery: Record<string, unknown>) {
  return gallery.payment_status === "paid" && gallery.downloads_enabled === true && !galleryExpired(gallery.expires_at as string | null);
}
