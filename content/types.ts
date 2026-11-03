export type Link = { label: string; href: string };

export type SiteContent = {
  brand: string;
  nav: Link[];
  cta: Link;
  /** Accessible names for the theme toggle: what pressing it does. */
  theme: { toLight: string; toDark: string };
};

export type Service = {
  index: string;
  title: string;
  body: string;
  /** What the ASCII field is retyped with while this service is hovered. */
  phrase: string;
};

export type HeroContent = {
  eyebrow: string;
  /** The h1, one entry per line as in Figma. */
  hookLines: string[];
  intro: string;
  primaryCta: Link;
  secondaryCta: Link;
  services: Service[];
  sculpture: { phrase: string; cursorLabel: string; hint: string };
  /** Copy on the closing tide (the wireframe's About section): eyebrow, heading lines typed in on highlight boxes, then a paragraph. */
  transition: { eyebrow: string; lines: string[]; body: string };
  /** Tiled huge and faint behind the field as the scene flattens. */
  wordmark: string;
};

/** An image with its accessible label and its height / width, for layouts that place it before it loads. */
export type ImageContent = { src: string; label: string; aspect: number };

