"use client";

import { ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function PortfolioUploadPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const response = await fetch("/api/admin/portfolio/upload", { method: "POST", body: new FormData(event.currentTarget) });
    const body = await response.json().catch(() => ({}));
    setMessage(response.ok ? `${body.uploaded} photo${body.uploaded === 1 ? "" : "s"} published.` : body.error || "Upload failed.");
    if (response.ok) formRef.current?.reset();
    setLoading(false);
  }

  return <form ref={formRef} onSubmit={submit} className="admin-form wide portfolio-upload-form">
    <div className="portfolio-upload-heading"><ImagePlus /><div><h2>Add to the public gallery</h2><p>Uploaded images appear on the Photo Shoots page after publishing.</p></div></div>
    <label className="drop-field"><Upload /><span>Choose JPEG, PNG or WebP photographs · up to 15 MB each</span><input name="files" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label>
    <label>Collection title<input name="title" placeholder="New editorial series" maxLength={120} /></label>
    <label>Accessible description<input name="alt" placeholder="Describe the photographs for screen readers" maxLength={240} /></label>
    <button className="portal-primary" disabled={loading}>{loading && <LoaderCircle className="spin" />}{loading ? "Publishing…" : "Publish to Photo Shoots"}</button>
    <p className={message.includes("published") ? "success" : "error"} role="status">{message}</p>
  </form>;
}
