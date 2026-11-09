import type { CatalogueContent, WorkMedia } from "@content/index";
import { LoopVideo } from "../../components/loop-video";

type WorkMediaViewProps = { media: WorkMedia; labels: CatalogueContent["detail"]; motion: boolean };

/** Tall pieces (emails) run at their own 600px design width on a sheet; wide ones fill the column; clips loop. */
export function WorkMediaView({ media, labels, motion }: WorkMediaViewProps) {
  if (media.kind === "video") {
    return (
      <figure className="work-detail__wide frame">
        <LoopVideo
          src={media.src} poster={media.poster ?? ""} label={media.label}
          labels={{ pause: labels.pause, play: labels.play }} enabled={motion}
        />
      </figure>
    );
  }
  const tall = media.aspect > 1.5;
  return (
    <figure className={tall ? "work-detail__sheet frame" : "work-detail__wide frame"}>
      <img src={media.src} alt={media.label} loading="lazy" decoding="async" width={tall ? 600 : 1312} height={Math.round((tall ? 600 : 1312) * media.aspect)} />
    </figure>
  );
}
