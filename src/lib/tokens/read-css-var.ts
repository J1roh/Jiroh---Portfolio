/** A custom property from :root (tokens/*.css). Throws if the token is missing. */
export function readCssVar(name: `--${string}`): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!value) throw new Error(`read-css-var: ${name} is not defined in tokens`);
  return value;
}
