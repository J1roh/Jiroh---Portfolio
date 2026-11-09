import { Outlet } from "react-router";
import { contactContent, footerContent, siteContent, statementContent } from "@content/index";
import { TopBar } from "../features/top-bar";
import { SiteFooter } from "../features/site-footer";
import { GlyphBackdrop } from "../effects/glyph-backdrop";
import { fx } from "../lib/fx/fx";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { useRouteScroll } from "../lib/router/use-route-scroll";
import { useSmoothScroll } from "../lib/scroll/use-smooth-scroll";

/** The frame every page shares: glyph backdrop, top bar, the page, the footer; smooth scroll and scroll on route change. */
export function Layout() {
  const still = useReducedMotion();
  useSmoothScroll(fx.smooth && !still);
  useRouteScroll();
  const footerNav = [...siteContent.nav, siteContent.cta];
  const email = { label: footerContent.emailLabel, href: `mailto:${contactContent.email}` };

  return (
    <>
      <GlyphBackdrop glyphs={statementContent.glyphs} />
      <TopBar content={siteContent} />
      <main id="main"><Outlet /></main>
      <SiteFooter content={footerContent} nav={footerNav} cta={email} contact={contactContent} />
    </>
  );
}
