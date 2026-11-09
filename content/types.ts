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

/** A section's head block: the h2 and the one line under it. */
export type SectionHead = { head: string; line: string };

export type IntroContent = { head: string; line: string; primary: Link; secondary: Link; visual: ImageContent };
export type EmailWork = { title: string; image: ImageContent };
export type EmailsContent = SectionHead & { openLabel: string; items: EmailWork[] };
export type MotionWork = { title: string; label: string; video: string; poster: string };
export type MotionContent = SectionHead & { pause: string; play: string; items: MotionWork[] };
export type GraphicWork = { title: string; note: string; image: ImageContent };
export type GraphicsContent = SectionHead & { items: GraphicWork[] };
export type EditRow = { title: string; form: string; href: string };
export type EditsContent = SectionHead & { watch: string; columns: { title: string; form: string }; rows: EditRow[] };
export type ContactContent = SectionHead & { email: string; servicesLabel: string; services: string[] };
export type FooterContent = {
  wordmark: string; note: string; toTop: string;
  sectionsLabel: string; contactLabel: string;
  /** Social or profile links; the column is left out while empty (owner: TBD). */
  elsewhereLabel: string; elsewhere: Link[];
};


/** One craft in the hero statement: its list/tab label, the word set in the h1, and its backdrop (absent until the owner sends one). */
export type Craft = { label: string; word: string; visual?: ImageContent };
/** The hero statement (Figma "Hero · big type + craft list (G)"): "lead [word] tail.", one line, two actions, the crafts. */
export type StatementContent = {
  lead: string; tail: string; line: string; primary: Link; secondary: Link;
  listLabel: string;
  /** Glyphs the word scrambles through on each swap. */
  glyphs: string;
  crafts: Craft[];
};
