"use client";

import { useEffect, useState } from "react";
import { Facebook, Instagram, Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";

const links = [
  ["Home", "/#home"], ["Gallery", "/#gallery"], ["Collections", "/#collections"],
  ["About", "/#about"], ["Services", "/#services"], ["Contact", "/#contact"]
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("locked", open);
    return () => document.body.classList.remove("locked");
  }, [open]);

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      <Logo />
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map(([label, href], index) => <a className={index === 0 ? "active" : ""} href={href} key={href}>{label}</a>)}
      </nav>
      <div className="header-actions">
        <a className="client-access" href="/client-login">Client Access</a>
        <a href="https://instagram.com" aria-label="Instagram"><Instagram size={16} /></a>
        <a href="https://facebook.com" aria-label="Facebook"><Facebook size={16} /></a>
        <button className="icon-button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}><Menu size={19} /></button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" role="dialog" aria-label="Mobile navigation" aria-modal="true"
            initial={reduceMotion ? false : { opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ duration: .35, ease: [.22,1,.36,1] }}>
            <div className="mobile-menu-top"><Logo /><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button></div>
            <nav aria-label="Mobile navigation">
              {links.map(([label, href], index) => (
                <motion.a href={href} key={href} onClick={() => setOpen(false)} initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }}>{label}<span>0{index + 1}</span></motion.a>
              ))}
              <motion.a className="mobile-client-access" href="/client-login" onClick={() => setOpen(false)} initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>Client Access<span>07</span></motion.a>
            </nav>
            <p>Crafted by vision.<br />Powered by AI.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
