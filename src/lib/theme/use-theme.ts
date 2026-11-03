import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** Where a visitor's own choice is remembered; without one the theme follows the system. */
const STORAGE_KEY = "theme";
const SYSTEM_LIGHT = "(prefers-color-scheme: light)";
const root = () => document.documentElement;

/** The theme on <html>, which index.html sets before first paint so the page never flashes the wrong one. */
const read = (): Theme => (root().dataset.theme === "light" ? "light" : "dark");

function apply(theme: Theme) {
  root().dataset.theme = theme;
  // The browser's own UI (mobile address bar) follows the page background.
  const background = getComputedStyle(root()).getPropertyValue("--color-bg").trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
}

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Re-renders when the theme on <html> changes, from any caller. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/**
 * The current theme and a toggle. It follows the system setting until the visitor picks one, which is
 * then remembered on this device. Every caller sees the same theme, since it lives on <html>.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);

  useEffect(() => {
    const system = matchMedia(SYSTEM_LIGHT);
    const follow = () => { if (!stored()) apply(system.matches ? "light" : "dark"); };
    system.addEventListener("change", follow);
    return () => system.removeEventListener("change", follow);
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = read() === "light" ? "dark" : "light";
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode: the choice lasts this visit only */ }
    apply(next);
  }, []);

  return { theme, toggle };
}
