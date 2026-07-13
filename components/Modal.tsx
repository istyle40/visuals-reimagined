"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

type ModalProps = { open: boolean; onClose: () => void; image?: string; title: string; mode?: "reel" | "image" };

export function Modal({ open, onClose, image = "/assets/vr-hero-prism.png", title, mode = "image" }: ModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.body.classList.add("locked");
    window.addEventListener("keydown", key);
    closeRef.current?.focus();
    return () => { document.body.classList.remove("locked"); window.removeEventListener("keydown", key); };
  }, [open, onClose]);

  if (!open) return null;

  return (
      <motion.div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className={`modal-card ${mode === "reel" ? "reel-card" : ""}`} initial={reduceMotion ? false : { opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
          <button ref={closeRef} type="button" className="modal-close" onPointerDown={onClose} onClick={onClose} aria-label={`Close ${title}`}><X /></button>
          <div className="modal-media"><Image src={image} alt="" fill sizes="90vw" /></div>
          <div className="modal-caption"><span>{mode === "reel" ? "Studio reel" : "Selected story"}</span><h3>{title}</h3>{mode === "reel" && <p>Film placeholder — ready for the final studio reel URL.</p>}</div>
        </motion.div>
      </motion.div>
  );
}
