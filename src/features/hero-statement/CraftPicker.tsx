import type { Craft } from "@content/index";

type CraftPickerProps = {
  crafts: Craft[];
  index: number;
  onPick: (index: number) => void;
  label: string;
  /** list: numbered, top right. tabs: the bottom row with each craft's timer; a visual twin of the list, so hidden from assistive tech. */
  variant: "list" | "tabs";
  /** Restarts the active tab's timer. */
  timerKey: string;
  timed: boolean;
};

/** Choose a craft. The list and the tabs are two views of the same choice. */
export function CraftPicker({ crafts, index, onPick, label, variant, timerKey, timed }: CraftPickerProps) {
  const tabs = variant === "tabs";
  return (
    <ul className={`craft-${variant}`} aria-label={tabs ? undefined : label} aria-hidden={tabs || undefined}>
      {crafts.map((craft, i) => {
        const on = i === index;
        return (
          <li key={craft.label}>
            <button
              type="button" className="craft-pick" aria-pressed={on}
              tabIndex={tabs ? -1 : undefined} onClick={() => onPick(i)}
            >
              {!tabs && <span className="craft-pick__num">{String(i + 1).padStart(2, "0")}</span>}
              {tabs && (
                <span className="craft-pick__track">
                  {on && <span key={timerKey} className="craft-pick__fill" data-timed={timed} />}
                </span>
              )}
              <span className="craft-pick__label">{craft.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
