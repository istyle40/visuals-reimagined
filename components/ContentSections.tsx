import { Aperture, ArrowUpRight, Clapperboard, Gem, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

const services = [
  { title: "AI Portrait Sessions", text: "Distinctive portraiture built around your identity, mood and personal aesthetic.", Icon: Aperture },
  { title: "Fashion Editorials", text: "Campaign-level imagery without the constraints of location, set or season.", Icon: Gem },
  { title: "Brand Campaigns", text: "Original visual systems made to stop the scroll and hold attention.", Icon: Clapperboard },
  { title: "Concept Development", text: "Creative direction from first spark to a cohesive, ownable world.", Icon: Sparkles }
];

export function ContentSections() {
  return (
    <>
      <section className="services section-pad" id="services">
        <div className="section-intro compact"><p className="section-kicker">Studio services</p><h2>Ideas, directed<br />into <em>images.</em></h2></div>
        <div className="services-grid">
          {services.map(({ title, text, Icon }, index) => (
            <article key={title}><span>0{index + 1}</span><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p><a href="#contact">Explore service <ArrowUpRight size={15} /></a></article>
          ))}
        </div>
      </section>

      <section className="about section-pad" id="about">
        <div className="about-orb" aria-hidden="true" />
        <p className="section-kicker">The studio</p>
        <h2>Photography without<br /><em>physical limits.</em></h2>
        <div className="about-copy"><p>Visuals Reimagined creates cinematic AI imagery for individuals, creators and brands. Every project begins with a concept and is shaped through creative direction, image generation and professional finishing.</p><a className="outline-cta" href="#contact">Discover the studio</a></div>
      </section>

      <section className="contact section-pad" id="contact">
        <div className="contact-prism" aria-hidden="true" />
        <p className="section-kicker">Begin a project</p>
        <h2>Ready to reimagine<br />your next <em>visual?</em></h2>
        <div className="contact-actions"><a className="primary-cta" href="mailto:hello@visualsreimagined.com?subject=Project%20enquiry">Start a project</a><a className="text-cta" href="mailto:hello@visualsreimagined.com">Contact the studio <ArrowUpRight size={16} /></a></div>
      </section>

      <footer>
        <div className="footer-top"><Logo /><p>Luxury AI photography crafted for brands,<br />creators, and dreamers.</p><div><a href="#gallery">Gallery</a><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a><a href="/client-login">Client Gallery Access</a></div><div><a href="https://instagram.com">Instagram</a><a href="https://facebook.com">Facebook</a><a href="mailto:hello@visualsreimagined.com">Email</a></div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Visuals Reimagined</span><div><a href="#">Privacy</a><a href="#">Terms</a></div></div>
      </footer>
    </>
  );
}
