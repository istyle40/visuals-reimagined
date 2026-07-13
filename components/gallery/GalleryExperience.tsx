"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Heart, MessageSquare, ThumbsDown, X } from "lucide-react";
import { createComment, deleteComment, editComment, updateSelection } from "@/app/actions/gallery";

type Selection = { status: "unreviewed" | "approved" | "rejected"; is_favourite: boolean };
type Comment = { id: string; image_id: string; user_id: string; comment: string; created_at: string; updated_at: string };
type Photo = { id: string; url: string; alt_text: string; title?: string | null; original_filename: string; selection: Selection; comments: Comment[]; downloadable: boolean };
type Filter = "all" | "unreviewed" | "favourites" | "approved" | "rejected";

export function GalleryExperience({ galleryId, photos: initial, userId, readOnly, commentsEnabled, canDownload }: { galleryId: string; photos: Photo[]; userId: string; readOnly: boolean; commentsEnabled: boolean; canDownload: boolean }) {
  const [photos, setPhotos] = useState(initial); const [filter, setFilter] = useState<Filter>("all"); const [activeId, setActiveId] = useState<string | null>(null); const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition(); const dialogRef = useRef<HTMLDivElement>(null); const returnFocus = useRef<HTMLElement | null>(null);
  const visible = useMemo(() => photos.filter((p) => filter === "all" || filter === "favourites" ? filter === "all" || p.selection.is_favourite : p.selection.status === filter), [photos, filter]);
  const activeIndex = activeId ? visible.findIndex((p) => p.id === activeId) : -1; const active = activeIndex >= 0 ? visible[activeIndex] : null;

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("locked"); dialogRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
      if (event.key === "ArrowRight") setActiveId(visible[(activeIndex + 1) % visible.length].id);
      if (event.key === "ArrowLeft") setActiveId(visible[(activeIndex - 1 + visible.length) % visible.length].id);
      if (event.key === "Tab" && dialogRef.current) {
        const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button,a,input,textarea,[tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
        if (!items.length) return; const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener("keydown", key); return () => { document.body.classList.remove("locked"); window.removeEventListener("keydown", key); returnFocus.current?.focus(); };
  }, [active, activeIndex, visible]);

  const change = (photo: Photo, patch: Partial<Selection>) => {
    if (readOnly) return; const next = { ...photo.selection, ...patch };
    setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, selection: next } : item));
    startTransition(async () => { try { await updateSelection({ galleryId, imageId: photo.id, status: next.status, favourite: next.is_favourite }); setNotice("Selection saved"); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save selection"); setPhotos(initial); } });
  };
  const reviewed = photos.filter((p) => p.selection.status !== "unreviewed").length;
  return <>
    <div className="review-toolbar"><div><strong>{reviewed} of {photos.length}</strong> photographs reviewed</div><div className="gallery-filters" role="group" aria-label="Filter photographs">{(["all","unreviewed","favourites","approved","rejected"] as Filter[]).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
    <div className="review-progress" aria-label={`${reviewed} of ${photos.length} photographs reviewed`}><span style={{ width: `${photos.length ? reviewed / photos.length * 100 : 0}%` }} /></div>
    <p className="sr-status" aria-live="polite">{pending ? "Saving changes" : notice}</p>
    <section className="proof-grid" aria-label="Gallery photographs">{visible.map((photo) => <article key={photo.id} className={`proof-card ${photo.selection.status}`}>
      <button className="proof-image" onClick={(event) => { returnFocus.current = event.currentTarget; setActiveId(photo.id); }} aria-label={`Open ${photo.title || photo.original_filename}`}><Image src={photo.url} alt={photo.alt_text} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" /></button>
      <div className="proof-actions"><button disabled={readOnly} className={photo.selection.is_favourite ? "selected" : ""} onClick={() => change(photo, { is_favourite: !photo.selection.is_favourite })} aria-pressed={photo.selection.is_favourite}><Heart /> Favourite</button><button disabled={readOnly} className={photo.selection.status === "approved" ? "selected" : ""} onClick={() => change(photo, { status: photo.selection.status === "approved" ? "unreviewed" : "approved" })} aria-pressed={photo.selection.status === "approved"}><Check /> Approve</button><button disabled={readOnly} className={photo.selection.status === "rejected" ? "selected reject" : ""} onClick={() => change(photo, { status: photo.selection.status === "rejected" ? "unreviewed" : "rejected" })} aria-pressed={photo.selection.status === "rejected"}><ThumbsDown /> Reject</button><button onClick={() => setActiveId(photo.id)}><MessageSquare /> {photo.comments.length}</button></div>
    </article>)}</section>
    {!visible.length && <div className="portal-empty compact"><h2>No photographs in this view.</h2><button onClick={() => setFilter("all")}>Show all photographs</button></div>}
    {active && <div className="proof-lightbox" role="dialog" aria-modal="true" aria-label={`Photograph ${activeIndex + 1} of ${visible.length}`} ref={dialogRef} tabIndex={-1}>
      <button className="lightbox-close" onClick={() => setActiveId(null)} aria-label="Close lightbox"><X /></button>
      <div className="lightbox-stage"><Image src={active.url} alt={active.alt_text} fill sizes="75vw" priority />{visible.length > 1 && <><button className="lightbox-prev" onClick={() => setActiveId(visible[(activeIndex - 1 + visible.length) % visible.length].id)} aria-label="Previous photograph"><ChevronLeft /></button><button className="lightbox-next" onClick={() => setActiveId(visible[(activeIndex + 1) % visible.length].id)} aria-label="Next photograph"><ChevronRight /></button></>}</div>
      <aside className="lightbox-panel"><div><span>{String(activeIndex + 1).padStart(2,"0")} / {String(visible.length).padStart(2,"0")}</span><h2>{active.title || active.original_filename}</h2></div>
        <div className="lightbox-select"><button disabled={readOnly} className={active.selection.is_favourite ? "selected" : ""} onClick={() => change(active, { is_favourite: !active.selection.is_favourite })}><Heart /> Favourite</button><button disabled={readOnly} className={active.selection.status === "approved" ? "selected" : ""} onClick={() => change(active, { status: "approved" })}><Check /> Approve</button><button disabled={readOnly} className={active.selection.status === "rejected" ? "selected reject" : ""} onClick={() => change(active, { status: "rejected" })}><ThumbsDown /> Reject</button></div>
        <Comments galleryId={galleryId} photo={active} userId={userId} enabled={commentsEnabled && !readOnly} onChanged={(comments) => setPhotos((items) => items.map((item) => item.id === active.id ? { ...item, comments } : item))} />
        {canDownload && active.downloadable && <a className="portal-primary" href={`/api/client/galleries/${galleryId}/images/${active.id}/download`}><Download /> Download high resolution</a>}
      </aside>
    </div>}
  </>;
}

function Comments({ galleryId, photo, userId, enabled, onChanged }: { galleryId: string; photo: Photo; userId: string; enabled: boolean; onChanged: (comments: Comment[]) => void }) {
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { await createComment({ galleryId, imageId: photo.id, comment: text }); setText(""); window.location.reload(); } catch (e) { setError(e instanceof Error ? e.message : "Comment could not be saved"); } finally { setBusy(false); } }
  async function remove(id: string) { setBusy(true); try { await deleteComment({ galleryId, commentId: id }); onChanged(photo.comments.filter((c) => c.id !== id)); } catch (e) { setError(e instanceof Error ? e.message : "Comment could not be deleted"); } finally { setBusy(false); } }
  async function edit(comment: Comment) { const next = window.prompt("Edit your comment", comment.comment); if (!next || next === comment.comment) return; setBusy(true); try { await editComment({ galleryId, commentId: comment.id, comment: next }); onChanged(photo.comments.map((c) => c.id === comment.id ? { ...c, comment: next, updated_at: new Date().toISOString() } : c)); } catch (e) { setError(e instanceof Error ? e.message : "Comment could not be updated"); } finally { setBusy(false); } }
  return <section className="comments-panel"><h3>Comments</h3><div className="comment-list">{photo.comments.map((comment) => <article key={comment.id}><header><strong>{comment.user_id === userId ? "You" : "Gallery collaborator"}</strong><time>{new Date(comment.created_at).toLocaleDateString()}</time></header><p>{comment.comment}</p>{comment.user_id === userId && enabled && <div><button disabled={busy} onClick={() => edit(comment)}>Edit</button><button disabled={busy} onClick={() => remove(comment.id)}>Delete</button></div>}</article>)}{!photo.comments.length && <p className="muted">No comments yet.</p>}</div>{enabled && <form onSubmit={submit}><label htmlFor={`comment-${photo.id}`}>Request an adjustment or leave a note</label><textarea id={`comment-${photo.id}`} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required /><div><small>{text.length}/1000</small><button disabled={busy} type="submit">{busy ? "Saving…" : "Add comment"}</button></div></form>}<p role="alert">{error}</p></section>;
}
