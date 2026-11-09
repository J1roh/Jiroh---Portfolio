import type { EnquireBandContent } from "@content/index";
import { AsciiTypeField } from "../../effects/ascii-type-field";
import { Button } from "../../components/button";
import "./enquire-band.css";

type EnquireBandProps = { content: EnquireBandContent; motion: boolean };

/** The close (Figma "Enquire band · ASCII (Concept D)"): the ask and three steps left, "LET'S TALK" typed in glyphs right. */
export function EnquireBand({ content, motion }: EnquireBandProps) {
  return (
    <section id="enquire" className="enquire-band" aria-labelledby="enquire-title">
      <div className="container enquire-band__grid">
        <div className="enquire-band__text">
          <p className="enquire-band__eyebrow">{content.eyebrow} <span>{content.mark}</span></p>
          <h2 id="enquire-title" className="enquire-band__title">{content.head}</h2>
          <p className="enquire-band__line">{content.line}</p>
          <ol className="enquire-band__steps">
            {content.steps.map((step, i) => (
              <li key={step}><span className="enquire-band__num">{String(i + 1).padStart(2, "0")}</span>{step}</li>
            ))}
          </ol>
          <div><Button href={content.cta.href} arrow>{content.cta.label}</Button></div>
        </div>
        <AsciiTypeField text={content.art} glyphs={content.glyphs} className="enquire-band__art" enabled={motion} />
      </div>
    </section>
  );
}
