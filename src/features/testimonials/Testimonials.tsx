import { useState } from "react";
import type { TestimonialsContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import "./testimonials.css";

/**
 * Kind words (Figma "Testimonials · Concept A · spotlight"): one quote at a time, counter, name, role, link, arrows.
 * Renders nothing until content has real quotes (owner: TBD). The words-fill-on-scroll motion waits for real copy.
 */
export function Testimonials({ content }: { content: TestimonialsContent }) {
  const [index, setIndex] = useState(0);
  const n = content.items.length;
  if (n === 0) return null;
  const quote = content.items[index];
  const step = (by: number) => setIndex((i) => (i + by + n) % n);

  return (
    <section id="kind-words" className="section testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHead id="testimonials-title" content={content} size="display" />
        <figure className="testimonials__quote" aria-live="polite">
          <p className="testimonials__count">{String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</p>
          <blockquote className="testimonials__text">{quote.quote}</blockquote>
          <figcaption className="testimonials__who">
            <strong>{quote.name}</strong> <span>{quote.role}</span>
            {quote.link && <a href={quote.link.href}>{quote.link.label} →</a>}
          </figcaption>
        </figure>
        {n > 1 && (
          <div className="testimonials__arrows">
            <button type="button" onClick={() => step(-1)} aria-label={content.prev}>←</button>
            <button type="button" onClick={() => step(1)} aria-label={content.next}>→</button>
          </div>
        )}
      </div>
    </section>
  );
}
