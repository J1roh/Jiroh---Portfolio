import { useRef, useState } from "react";
import { useMotionValueEvent } from "motion/react";
import type { EmailsOpenContent } from "@content/index";
import { usePinProgress } from "../../lib/scroll/use-pin-progress";
import { Notification } from "./Notification";
import "./emails-open.css";
import "./notification.css";

type EmailsOpenProps = { content: EmailsOpenContent; pinned: boolean };

/** The phone's resting state (Figma frame shows it reading). */
const REST = 2;

/**
 * Emails people open (Figma "Emails · From notification to open", 1440 × 1040): head and the notification stack left,
 * the 3D phone large in the middle, the email's details and step bars right. Pinned, scroll walks the phone through
 * arrives → opens → reading → the last line; unpinned it rests on reading.
 */
export function EmailsOpen({ content, pinned }: EmailsOpenProps) {
  const ref = useRef<HTMLElement>(null);
  const progress = usePinProgress(ref);
  const states = content.phone.states;
  const [step, setStep] = useState(pinned ? 0 : REST);
  useMotionValueEvent(progress, "change", (p) => {
    if (pinned) setStep(Math.min(states.length - 1, Math.floor(p * states.length)));
  });
  const email = content.items[0];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section ref={ref} id="emails" className="emails" data-pinned={pinned} aria-labelledby="emails-title">
      <div className="emails__stage">
        <figure className="emails__phone">
          {states.map((src, i) => (
            <img
              key={src} className="emails__state" src={src} data-on={i === step} decoding="async"
              loading={i === REST ? "eager" : "lazy"} width={1000} height={1100}
              alt={i === step ? content.phone.label : ""} aria-hidden={i !== step || undefined}
            />
          ))}
        </figure>
        <div className="container emails__grid">
          <div className="emails__intro">
            <h2 id="emails-title" className="emails__title">{content.head}</h2>
            <p className="emails__line">{content.line}</p>
            <Notification content={content} email={email} />
          </div>
          <div className="emails__info">
            <p className="emails__count">{pad(1)} / {pad(content.items.length)}</p>
            <div className="emails__detail">
              <ol className="emails__bars" aria-label={content.steps.join(", ")}>
                {content.steps.map((s, i) => <li key={s} data-on={i <= step} aria-current={i === step ? "step" : undefined} />)}
              </ol>
              <div className="emails__text">
                <h3 className="emails__brand">{email.brand}</h3>
                <p className="emails__subject">{email.subject}</p>
                <p className="emails__type">{email.type}</p>
                <p className="emails__step" aria-live="polite">{pad(step + 1)} · {content.steps[step]}</p>
                <a className="emails__open" href={email.image.src} target="_blank" rel="noreferrer">{content.open} ↗</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
