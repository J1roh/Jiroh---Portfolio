import { useState } from "react";
import type { SiteContent } from "@content/index";
import { SurfacePanel } from "../../components/surface-panel";
import { Button } from "../../components/button";
import { ThemeToggle } from "../../components/theme-toggle";
import { useTheme } from "../../lib/theme/use-theme";
import { Magnetic } from "../../animations/magnetic";
import { useScrollHide } from "../../animations/scroll-hide";
import "./site-nav.css";

export type SiteNavFx = { magnetic: boolean; autoHide: boolean };

type SiteNavProps = { content: SiteContent; fx: SiteNavFx };

/**
 * The floating nav pill, with the light/dark toggle.
 * Hides on scroll down, returns on scroll up or keyboard focus.
 */
export function SiteNav({ content, fx }: SiteNavProps) {
  const [focused, setFocused] = useState(false);
  const hidden = useScrollHide(fx.autoHide) && !focused;
  const { theme, toggle } = useTheme();

  return (
    <header className="site-nav" data-hidden={hidden} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <div className="site-nav__centre">
        <SurfacePanel as="nav" className="site-nav__pill" label="Main">
          <a className="site-nav__brand" href="#main">{content.brand}</a>
          <ul className="site-nav__links">
            {content.nav.map((link) => (
              <li key={link.href}><a className="site-nav__link" href={link.href}>{link.label}</a></li>
            ))}
          </ul>
          <ThemeToggle theme={theme} onToggle={toggle} labels={content.theme} />
          <Magnetic enabled={fx.magnetic}>
            <Button href={content.cta.href} variant="label">{content.cta.label}</Button>
          </Magnetic>
        </SurfacePanel>
      </div>
    </header>
  );
}
