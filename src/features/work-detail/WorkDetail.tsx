import type { CatalogueContent, WorkItem } from "@content/index";
import { Button } from "../../components/button";
import { SmartLink } from "../../components/smart-link";
import { WorkMediaView } from "./WorkMediaView";
import "./work-detail.css";

type WorkDetailProps = { content: CatalogueContent; item: WorkItem; next: WorkItem; motion: boolean };

/**
 * One piece (Figma "Work detail"): title, client and craft, the work itself at its own proportions, outside links,
 * then the next piece. Brief, year and role stay out until the owner gives them.
 */
export function WorkDetail({ content, item, next, motion }: WorkDetailProps) {
  const t = content.detail;
  return (
    <article className="work-detail" aria-labelledby="work-title">
      <header className="container work-detail__head">
        <SmartLink className="work-detail__eyebrow" href="/work">{t.eyebrow}</SmartLink>
        <h1 id="work-title" className="work-detail__title">{item.title}</h1>
        <dl className="work-detail__meta">
          {item.client && (
            <div><dt>{t.client}</dt><dd>{item.client}{item.viaMedialuv ? `, ${t.viaMedialuv}` : ""}</dd></div>
          )}
          <div><dt>{t.craft}</dt><dd>{item.craft}{item.sub ? ` · ${item.sub}` : ""}</dd></div>
        </dl>
      </header>
      <div className="container work-detail__media">
        {item.media.map((m) => <WorkMediaView key={m.src} media={m} labels={t} motion={motion} />)}
      </div>
      {item.links && item.links.length > 0 && (
        <div className="container work-detail__links">
          <h2 className="work-detail__links-title">{t.links}</h2>
          <ul>
            {item.links.map((l) => <li key={l.href}><Button href={l.href} variant="quiet" arrow external>{l.label}</Button></li>)}
          </ul>
        </div>
      )}
      <SmartLink className="container work-detail__next" href={`/work/${next.slug}`}>
        <span className="work-detail__next-label">{t.next}</span>
        <span className="work-detail__next-title">{next.title} →</span>
      </SmartLink>
    </article>
  );
}
