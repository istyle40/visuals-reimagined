"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

type PortfolioImage = { id: string; src: string; alt: string; title: string; width?: number; height?: number };

const starters: PortfolioImage[] = [
  { id: "red-hat", src: "/assets/vr-red-hat-photoshoot.webp", alt: "High-fashion portrait with a sculptural red hat and glove", title: "Crimson Poise", width: 1672, height: 941 },
  { id: "prism-muse", src: "/assets/vr-hero-prism.png", alt: "Iridescent editorial beauty portrait", title: "Prism Muse" },
  { id: "neon-editorial", src: "/assets/vr-neon-editorial.png", alt: "Contemporary portrait under cobalt and lime studio lighting", title: "Electric Youth" },
  { id: "luxury-fashion", src: "/assets/vr-luxury-fashion.png", alt: "Sculptural silver fashion portrait under lavender light", title: "Silver Form" }
];

export function PhotoshootGallery() {
  const [images, setImages] = useState(starters);
  const [selected, setSelected] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetch("/api/portfolio", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((body) => body.images?.length && setImages(body.images))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (selected === null) return;
    document.body.classList.add("locked");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((current) => current === null ? 0 : (current + 1) % images.length);
      if (event.key === "ArrowLeft") setSelected((current) => current === null ? 0 : (current - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("locked"); window.removeEventListener("keydown", onKey); };
  }, [selected, images.length]);

  return (
    <>
      <div className="photoshoot-mosaic">
        {images.map((image, index) => (
          <motion.button key={image.id} className={`photoshoot-tile tile-${(index % 6) + 1}`} onClick={() => setSelected(index)}
            initial={reduceMotion ? false : { opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .7, delay: (index % 3) * .06 }}>
            <Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 50vw" />
            <span><small>Photo shoot · {String(index + 1).padStart(2, "0")}</small><b>{image.title}</b></span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div className="photoshoot-lightbox" role="dialog" aria-modal="true" aria-label={images[selected].title}
            initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
            <button className="photoshoot-close" onClick={() => setSelected(null)} aria-label="Close photograph"><X /></button>
            <button className="photoshoot-prev" onClick={() => setSelected((selected - 1 + images.length) % images.length)} aria-label="Previous photograph"><ArrowLeft /></button>
            <div className="photoshoot-lightbox-image"><Image src={images[selected].src} alt={images[selected].alt} fill sizes="95vw" /></div>
            <button className="photoshoot-next" onClick={() => setSelected((selected + 1) % images.length)} aria-label="Next photograph"><ArrowRight /></button>
            <p><small>Visuals Reimagined · Photo Shoots</small>{images[selected].title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
