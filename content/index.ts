import site from "./site.json";
import hero from "./hero.json";
import logoMark from "./media/logo-mark.png";
import type { HeroContent, ImageContent, SiteContent } from "./types";

export const siteContent: SiteContent = site;
export const heroContent: HeroContent = hero;
/** logo-mark.png is 1702 × 1068. */
export const brandMark: ImageContent = { src: logoMark, label: "Jiroh logo", aspect: 1068 / 1702 };
export * from "./work";
export * from "./home";
export * from "./catalogue";
export * from "./pages";
export type * from "./types";
