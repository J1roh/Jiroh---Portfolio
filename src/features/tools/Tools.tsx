import type { ToolsContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import "./tools.css";

/** Tools (Figma "Tools"): five groups, each with its count and the tools as badge chips. */
export function Tools({ content }: { content: ToolsContent }) {
  return (
    <section id="tools" className="section tools" aria-labelledby="tools-title">
      <div className="container">
        <SectionHead id="tools-title" content={content} size="display" />
        <dl className="tools__groups">
          {content.groups.map((group) => (
            <div key={group.title} className="tools__group">
              <dt className="tools__title">
                {group.title}
                <span className="tools__count">{String(group.tools.length).padStart(2, "0")} {content.unit}</span>
              </dt>
              <dd className="tools__chips">
                {group.tools.map(([badge, name]) => (
                  <span key={name} className="tools__chip">
                    <span className="tools__badge" aria-hidden="true">{badge}</span>{name}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
