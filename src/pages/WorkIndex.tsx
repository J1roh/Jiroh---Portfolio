import { catalogueContent, enquireBandContent, pagesContent } from "@content/index";
import { WorkIndex as WorkIndexSection } from "../features/work-index";
import { EnquireBand } from "../features/enquire-band";
import { PageMeta } from "../components/page-meta";
import { fx } from "../lib/fx/fx";
import { useReducedMotion } from "../lib/motion/use-reduced-motion";

/** /work: every piece by craft, then the enquire band. */
export function WorkIndex() {
  const still = useReducedMotion();
  return (
    <>
      <PageMeta meta={pagesContent.meta.work} />
      <h1 className="visually-hidden">{pagesContent.meta.work.title}</h1>
      <WorkIndexSection content={catalogueContent} />
      <EnquireBand content={enquireBandContent} motion={fx.sculpture && !still} />
    </>
  );
}
