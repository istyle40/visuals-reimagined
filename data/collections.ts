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
    category: "Photo Shoots",
    image: `${basePath}/assets/vr-hero-prism.png`,
    alt: "Wet-look editorial portrait with a violet iridescent collar",
    accent: "#e76896",
    position: "64% center"
  },
  {
    title: "Brand Alchemy",
    category: "Commercials",
    image: `${basePath}/assets/vr-luxury-fashion.png`,
    alt: "Fashion portrait in sculptural silver clothing under lavender light",
    accent: "#8e6ad8",
    position: "center 24%"
  },
  {
    title: "Object of Desire",
    category: "Products",
    image: `${basePath}/assets/vr-perfume.png`,
    alt: "Faceted luxury perfume bottle with dramatic violet lighting and an elegant woman in the background",
    accent: "#e76896",
    position: "center"
  },
  {
    title: "Electric Youth",
    category: "Photo Shoots",
    image: `${basePath}/assets/vr-neon-editorial.png`,
    alt: "Contemporary portrait in a cobalt studio with lime light",
    accent: "#62c9ee",
    position: "center 25%"
  },
  {
    title: "Threshold",
    category: "Artistic Creativity",
    image: `${basePath}/assets/vr-conceptual.png`,
    alt: "Mirrored doorway reflected in a calm sunrise landscape",
    accent: "#8e6ad8",
    position: "center"
  }
];

export const galleryStories = [
  { ...collections[0] },
  { ...collections[4] },
  { ...collections[2] },
  { ...collections[1] },
  { ...collections[3] },
  { ...collections[0], title: "Liquid Chrome", category: "Commercials", position: "75% center" }
];
