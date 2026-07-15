import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PrismMuseGallery, type PrismMusePhoto } from "@/components/PrismMuseGallery";
import "./prism-muse.css";

export const metadata: Metadata = {
  title: "Prism Muse — Visuals Reimagined",
  description: "A cinematic fashion editorial exploring confidence, colour and contemporary Mediterranean beauty."
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const photos: PrismMusePhoto[] = [
  { src: `${basePath}/assets/vr-prism-red-beauty.png`, alt: "Mediterranean fashion model in ruby-red couture covering half her face", title: "The Gaze", note: "Opening portrait", position: "64% center" },
  { src: `${basePath}/assets/prism-muse-02-full.png`, alt: "Full-length portrait of the model in a sculptural ruby gown", title: "Crimson Form", note: "Full-length study", position: "center 18%" },
  { src: `${basePath}/assets/prism-muse-03-profile.png`, alt: "Side-profile beauty portrait with rainbow prism light", title: "Light Trace", note: "Profile and refraction", position: "center 22%" },
  { src: `${basePath}/assets/prism-muse-04-seated.png`, alt: "Model seated in a tailored red suit in a futuristic studio", title: "Poise", note: "Tailored editorial", position: "center 16%" },
  { src: `${basePath}/assets/prism-muse-05-detail.png`, alt: "Beauty detail of green eye, ruby jewellery and translucent red fabric", title: "Ruby Detail", note: "Beauty close-up", position: "center" },
  { src: `${basePath}/assets/prism-muse-06-mirror.png`, alt: "Model surrounded by fragmented mirror panels and coloured light", title: "Reflected Self", note: "Experimental portrait", position: "center 20%" }
];

export default function PrismMusePage() {
  return (
    <main className="prism-project">
      <header className="prism-project-header">
        <Link className="vr-logo" href="/" aria-label="Visuals Reimagined studio, home"><span aria-hidden="true">V<span>R</span></span><small>Studio</small></Link>
        <Link className="prism-back" href="/#gallery"><ArrowLeft size={15} /> Back to gallery</Link>
        <a className="prism-book" href="mailto:hello@visualsreimagined.com?subject=Prism%20Muse%20photo%20shoot">Book a session</a>
      </header>

      <section className="prism-project-hero">
        <Image src={photos[0].src} alt={photos[0].alt} fill priority sizes="100vw" style={{ objectPosition: photos[0].position }} />
        <div className="prism-project-hero-shade" />
        <div className="prism-project-title">
          <p>Photo shoots · Editorial 01</p>
          <h1>Prism<br /><em>Muse</em></h1>
          <span>Confidence, colour and contemporary Mediterranean beauty.</span>
        </div>
        <div className="prism-project-index"><span>01</span><i /><span>06</span></div>
      </section>

      <section className="prism-project-intro">
        <p className="section-kicker">The visual story</p>
        <h2>Beauty held between<br /><em>shadow and light.</em></h2>
        <div><p>Prism Muse is a study of presence: ruby tones, precise silhouettes and a gaze that never asks permission.</p><p>Created as a contemporary fashion editorial, the series moves from intimate beauty details to commanding full-length portraiture.</p></div>
      </section>

      <section className="prism-project-gallery" aria-label="Prism Muse editorial photographs">
        <PrismMuseGallery photos={photos} />
      </section>

      <section className="prism-project-cta">
        <p className="section-kicker">Your story, reimagined</p>
        <h2>Create your own<br /><em>signature portrait.</em></h2>
        <a className="primary-cta" href="mailto:hello@visualsreimagined.com?subject=Create%20my%20photo%20shoot">Book a session <ArrowUpRight size={16} /></a>
      </section>

      <footer className="prism-project-footer"><span>© {new Date().getFullYear()} Visuals Reimagined</span><Link href="/">Return home</Link></footer>
    </main>
  );
}
