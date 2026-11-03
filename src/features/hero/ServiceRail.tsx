import type { Service } from "@content/index";
import "./service-rail.css";

type ServiceRailProps = {
  services: Service[];
  hint: string;
  active: string | null;
  /** Called with a service's index on hover, and null when the pointer leaves. */
  onPreview: (index: string | null) => void;
};

/**
 * The strip along the bottom of the hero: one column per service. Hovering a column retypes
 * the ASCII logo with that service's phrase and fills its hairline.
 */
export function ServiceRail({ services, hint, active, onPreview }: ServiceRailProps) {
  return (
    <div className="hero__rail" onPointerLeave={() => onPreview(null)}>
      <ul className="hero__rail-list">
        {services.map((service) => (
          <li
            className="hero__rail-item"
            data-active={active === service.index}
            onPointerEnter={(event) => { if (event.pointerType !== "touch") onPreview(service.index); }}
            key={service.index}
          >
            <h2 className="hero__rail-title"><span className="hero__rail-index">{service.index}</span> {service.title}</h2>
            <p className="hero__rail-body">{service.body}</p>
          </li>
        ))}
      </ul>
      <p className="hero__rail-hint" aria-hidden="true">{hint}</p>
    </div>
  );
}
