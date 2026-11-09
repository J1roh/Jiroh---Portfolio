import type { ContactContent, FooterContent, Link } from "@content/index";
import "./site-footer.css";

type Column = { label: string; links: Link[] };
type Props = { content: FooterContent; nav: Link[]; cta: Link; contact: ContactContent };

/** The index ledger (Figma component "Footer · Index ledger"): the address set large over numbered columns of links. */
export function SiteFooter({ content, nav, cta, contact }: Props) {
  const mailto = `mailto:${contact.email}`;
  const columns: Column[] = [
    { label: content.sectionsLabel, links: nav },
    { label: content.contactLabel, links: [cta] },
    { label: content.elsewhereLabel, links: content.elsewhere },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <a className="site-footer__email" href={mailto}>
          {contact.email}<span className="site-footer__arrow" aria-hidden="true">↗</span>
        </a>
        <div className="site-footer__ledger">
          {columns.filter((column) => column.links.length > 0).map((column, i) => {
            return (
              <section key={column.label} className="site-footer__col" aria-label={column.label}>
                <h2 className="site-footer__label">{String(i + 1).padStart(3, "0")} / {column.label}</h2>
                <ul className="site-footer__list">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}><a className="site-footer__link" href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <div className="site-footer__base">
          <p className="site-footer__mark">{content.wordmark}</p>
          <p className="site-footer__note">{content.note}</p>
          <a className="site-footer__top" href="#">{content.toTop}<span aria-hidden="true">↑</span></a>
        </div>
      </div>
    </footer>
  );
}
