import type { SiteContent } from "@content/index";
import { Button } from "../../components/button";
import { SmartLink } from "../../components/smart-link";
import { ThemeToggle } from "../../components/theme-toggle";
import { useTheme } from "../../lib/theme/use-theme";
import "./top-bar.css";

/** The edge-aligned bar: wordmark home, the section links, the theme toggle and the one action. */
export function TopBar({ content }: { content: SiteContent }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="top-bar">
      <div className="container top-bar__row">
        <SmartLink className="top-bar__brand" href="/" aria-label={`${content.brand}, home`}>{content.brand}</SmartLink>
        <nav className="top-bar__nav" aria-label="Main">
          <ul className="top-bar__links">
            {content.nav.map((link) => (
              <li key={link.href}><SmartLink className="top-bar__link" href={link.href}>{link.label}</SmartLink></li>
            ))}
          </ul>
          <ThemeToggle theme={theme} onToggle={toggle} labels={content.theme} />
          <Button href={content.cta.href} arrow>{content.cta.label}</Button>
        </nav>
      </div>
    </header>
  );
}
