import type { ContactContent } from "@content/index";
import "./contact.css";

/** The close: the ask set large, the address, and the short list of what Jiroh makes. */
export function Contact({ content }: { content: ContactContent }) {
  return (
    <section id="contact" className="section section--l contact" aria-labelledby="contact-title">
      <div className="container grid-12 contact__grid">
        <div className="contact__ask">
          <h2 id="contact-title" className="contact__title">{content.head}</h2>
          <p className="contact__line">{content.line}</p>
          <p className="contact__address">
            <a className="contact__email" href={`mailto:${content.email}`}>{content.email}</a>
          </p>
        </div>
        <div className="contact__services">
          <h3 className="contact__label">{content.servicesLabel}</h3>
          <ul className="contact__list">
            {content.services.map((service) => <li key={service}>{service}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}
