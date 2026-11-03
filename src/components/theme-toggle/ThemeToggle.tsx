import "./theme-toggle.css";

type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
  /** Accessible names, from content: what pressing it does in each theme. */
  labels: { toLight: string; toDark: string };
};

/** A small icon button that flips light and dark: a sun shows in dark (go light), a moon in light (go dark). */
export function ThemeToggle({ theme, onToggle, labels }: ThemeToggleProps) {
  const light = theme === "light";
  return (
    <button type="button" className="theme-toggle" onClick={onToggle} aria-label={light ? labels.toDark : labels.toLight}>
      <svg className="theme-toggle__icon" viewBox="0 0 16 16" aria-hidden="true">
        {light ? (
          <path d="M13.5 9.8A5.8 5.8 0 0 1 6.2 2.5a5.8 5.8 0 1 0 7.3 7.3Z" />
        ) : (
          <>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" />
          </>
        )}
      </svg>
    </button>
  );
}
