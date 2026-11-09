import {
  contactContent, editsContent, emailsContent, footerContent, graphicsContent, motionContent, siteContent, statementContent,
} from "@content/index";
import { TopBar } from "../features/top-bar";
import { HeroStatement } from "../features/hero-statement";
import { EmailGrid } from "../features/email-grid";
import { MotionReel } from "../features/motion-reel";
import { Graphics } from "../features/graphics";
import { EditIndex } from "../features/edit-index";
import { Contact } from "../features/contact";
import { SiteFooter } from "../features/site-footer";
import { readFxFlags } from "../lib/fx/fx-flags";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { useSmoothScroll } from "../lib/scroll/use-smooth-scroll";

const fx = readFxFlags(window.location.search);

/**
 * Home page composer: the only place features meet.
 * 2026-11-07 rebuild: the work leads (emails, motion, graphics, video), then the contact close.
 * The old hero (`features/hero`, `features/site-nav`) and `features/intro` are no longer composed; deleting them waits for the owner.
 * 2026-11-09: the first screen is the Figma Hero G statement (`features/hero-statement`).
 */
export function Home() {
  const still = useReducedMotion();
  useSmoothScroll(fx.smooth && !still);

  return (
    <>
      <TopBar content={siteContent} />
      <main id="main">
        <HeroStatement content={statementContent} motion={fx.cycle && !still} />
        <EmailGrid content={emailsContent} />
        <MotionReel content={motionContent} play={fx.loops && !still} />
        <Graphics content={graphicsContent} />
        <EditIndex content={editsContent} />
        <Contact content={contactContent} />
      </main>
      <SiteFooter content={footerContent} nav={siteContent.nav} cta={siteContent.cta} contact={contactContent} />
    </>
  );
}
