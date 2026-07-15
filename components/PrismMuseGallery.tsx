"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type PrismMusePhoto = {
  src: string;
  alt: string;
  title: string;
  note: string;
  position?: string;
};

export function PrismMuseGallery({ photos }: { photos: PrismMusePhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? null : (current + 1) % photos.length);
    };
    document.body.classList.add("locked");
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove("locked");
      window.removeEventListener("keydown", onKey);
    };
  }, [activeIndex, photos.length]);

  const step = (direction: number) => setActiveIndex((current) => current === null ? null : (current + direction + photos.length) % photos.length);
  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <div className="prism-editorial-grid">
        {photos.map((photo, index) => (
          <article className={`prism-editorial-item prism-editorial-item-${index + 1}`} key={photo.src}>
            <button type="button" onClick={() => setActiveIndex(index)} aria-label={`View ${photo.title} full screen`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 60vw" style={{ objectPosition: photo.position }} />
              <span><small>0{index + 1}</small><strong>{photo.title}</strong><em>{photo.note}</em></span>
            </button>
          </article>
        ))}
      </div>

      {active && activeIndex !== null && (
        <div className="prism-lightbox" role="dialog" aria-modal="true" aria-label={`${active.title}, photograph ${activeIndex + 1} of ${photos.length}`} onMouseDown={(event) => event.target === event.currentTarget && setActiveIndex(null)}>
          <button ref={closeRef} type="button" className="prism-lightbox-close" onClick={() => setActiveIndex(null)} aria-label="Close full-screen photograph"><X /></button>
          <button type="button" className="prism-lightbox-prev" onClick={() => step(-1)} aria-label="Previous photograph"><ChevronLeft /></button>
          <div className="prism-lightbox-image"><Image src={active.src} alt={active.alt} fill sizes="100vw" /></div>
          <button type="button" className="prism-lightbox-next" onClick={() => step(1)} aria-label="Next photograph"><ChevronRight /></button>
          <div className="prism-lightbox-caption"><span>0{activeIndex + 1} / 0{photos.length}</span><strong>{active.title}</strong></div>
        </div>
      )}
    </>
  );
}
