import {
  clientsContent, contactContent, emailsOpenContent, enquireBandContent, footerContent, reelContent, servicesContent,
  siteContent, statementContent, testimonialsContent, toolsContent, workContent,
} from "@content/index";
import { TopBar } from "../features/top-bar";
import { HeroStatement } from "../features/hero-statement";
import { ClientsMarquee } from "../features/clients-marquee";
import { ReelGrow } from "../features/reel-grow";
import { SelectedWork } from "../features/selected-work";
import { EmailsOpen } from "../features/emails-open";
import { Services } from "../features/services";
import { Tools } from "../features/tools";
import { Testimonials } from "../features/testimonials";
import { EnquireBand } from "../features/enquire-band";
import { SiteFooter } from "../features/site-footer";
import { GlyphBackdrop } from "../effects/glyph-backdrop";
import { readFxFlags } from "../lib/fx/fx-flags";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { useMediaQuery } from "../lib/viewport/use-media-query";
import { useSmoothScroll } from "../lib/scroll/use-smooth-scroll";

const fx = readFxFlags(window.location.search);

/**
 * Home page composer: the only place features meet. Order and sections follow Figma "Home · 1440 · v4.1" (2026-11-09).
 * Not composed any more, deletion waits for the owner: intro, email-grid, motion-reel, graphics, edit-index, contact,
 * hero, site-nav.
 */
export function Home() {
  const still = useReducedMotion();
  const wide = useMediaQuery("(min-width: 60rem)");
  useSmoothScroll(fx.smooth && !still);
  const pin = fx.camera && !still && wide;
  const footerNav = [...siteContent.nav, siteContent.cta];
  const email = { label: footerContent.emailLabel, href: `mailto:${contactContent.email}` };

  return (
    <>
      <GlyphBackdrop glyphs={statementContent.glyphs} />
      <TopBar content={siteContent} />
      <main id="main">
        <HeroStatement content={statementContent} motion={fx.cycle && !still} />
        <ClientsMarquee content={clientsContent} moving={fx.loops && !still} />
        <ReelGrow content={reelContent} pinned={pin} />
        <SelectedWork content={workContent} pinned={pin} />
        <EmailsOpen content={emailsOpenContent} pinned={pin} />
        <Services content={servicesContent} motion={fx.reveal && !still} />
        <Tools content={toolsContent} />
        <Testimonials content={testimonialsContent} />
        <EnquireBand content={enquireBandContent} motion={fx.sculpture && !still} />
      </main>
      <SiteFooter content={footerContent} nav={footerNav} cta={email} contact={contactContent} />
    </>
  );
}
