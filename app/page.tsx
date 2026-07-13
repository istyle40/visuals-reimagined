import { ContentSections } from "@/components/ContentSections";
import { Gallery } from "@/components/Gallery";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#gallery">Skip to gallery</a>
      <Header />
      <main><Hero /><Gallery /><ContentSections /></main>
    </>
  );
}
