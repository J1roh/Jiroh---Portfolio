import { useSearchParams } from "react-router";
import { coverOf, type CatalogueContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import { SmartLink } from "../../components/smart-link";
import "./work-index.css";

/**
 * Every piece by craft (Figma "Work index"): one row per craft that scrolls sideways, each with "View all"; the craft
 * chips (and `?craft=`) narrow the page to one craft shown as a grid.
 */
export function WorkIndex({ content }: { content: CatalogueContent }) {
  const [params] = useSearchParams();
  const crafts = Object.keys(content.index.crafts);
  const chosen = crafts.find((c) => c === params.get("craft")) ?? null;
  const shown = chosen ? [chosen] : crafts;
  const link = (craft: string | null) => (craft ? `/work?craft=${encodeURIComponent(craft)}` : "/work");

  return (
    <section className="section work-index" aria-labelledby="work-index-title">
      <div className="container">
        <div className="work-index__head">
          <SectionHead id="work-index-title" content={content.index} size="display" />
          <nav aria-label={content.index.filtersLabel}>
            <ul className="work-index__chips">
              {[null, ...crafts].map((c) => (
                <li key={c ?? "all"}>
                  <SmartLink className="chip" href={link(c)} aria-current={chosen === c ? "page" : undefined}>{c ?? content.index.all}</SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {shown.map((craft) => {
          const items = content.items.filter((item) => item.craft === craft);
          if (items.length === 0) return null;
          return (
            <section key={craft} className="work-index__craft" aria-labelledby={`craft-${craft}`}>
              <div className="work-index__craft-head">
                <h2 id={`craft-${craft}`} className="work-index__craft-title">{craft}<sup>{String(items.length).padStart(2, "0")}</sup></h2>
                <p className="work-index__craft-line">{content.index.crafts[craft]}</p>
                {!chosen && <SmartLink className="work-index__all" href={link(craft)}>{content.index.viewAll} ↗</SmartLink>}
              </div>
              <ul className="work-index__tiles" data-grid={chosen !== null}>
                {items.map((item) => {
                  const cover = coverOf(item);
                  return (
                    <li key={item.slug} className="work-index__tile">
                      <SmartLink href={`/work/${item.slug}`} className="work-index__link">
                        <span className="work-index__image frame"><img src={cover.src} alt={cover.label} loading="lazy" decoding="async" /></span>
                        <strong className="work-index__title">{item.title}</strong>
                        {(item.client || item.sub) && (
                          <span className="work-index__sub">
                            {item.client ?? item.sub}{item.viaMedialuv ? `, ${content.detail.viaMedialuv}` : ""}
                          </span>
                        )}
                      </SmartLink>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
