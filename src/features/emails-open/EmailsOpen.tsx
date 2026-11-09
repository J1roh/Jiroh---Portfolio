import { useRef, useState } from "react";
import { useMotionValueEvent } from "motion/react";
import type { EmailsOpenContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import { usePinProgress } from "../../lib/scroll/use-pin-progress";
import { Notification } from "./Notification";
import "./emails-open.css";

type EmailsOpenProps = { content: EmailsOpenContent; pinned: boolean };

/**
 * Emails people open (Figma "Emails · From notification to open"): one email's life on a 3D phone. The section pins
 * and scroll walks the phone through arrives → opens → reading → the last line. Unpinned: the reading state.
 */
export function EmailsOpen({ content, pinned }: EmailsOpenProps) {
  const ref = useRef<HTMLElement>(null);
  const progress = usePinProgress(ref);
  const states = content.phone.states;
  const [step, setStep] = useState(pinned ? 0 : 2);
  useMotionValueEvent(progress, "change", (p) => {
    if (pinned) setStep(Math.min(states.length - 1, Math.floor(p * states.length)));
  });
  const email = content.items[0];

  return (
    <section ref={ref} id="emails" className="emails" data-pinned={pinned} aria-labelledby="emails-title">
      <div className="emails__stage container">
        <div className="emails__intro">
          <SectionHead id="emails-title" content={content} />
          <Notification content={content} email={email} />
        </div>
        <figure className="emails__phone">
          <span className="emails__spot" aria-hidden="true" />
          {states.map((src, i) => (
            <img
              key={src} className="emails__state" src={src} data-on={i === step} loading="lazy" decoding="async"
              alt={i === step ? content.phone.label : ""} aria-hidden={i !== step || undefined}
            />
          ))}
        </figure>
        <div className="emails__info">
          <p className="emails__count">01 / {String(content.items.length).padStart(2, "0")}</p>
          <h3 className="emails__brand">{email.brand}</h3>
          <p className="emails__subject">{email.subject}</p>
          <p className="emails__type">{email.type}</p>
          <p className="emails__step" aria-live="polite">{String(step + 1).padStart(2, "0")} · {content.steps[step]}</p>
          <a className="emails__open" href={email.image.src} target="_blank" rel="noreferrer">{content.open} ↗</a>
        </div>
      </div>
    </section>
  );
}
