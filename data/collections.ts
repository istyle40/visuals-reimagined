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
    image: `${basePath}/assets/vr-knicole-brand-alchemy.webp`,
    alt: "KNICOLE soft drink campaign poster with a glass bottle, ice cubes and dynamic splashing liquid",
    accent: "#8e6ad8",
    position: "center 58%"
  },
  {
    title: "Object of Desire",
    category: "Products",
    image: `${basePath}/assets/vr-automotive.png`,
    alt: "Black performance coupe photographed on a wet studio road",
    accent: "#e76896",
    position: "center"
  },
  {
    title: "Electric Youth",
    category: "Photo Shoots",
    image: `${basePath}/assets/vr-red-hat-photoshoot.webp`,
    alt: "High-fashion portrait of a woman wearing a dramatic red hat and red glove",
    accent: "#62c9ee",
    position: "center"
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
