import home from "./home.json";
import garnier from "./media/work/garnier-email.webp";
import billfishReel from "./media/work/reels-billfish.jpg";
import dispatchLaunch from "./media/work/launch-creative-dispatch.webp";
import luauCode from "./media/work/luau-code.webp";
import dayToGo from "./media/work/cs180-1-day-to-go.mp4";
import dayToGoPoster from "./media/work/cs180-1-day-to-go-poster.jpg";
import colloquiumPoster from "./media/work/cs-colloquium-poster.jpg";
import webSite from "./media/work/web-site.jpg";
import saltLab from "./media/work/salt-lab.webp";
import uniworld from "./media/work/uniworld-email.webp";
import dispatchEmail from "./media/work/dispatch-email.webp";
import nike from "./media/work/nike.webp";
import phoneLock from "./media/work/phone-lock.png";
import phoneOpen from "./media/work/phone-open.png";
import phoneRead from "./media/work/phone-read.png";
import phoneFooter from "./media/work/phone-footer.png";
import type {
  ClientsContent, EmailsOpenContent, EnquireBandContent, ReelContent, ServicesContent, TestimonialsContent,
  ToolsContent, WorkContent,
} from "./types";

/** Joins home.json's copy with its media, in the order home.json lists the items. Aspect is height / width. */
const img = (src: string, aspect: number, label: string) => ({ src, aspect, label });

export const clientsContent: ClientsContent = home.clients;

const reelFiles = [
  { src: dayToGoPoster, aspect: 720 / 1280, video: dayToGo },
  { src: billfishReel, aspect: 1350 / 1080 },
  { src: colloquiumPoster, aspect: 720 / 1280 },
  { src: dispatchLaunch, aspect: 1232 / 1200 },
];
export const reelContent: ReelContent = {
  ...home.reel,
  items: home.reel.items.map(({ title, label }, i) => {
    const { src, aspect, video } = reelFiles[i] as { src: string; aspect: number; video?: string };
    return { title, image: img(src, aspect, label), video };
  }),
};

const workFiles = [
  { src: garnier, aspect: 3906 / 1200 }, { src: billfishReel, aspect: 1350 / 1080 },
  { src: dispatchLaunch, aspect: 1232 / 1200 }, { src: luauCode, aspect: 650 / 1060 },
  { src: dayToGoPoster, aspect: 720 / 1280 }, { src: webSite, aspect: 900 / 1440 },
];
export const workContent: WorkContent = {
  ...home.work,
  crafts: ["Email", "Graphic", "Motion", "Video", "Web", "Games"],
  items: home.work.items.map(({ label, ...card }, i) => ({
    ...card, href: `/work/${card.slug}`, image: img(workFiles[i].src, workFiles[i].aspect, label),
  })),
};

const emailFiles = [
  { src: saltLab, aspect: 2126 / 600 }, { src: uniworld, aspect: 2290 / 600 },
  { src: dispatchEmail, aspect: 2890 / 1200 }, { src: garnier, aspect: 3906 / 1200 },
];
export const emailsOpenContent: EmailsOpenContent = {
  ...home.emails,
  phone: {
    states: [phoneLock, phoneOpen, phoneRead, phoneFooter],
    label: "The Salt Lab email on a phone: it arrives, opens, and is read to the last line",
  },
  items: home.emails.items.map(({ label, ...item }, i) => ({
    ...item, image: img(emailFiles[i].src, emailFiles[i].aspect, label),
  })),
};

/** Craft images shown beside a hovered service row, in services order. */
const serviceFiles = [
  img(saltLab, 2126 / 600, "Salt Lab email"), img(nike, 1, "Nike ad graphic"),
  img(dayToGoPoster, 720 / 1280, "CS 180 countdown still"), img(billfishReel, 1350 / 1080, "Billfish Gear reel still"),
  img(webSite, 900 / 1440, "A website Jiroh built"), img(luauCode, 650 / 1060, "Luau code from a Roblox game"),
];
export const servicesContent: ServicesContent = {
  ...home.services,
  items: home.services.items.map((row, i) => ({ ...row, image: serviceFiles[i] })),
};

export const toolsContent: ToolsContent = {
  ...home.tools,
  groups: home.tools.groups.map((g) => ({ ...g, tools: g.tools as [string, string][] })),
};
export const testimonialsContent: TestimonialsContent = home.testimonials;
export const enquireBandContent: EnquireBandContent = home.enquire;
