"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { collections } from "@/data/collections";
import { Modal } from "./Modal";

export function Hero() {
  const [active, setActive] = useState(0);
  const [reelOpen, setReelOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const touchStart = useRef(0);
  const reduceMotion = useReducedMotion();
  const slide = collections[active];

  const changeSlide = useCallback((direction: number) => {
    setActive((current) => Math.max(0, Math.min(collections.length - 1, current + direction)));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!heroRef.current || heroRef.current.getBoundingClientRect().bottom < 0) return;
      if (event.key === "ArrowRight") changeSlide(1);
      if (event.key === "ArrowLeft") changeSlide(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [changeSlide]);

  const onWheel = (event: React.WheelEvent) => {
    if (Math.abs(event.deltaY) < 24) return;
    if ((event.deltaY < 0 && active > 0) || (event.deltaY > 0 && active < collections.length - 1)) {
      event.preventDefault();
      changeSlide(event.deltaY > 0 ? 1 : -1);
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const x = (event.clientX / window.innerWidth - .5) * 10;
    const y = (event.clientY / window.innerHeight - .5) * 7;
    heroRef.current?.style.setProperty("--parallax-x", `${x}px`);
    heroRef.current?.style.setProperty("--parallax-y", `${y}px`);
  };

  return (
    <section id="home" className="hero" ref={heroRef} onWheel={onWheel} onPointerMove={onPointerMove}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const delta = touchStart.current - e.changedTouches[0].clientX; if (Math.abs(delta) > 48) changeSlide(delta > 0 ? 1 : -1); }}>
      <div className="hero-image" aria-live="polite">
        <motion.div key={slide.image} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .65 }} className="hero-image-layer">
          <Image src={slide.image} alt={slide.alt} fill priority={active === 0} sizes="100vw" style={{ objectPosition: slide.position }} />
        </motion.div>
      </div>
      <div className="hero-shade" />
      <div className="prism prism-one" /><div className="prism prism-two" />

      <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .15 }}>
        <p className="eyebrow"><i />AI Photography Studio</p>
        <h1><span>Visuals</span><em>Reimagined</em></h1>
        <div className="light-line" />
        <p className="hero-lede">Luxury AI photography crafted for<br />brands, creators, and dreamers.</p>
        <div className="hero-ctas">
          <a href="#gallery" className="primary-cta">Explore gallery</a>
          <button className="reel-button" onClick={() => setReelOpen(true)}><span><Play size={17} fill="currentColor" /></span>Watch reel</button>
        </div>
      </motion.div>

      <div id="collections" className="thumbs" role="tablist" aria-label="Featured collections">
        {collections.slice(0, 4).map((item, index) => (
          <button key={item.title} role="tab" aria-selected={active === index} aria-label={`Show ${item.category}`} onClick={() => setActive(index)}>
            <Image src={item.image} alt="" fill sizes="130px" style={{ objectPosition: item.position }} /><span>{item.category}</span>
          </button>
        ))}
      </div>

      <div className="slide-indicator" aria-label={`Slide ${active + 1} of ${collections.length}`}><span>{String(active + 1).padStart(2, "0")}</span><i><b style={{ height: `${((active + 1) / collections.length) * 100}%`, background: slide.accent }} /></i><span>{String(collections.length).padStart(2, "0")}</span></div>
      <p className="scroll-note">Scroll to discover</p>
      <div className="brand-line"><span>Crafted by vision. Powered by AI.</span><i /></div>
      <Modal open={reelOpen} onClose={() => setReelOpen(false)} title="Visuals Reimagined — Studio Reel" mode="reel" image={slide.image} />
    </section>
  );
}
