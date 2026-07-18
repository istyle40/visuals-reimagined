import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { Header } from "@/components/Header";
import { PhotoshootGallery } from "@/components/PhotoshootGallery";

export const metadata = {
  title: "Photo Shoots — Visuals Reimagined",
  description: "A curated gallery of AI-directed editorial portraits and artistic photo shoots."
};

export default function PhotoshootsPage() {
  return (
    <>
      <Header />
      <main className="photoshoots-page">
        <section className="photoshoots-hero">
          <div className="photoshoots-glow" aria-hidden="true" />
          <p className="section-kicker">Visuals Reimagined · Collection 01</p>
          <h1>Photo <em>Shoots</em></h1>
          <div className="photoshoots-intro">
            <p>Portraits shaped by character, colour and imagination. Each frame is art-directed as a complete visual world.</p>
            <div>
              <Link className="outline-cta" href="/"><ArrowLeft size={15} /> Back to studio</Link>
              <Link className="primary-cta photoshoot-upload" href="/admin/portfolio"><Upload size={15} /> Upload photos</Link>
            </div>
          </div>
        </section>
        <section className="photoshoots-gallery" aria-label="Photo shoots gallery">
          <PhotoshootGallery />
        </section>
        <section className="photoshoot-footer-cta">
          <p className="section-kicker">Create your own visual story</p>
          <h2>Ready for a portrait<br /><em>without limits?</em></h2>
          <a className="primary-cta" href="mailto:hello@visualsreimagined.com?subject=Photo%20shoot%20enquiry">Book a photo shoot</a>
        </section>
      </main>
    </>
  );
}
