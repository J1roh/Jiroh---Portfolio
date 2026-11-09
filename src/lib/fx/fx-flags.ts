export const FX_NAMES = ["reveal", "magnetic", "camera", "smooth", "sculpture", "loops"] as const;
export type FxName = (typeof FX_NAMES)[number];
export type FxFlags = Record<FxName, boolean>;

/**
 * Experiment switches from the URL, for comparing effects side by side.
 *   ?fx=none          everything off
 *   ?fx=reveal,smooth only those on
 *   ?fx=-magnetic     everything except magnetic
 */
export function readFxFlags(search: string): FxFlags {
  const raw = new URLSearchParams(search).get("fx");
  const all = (on: boolean) =>
    Object.fromEntries(FX_NAMES.map((name) => [name, on])) as FxFlags;
  if (raw === null || raw === "" || raw === "all") return all(true);
  if (raw === "none") return all(false);

  const parts = raw.split(",").map((part) => part.trim());
  const unknown = parts.map((p) => p.replace(/^-/, "")).filter((p) => !FX_NAMES.includes(p as FxName));
  if (unknown.length) console.warn(`fx-flags: unknown effect(s) ${unknown.join(", ")}`);

  const subtractive = parts.every((part) => part.startsWith("-"));
  const flags = all(subtractive);
  for (const part of parts) {
    const name = part.replace(/^-/, "") as FxName;
    if (FX_NAMES.includes(name)) flags[name] = !part.startsWith("-");
  }
  return flags;
}
