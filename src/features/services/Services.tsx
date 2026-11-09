import { useState } from "react";
import type { ServicesContent } from "@content/index";
import { TimeScramble } from "../../animations/time-scramble";
import { SectionHead } from "../../components/section-head";
import "./services.css";

type ServicesProps = { content: ServicesContent; motion: boolean };

/**
 * What I make (Figma "Services"): six crafts as big rows, one line each. Pointing at or focusing a row scrambles its
 * title once (Figma storyboard 07b) and shows that craft's work beside it.
 */
export function Services({ content, motion }: ServicesProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const enter = (i: number) => { setHover(i); setPlays((p) => p + 1); };
  const shown = hover === null ? null : content.items[hover].image;

  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="container">
        <SectionHead id="services-title" content={content} size="display" />
        <div className="services__body">
          <ul className="services__list" onPointerLeave={() => setHover(null)}>
            {content.items.map((row, i) => (
              <li
                key={row.title} className="services__row" data-on={hover === i} tabIndex={0}
                onPointerEnter={() => enter(i)} onFocus={() => enter(i)} onBlur={() => setHover(null)}
              >
                <h3 className="services__title">
                  <TimeScramble text={row.title} glyphs={content.glyphs} play={hover === i ? plays : -1} enabled={motion && hover === i} />
                </h3>
                <p className="services__line">{row.body}</p>
              </li>
            ))}
          </ul>
          {shown && (
            <figure className="services__peek frame" style={{ top: `${(hover ?? 0) * (100 / content.items.length)}%` }}>
              <img src={shown.src} alt={shown.label} />
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
