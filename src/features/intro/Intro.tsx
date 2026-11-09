import type { IntroContent } from "@content/index";
import { Button } from "../../components/button";
import "./intro.css";

/** The first screen: the hook, one line, two actions, and a real email on its sheet. */
export function Intro({ content }: { content: IntroContent }) {
  const { visual } = content;
  return (
    <section className="intro" aria-labelledby="intro-title">
      <div className="container intro__grid">
        <div className="intro__text">
          <h1 id="intro-title" className="intro__title">{content.head}</h1>
          <p className="intro__line">{content.line}</p>
          <div className="intro__actions">
            <Button href={content.primary.href}>{content.primary.label}</Button>
            <Button href={content.secondary.href} variant="quiet">{content.secondary.label}</Button>
          </div>
        </div>
        <figure className="intro__sheet frame" data-slot="hero" data-kind="product" data-alt="An email you designed, shown at its native width">
          <img
            src={visual.src}
            alt={visual.label}
            width={600}
            height={Math.round(600 * visual.aspect)}
            fetchPriority="high"
          />
        </figure>
      </div>
    </section>
  );
}
