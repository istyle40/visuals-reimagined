export type Collection = {
  title: string;
  category: string;
  image: string;
  alt: string;
  accent: string;
  position?: string;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const collections: Collection[] = [
  {
    title: "Prism Muse",
    category: "Neon Editorial",
    image: `${basePath}/assets/vr-hero-prism.png`,
    alt: "Wet-look editorial portrait with a violet iridescent collar",
    accent: "#e76896",
    position: "64% center"
  },
  {
    title: "New Light",
    category: "Luxury Fashion",
    image: `${basePath}/assets/vr-luxury-fashion.png`,
    alt: "Fashion portrait in sculptural silver clothing under lavender light",
    accent: "#8e6ad8",
    position: "center 24%"
  },
  {
    title: "After Dark",
    category: "Automotive",
    image: `${basePath}/assets/vr-automotive.png`,
    alt: "Black performance coupe photographed on a wet studio road",
    accent: "#e76896",
    position: "center"
  },
  {
    title: "Electric Youth",
    category: "Fine Art Portraits",
    image: `${basePath}/assets/vr-neon-editorial.png`,
    alt: "Contemporary portrait in a cobalt studio with lime light",
    accent: "#62c9ee",
    position: "center 25%"
  },
  {
    title: "Threshold",
    category: "Conceptual",
    image: `${basePath}/assets/vr-conceptual.png`,
    alt: "Mirrored doorway reflected in a calm sunrise landscape",
    accent: "#8e6ad8",
    position: "center"
  }
];

export const galleryStories = [
  { ...collections[0], category: "Fashion" },
  { ...collections[4], category: "Conceptual" },
  { ...collections[2], category: "Automotive" },
  { ...collections[1], category: "Luxury" },
  { ...collections[3], category: "Portrait" },
  { ...collections[0], title: "Liquid Chrome", category: "Commercial", position: "75% center" }
];
