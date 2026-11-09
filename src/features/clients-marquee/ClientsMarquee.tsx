import type { ClientsContent } from "@content/index";
import "./clients-marquee.css";

type ClientsMarqueeProps = { content: ClientsContent; moving: boolean };

/** Client names in one huge row that loops left and pauses on hover; agency work keeps its "via Medialuv." credit. */
export function ClientsMarquee({ content, moving }: ClientsMarqueeProps) {
  const row = (hidden: boolean) => (
    <ul className="clients__row" aria-hidden={hidden || undefined}>
      {content.items.map((client) => (
        <li key={client.name} className="clients__item">
          <span className="clients__name">{client.name}</span>
          {client.viaMedialuv && <span className="clients__via">{content.via}</span>}
          <span className="clients__slash" aria-hidden="true">/</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section className="clients" aria-label={content.label} data-moving={moving}>
      <div className="clients__track">{row(false)}{moving && row(true)}</div>
    </section>
  );
}
