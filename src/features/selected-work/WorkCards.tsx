import type { Ref } from "react";
import type { WorkCard } from "@content/index";
import { SmartLink } from "../../components/smart-link";

type WorkCardsProps = { ref: Ref<HTMLUListElement>; items: WorkCard[]; craft: string | null };

/** The six cards: image, number, title, client line and craft tag. Cards outside the chosen craft dim. */
export function WorkCards({ ref, items, craft }: WorkCardsProps) {
  return (
    <ul ref={ref} className="work__track">
      {items.map((card, i) => (
        <li key={card.slug} className="work__card" data-dim={craft !== null && card.craft !== craft}>
          <SmartLink className="work__link" href={card.href}>
            <span className="work__image frame">
              <img src={card.image.src} alt={card.image.label} loading="lazy" decoding="async" width={640} height={440} />
            </span>
            <span className="work__meta">
              <span className="work__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="work__text">
                <strong className="work__title">{card.title}</strong>
                <span className="work__sub">{card.sub}</span>
              </span>
              <span className="work__craft">{card.craft}</span>
            </span>
          </SmartLink>
        </li>
      ))}
    </ul>
  );
}
