import catalogue from "./catalogue.json";
import garnier from "./media/work/garnier-email.jpg";
import saltLab from "./media/work/salt-lab.png";
import uniworld from "./media/work/uniworld-email.jpg";
import dispatchEmail from "./media/work/dispatch-email.jpg";
import billfish from "./media/work/billfish-gear.png";
import cannondale from "./media/work/cannondale.jpg";
import basketball from "./media/work/basketball.jpg";
import emailGif from "./media/work/email-test.gif";
import nike from "./media/work/nike.png";
import burger from "./media/work/best-burger.jpg";
import dispatchLaunch from "./media/work/launch-creative-dispatch.jpg";
import dayToGo from "./media/work/cs180-1-day-to-go.mp4";
import dayToGoPoster from "./media/work/cs180-1-day-to-go-poster.jpg";
import colloquium from "./media/work/cs-colloquium.mp4";
import colloquiumPoster from "./media/work/cs-colloquium-poster.jpg";
import logoSting from "./media/work/cs180-logo.mp4";
import logoStingPoster from "./media/work/cs180-logo-poster.jpg";
import billfishReel from "./media/work/reels-billfish.jpg";
import webSite from "./media/work/web-site.jpg";
import gameWinners from "./media/work/game-winners.png";
import luauCode from "./media/work/luau-code.png";
import gameCastle from "./media/work/game-castle.png";
import type { CatalogueContent, WorkMedia } from "./types";

/** Media files by the keys catalogue.json uses. Aspect is height / width. */
const files: Record<string, Omit<WorkMedia, "kind" | "label">> = {
  garnier: { src: garnier, aspect: 3906 / 1200 }, saltLab: { src: saltLab, aspect: 2126 / 600 },
  uniworld: { src: uniworld, aspect: 2290 / 600 }, dispatchEmail: { src: dispatchEmail, aspect: 2890 / 1200 },
  billfish: { src: billfish, aspect: 2310 / 600 }, cannondale: { src: cannondale, aspect: 2009 / 600 },
  basketball: { src: basketball, aspect: 2009 / 600 }, emailGif: { src: emailGif, aspect: 2288 / 600 },
  nike: { src: nike, aspect: 1 }, burger: { src: burger, aspect: 2000 / 1600 },
  dispatchLaunch: { src: dispatchLaunch, aspect: 1232 / 1200 },
  dayToGo: { src: dayToGo, poster: dayToGoPoster, aspect: 720 / 1280 },
  colloquium: { src: colloquium, poster: colloquiumPoster, aspect: 720 / 1280 },
  logoSting: { src: logoSting, poster: logoStingPoster, aspect: 720 / 1280 },
  billfishReel: { src: billfishReel, aspect: 1350 / 1080 }, webSite: { src: webSite, aspect: 900 / 1440 },
  gameWinners: { src: gameWinners, aspect: 1080 / 1920 }, luauCode: { src: luauCode, aspect: 650 / 1060 },
  gameCastle: { src: gameCastle, aspect: 1045 / 1884 },
};

export const catalogueContent: CatalogueContent = {
  ...catalogue,
  items: catalogue.items.map(({ media, ...item }) => ({
    ...item,
    media: media.map(({ kind, key, label }) => {
      const file = files[key];
      if (!file) throw new Error(`catalogue: no media file for "${key}"`);
      return { ...file, kind: kind as WorkMedia["kind"], label };
    }),
  })),
};

/** The still that stands for a piece in grids: its first image, or its first video's poster. */
export function coverOf(item: CatalogueContent["items"][number]): { src: string; label: string } {
  const first = item.media[0];
  return { src: first.kind === "video" ? first.poster ?? "" : first.src, label: first.label };
}
