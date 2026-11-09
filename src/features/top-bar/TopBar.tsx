import type { SiteContent } from "@content/index";
import { Button } from "../../components/button";
import { ThemeToggle } from "../../components/theme-toggle";
import { useTheme } from "../../lib/theme/use-theme";
import "./top-bar.css";

/** The edge-aligned bar: wordmark home, the section links, the theme toggle and the one action. */
export function TopBar({ content }: { content: SiteContent }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="top-bar">
      <div className="container top-bar__row">
        <a className="top-bar__brand" href="#main" aria-label={`${content.brand}, back to top`}>{content.brand}</a>
        <nav className="top-bar__nav" aria-label="Main">
          <ul className="top-bar__links">
            {content.nav.map((link) => (
              <li key={link.href}><a className="top-bar__link" href={link.href}>{link.label}</a></li>
            ))}
          </ul>
          <ThemeToggle theme={theme} onToggle={toggle} labels={content.theme} />
          <Button href={content.cta.href} variant="quiet">{content.cta.label}</Button>
        </nav>
      </div>
    </header>
  );
}
