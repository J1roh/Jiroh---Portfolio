import type { SectionHead as SectionHeadContent } from "@content/index";
import "./section-head.css";

type SectionHeadProps = { content: SectionHeadContent; id: string; className?: string };

/** A section's head block: the h2 (its id names the section for aria-labelledby) and the one line under it. */
export function SectionHead({ content, id, className = "" }: SectionHeadProps) {
  return (
    <div className={`section-head ${className}`}>
      <h2 id={id} className="section-head__title">{content.head}</h2>
      <p className="section-head__line">{content.line}</p>
    </div>
  );
}
