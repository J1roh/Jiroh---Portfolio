import work from "./work.json";
import saltLab from "./media/work/salt-lab.png";
import billfish from "./media/work/billfish-gear.png";
import cannondale from "./media/work/cannondale.jpg";
import basketball from "./media/work/basketball.jpg";
import emailGif from "./media/work/email-test.gif";
import nike from "./media/work/nike.png";
import burger from "./media/work/best-burger.jpg";
import dayToGo from "./media/work/cs180-1-day-to-go.mp4";
import dayToGoPoster from "./media/work/cs180-1-day-to-go-poster.jpg";
import colloquium from "./media/work/cs-colloquium.mp4";
import colloquiumPoster from "./media/work/cs-colloquium-poster.jpg";
import logoSting from "./media/work/cs180-logo.mp4";
import logoStingPoster from "./media/work/cs180-logo-poster.jpg";
import luauCode from "./media/work/luau-code.png";
import type {
  ContactContent, EditsContent, StatementContent, EmailsContent, FooterContent, GraphicsContent, IntroContent, MotionContent,
} from "./types";

/** Joins the copy in work.json with its media, in the order work.json lists the items. Aspect is height / width. */
const emailFiles = [
  { src: billfish, aspect: 2310 / 600 },
  { src: cannondale, aspect: 2009 / 600 },
  { src: basketball, aspect: 2009 / 600 },
  { src: emailGif, aspect: 2288 / 600 },
];
const graphicFiles = [
  { src: nike, aspect: 1 },
  { src: burger, aspect: 2000 / 1600 },
];
const motionFiles = [
  { video: dayToGo, poster: dayToGoPoster },
  { video: colloquium, poster: colloquiumPoster },
  { video: logoSting, poster: logoStingPoster },
];

const { visualLabel, ...intro } = work.intro;
export const introContent: IntroContent = {
  ...intro,
  visual: { src: saltLab, label: visualLabel, aspect: 2126 / 600 },
};

export const emailsContent: EmailsContent = {
  ...work.emails,
  items: work.emails.items.map(({ title, label }, i) => ({ title, image: { ...emailFiles[i], label } })),
};

export const motionContent: MotionContent = {
  ...work.motion,
  items: work.motion.items.map((item, i) => ({ ...item, ...motionFiles[i] })),
};

export const graphicsContent: GraphicsContent = {
  ...work.graphics,
  items: work.graphics.items.map(({ title, note, label }, i) => ({ title, note, image: { ...graphicFiles[i], label } })),
};

export const editsContent: EditsContent = work.edits;
export const contactContent: ContactContent = work.contact;
export const footerContent: FooterContent = work.footer;

/** Hero backdrops by craft, in work.json order. Web has none yet (owner: TBD), so it shows the plain canvas. */
const craftFiles = [
  { src: basketball, aspect: 2009 / 600 },
  { src: nike, aspect: 1 },
  { src: dayToGoPoster, aspect: 720 / 1280 },
  { src: colloquiumPoster, aspect: 720 / 1280 },
  null,
  { src: luauCode, aspect: 650 / 1060 },
];
export const statementContent: StatementContent = {
  ...work.statement,
  crafts: work.statement.crafts.map(({ label, word, visualLabel }, i) => {
    const file = craftFiles[i];
    return { label, word, visual: file ? { ...file, label: visualLabel } : undefined };
  }),
};
