import { readFxFlags } from "./fx-flags";

/** The page's fx switches, read once from the URL at load (see fx-flags.ts for the syntax). */
export const fx = readFxFlags(window.location.search);
