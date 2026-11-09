import type { GraphicsContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import "./graphics.css";

/** The head on four columns beside two posters at full strength. */
export function Graphics({ content }: { content: GraphicsContent }) {
  return (
    <section id="graphics" className="section graphics" aria-labelledby="graphics-title">
      <div className="container grid-12 graphics__grid">
        <SectionHead id="graphics-title" content={content} className="graphics__head" />
        {content.items.map((item, i) => (
          <figure key={item.title} className={`graphics__item graphics__item--${i}`}>
            <div className="graphics__frame frame" style={{ aspectRatio: `1 / ${item.image.aspect}` }}>
              <img
                src={item.image.src}
                alt={item.image.label}
                width={1200}
                height={Math.round(1200 * item.image.aspect)}
                loading="lazy"
              />
            </div>
            <figcaption className="caption"><strong>{item.title}</strong>{item.note}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
