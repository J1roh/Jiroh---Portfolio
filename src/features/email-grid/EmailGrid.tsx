import type { EmailsContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import "./email-grid.css";

/** Four emails side by side, each cropped to its top and linked to the full-length file. */
export function EmailGrid({ content }: { content: EmailsContent }) {
  return (
    <section id="emails" className="section email-grid" aria-labelledby="emails-title">
      <div className="container">
        <SectionHead id="emails-title" content={content} />
        <ul className="email-grid__list">
          {content.items.map((item) => (
            <li key={item.title}>
              <a className="email-grid__link" href={item.image.src} target="_blank" rel="noopener">
                <figure className="email-grid__frame frame">
                  <img src={item.image.src} alt={item.image.label} width={600} height={Math.round(600 * item.image.aspect)} loading="lazy" />
                </figure>
                <span className="caption">
                  <strong>{item.title}</strong>
                  {content.openLabel}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
