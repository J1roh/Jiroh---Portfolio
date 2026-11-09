import { useParams } from "react-router";
import { catalogueContent, enquireBandContent, pagesContent } from "@content/index";
import { WorkDetail as WorkDetailArticle } from "../features/work-detail";
import { EnquireBand } from "../features/enquire-band";
import { PageMeta } from "../components/page-meta";
import { fx } from "../lib/fx/fx";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";
import { NotFound } from "./NotFound";

/** /work/:slug: one piece, the next one, then the enquire band. Unknown slugs get the 404. */
export function WorkDetail() {
  const { slug } = useParams();
  const still = useReducedMotion();
  const items = catalogueContent.items;
  const i = items.findIndex((item) => item.slug === slug);
  if (i < 0) return <NotFound />;
  const item = items[i];
  const meta = { title: `${item.title} — ${pagesContent.meta.site}`, description: `${item.title}: ${item.craft}${item.client ? `, ${item.client}` : ""}.` };

  return (
    <>
      <PageMeta meta={meta} />
      <WorkDetailArticle content={catalogueContent} item={item} next={items[(i + 1) % items.length]} motion={fx.loops && !still} />
      <EnquireBand content={enquireBandContent} motion={fx.sculpture && !still} />
    </>
  );
}
