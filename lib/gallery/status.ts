export const statusLabels: Record<string, string> = {
  preview_available: "Preview Available",
  awaiting_selection: "Awaiting Selection",
  editing: "Editing in Progress",
  awaiting_payment: "Awaiting Payment",
  ready: "Ready to Download",
  archived: "Archived",
  expired: "Expired"
};

export function displayStatus(status: string, expiresAt?: string | null) {
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) return "Expired";
  return statusLabels[status] || "Preview Available";
}
