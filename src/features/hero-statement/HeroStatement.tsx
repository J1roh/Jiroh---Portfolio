import { useState, type CSSProperties } from "react";
import type { StatementContent } from "@content/index";
import { TimeScramble } from "../../animations/time-scramble";
import { Button } from "../../components/button";
import { CraftPicker } from "./CraftPicker";
import { useCraftCycle } from "./use-craft-cycle";
import "./hero-statement.css";

/** One craft per 2.4 s (Figma Site v5, storyboard 02). */
const CYCLE_MS = 2400;

type HeroStatementProps = { content: StatementContent; motion: boolean };

/**
 * The first screen (Figma "Hero · big type + craft list (G)"): the craft's work full-bleed, "I make [word] that sell."
 * huge at the bottom left, the craft list top right and the timed tabs along the foot. Pointing at or focusing the
 * controls holds the cycle; reduced motion never cycles on its own.
 */
export function HeroStatement({ content, motion }: HeroStatementProps) {
  const [held, setHeld] = useState(false);
  const running = motion && !held;
  const { index, tick, pick } = useCraftCycle(content.crafts.length, CYCLE_MS, running);
  const craft = content.crafts[index];
  const hold = {
    onPointerEnter: () => setHeld(true), onPointerLeave: () => setHeld(false),
    onFocus: () => setHeld(true), onBlur: () => setHeld(false),
  };
  const picker = { crafts: content.crafts, index, onPick: pick, label: content.listLabel, timerKey: `${tick}-${running}`, timed: running };

  return (
    <section className="statement" aria-labelledby="statement-title" style={{ "--cycle": `${CYCLE_MS}ms` } as CSSProperties}>
      <div className="statement__backdrops" role="img" aria-label={craft.visual?.label || undefined} aria-hidden={!craft.visual || undefined}>
        {content.crafts.map((c, i) => c.visual && (
          <img
            key={c.label} className="statement__backdrop" src={c.visual.src} alt="" data-on={i === index}
            loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"}
          />
        ))}
      </div>
      <div className="statement__scrim" aria-hidden="true" />
      <div className="container statement__inner">
        <div className="statement__list" {...hold}><CraftPicker {...picker} variant="list" /></div>
        <h1 id="statement-title" className="statement__title">
          {content.lead} <TimeScramble text={craft.word} glyphs={content.glyphs} play={index} className="statement__word" enabled={motion} />
          <br />{content.tail}
        </h1>
        <div className="statement__row">
          <p className="statement__line">{content.line}</p>
          <div className="statement__actions">
            <Button href={content.primary.href} arrow>{content.primary.label}</Button>
            <Button href={content.secondary.href} variant="quiet" arrow>{content.secondary.label}</Button>
          </div>
        </div>
        <div className="statement__tabs" {...hold}><CraftPicker {...picker} variant="tabs" /></div>
      </div>
    </section>
  );
}
