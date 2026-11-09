import { pagesContent } from "@content/index";
import { Button } from "../components/button";
import { PageMeta } from "../components/page-meta";
import "./not-found.css";

/** 404: not in Figma yet, so kept plain in the site's type and buttons (TASKS.md). */
export function NotFound() {
  const t = pagesContent.notFound;
  return (
    <section className="container not-found" aria-labelledby="not-found-title">
      <PageMeta meta={pagesContent.meta.notFound} />
      <h1 id="not-found-title" className="not-found__title">{t.head}</h1>
      <p className="not-found__line">{t.line}</p>
      <div className="not-found__actions">
        <Button href={t.home.href} arrow>{t.home.label}</Button>
        <Button href={t.work.href} variant="quiet" arrow>{t.work.label}</Button>
      </div>
    </section>
  );
}
