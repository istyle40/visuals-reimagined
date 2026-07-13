"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { galleryStories } from "@/data/collections";
import { Modal } from "./Modal";

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  return (
    <section className="gallery section-pad" id="gallery">
      <div className="section-intro">
        <p className="section-kicker">Selected visual stories</p>
        <h2>Beyond the limits of<br /><em>traditional photography.</em></h2>
        <p>Editorial concepts, portraits and campaigns created from imagination, art direction and precision.</p>
      </div>
      <div className="gallery-grid">
        {galleryStories.map((story, index) => (
          <motion.article key={`${story.title}-${index}`} className={`gallery-card card-${index + 1}`}
            initial={reduceMotion ? false : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .65 }}>
            <button onClick={() => setSelected(index)} aria-label={`Open ${story.title} project preview`}>
              <Image src={story.image} alt={story.alt} fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectPosition: story.position }} />
              <span><small>{story.category}</small><b>{story.title}</b></span><ArrowUpRight aria-hidden="true" />
            </button>
          </motion.article>
        ))}
      </div>
      {selected !== null && <Modal open onClose={() => setSelected(null)} title={galleryStories[selected].title} image={galleryStories[selected].image} />}
    </section>
  );
}
