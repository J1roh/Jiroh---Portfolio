import "./marquee.css";

type MarqueeProps = {
  text: string;
  className?: string;
  /** Off: the text sits still. */
  enabled: boolean;
};

/** One line of text scrolling sideways forever (after Content Architecture's announcement strip). */
export function Marquee({ text, className, enabled }: MarqueeProps) {
  return (
    <div className={["marquee", className].filter(Boolean).join(" ")} data-moving={enabled}>
      <p className="visually-hidden">{text}</p>
      <div className="marquee__track" aria-hidden="true">
        <span className="marquee__copy">{text}</span>
        <span className="marquee__copy">{text}</span>
      </div>
    </div>
  );
}
