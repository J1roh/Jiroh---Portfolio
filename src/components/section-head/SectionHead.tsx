import type { SectionHead as SectionHeadContent } from "@content/index";
import "./section-head.css";

type SectionHeadProps = {
  content: SectionHeadContent;
  id: string;
  className?: string;
  /** display: Figma v4.1 head, 96px title with a small mark (©26) and the line set to the right. */
  size?: "section" | "display";
};

/** A section's head block: the h2 (its id names the section for aria-labelledby) and the one line under it. */
export function SectionHead({ content, id, className = "", size = "section" }: SectionHeadProps) {
  return (
    <div className={`section-head section-head--${size} ${className}`}>
      <h2 id={id} className="section-head__title">
        {content.head}
        {content.mark && <sup className="section-head__mark">{content.mark}</sup>}
      </h2>
      {content.line && <p className="section-head__line">{content.line}</p>}
    </div>
  );
}
