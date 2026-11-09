import {
  clientsContent, emailsOpenContent, enquireBandContent, pagesContent, reelContent, servicesContent, statementContent,
  testimonialsContent, toolsContent, workContent,
} from "@content/index";
import { HeroStatement } from "../features/hero-statement";
import { ClientsMarquee } from "../features/clients-marquee";
import { ReelGrow } from "../features/reel-grow";
import { SelectedWork } from "../features/selected-work";
import { EmailsOpen } from "../features/emails-open";
import { Services } from "../features/services";
import { Tools } from "../features/tools";
import { Testimonials } from "../features/testimonials";
import { EnquireBand } from "../features/enquire-band";
import { PageMeta } from "../components/page-meta";
import { fx } from "../lib/fx/fx";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { useMediaQuery } from "../lib/viewport/use-media-query";

/**
 * Home page composer: the only place Home's features meet. Order follows Figma "Home · 1440 · v4.1" (2026-11-09).
 * Not composed any more, deletion waits for the owner: intro, email-grid, motion-reel, graphics, edit-index, contact,
 * hero, site-nav.
 */
export function Home() {
  const still = useReducedMotion();
  const wide = useMediaQuery("(min-width: 60rem)");
  const pin = fx.camera && !still && wide;

  return (
    <>
      <PageMeta meta={pagesContent.meta.home} />
      <HeroStatement content={statementContent} motion={fx.cycle && !still} />
      <ClientsMarquee content={clientsContent} moving={fx.loops && !still} />
      <ReelGrow content={reelContent} pinned={pin} />
      <SelectedWork content={workContent} pinned={pin} />
      <EmailsOpen content={emailsOpenContent} pinned={pin} />
      <Services content={servicesContent} motion={fx.reveal && !still} />
      <Tools content={toolsContent} />
      <Testimonials content={testimonialsContent} />
      <EnquireBand content={enquireBandContent} motion={fx.sculpture && !still} />
    </>
  );
}
