import { brandMark, heroContent, siteContent } from "@content/index";
import { SiteNav } from "../features/site-nav";
import { Hero } from "../features/hero";
import { readFxFlags } from "../lib/fx/fx-flags";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { useSmoothScroll } from "../lib/scroll/use-smooth-scroll";

const fx = readFxFlags(window.location.search);

/** Home page composer: the only place features meet. */
export function Home() {
  const still = useReducedMotion();
  useSmoothScroll(fx.smooth && !still);

  return (
    <>
      <SiteNav
        content={siteContent}
        fx={{ magnetic: fx.magnetic && !still, autoHide: false }}
      />
      <main id="main">
        <Hero
          content={heroContent}
          mark={brandMark}
          fx={{ reveal: fx.reveal, camera: fx.camera, sculpture: fx.sculpture, still }}
        />
      </main>
    </>
  );
}
