# CONVENTIONS.md

## Files and names
- Folders and CSS/GLSL files in kebab-case; React components in PascalCase (`SplitReveal.tsx`); factories as `create-<name>.ts`; hooks as `use-<name>.ts`.
- One module per folder; import a module only through its `index.ts`.
- No `utils`, `helpers` or `misc`. Name files for what they do.

## TypeScript / React
- Named exports only. Props are the module's whole input; no reading other modules' DOM or state.
- More than four parameters → an options object.
- Per-frame values (pointer, scroll, time) go through refs or motion values, never React state.
- Throw errors that name the module and the missing thing (`"read-css-var: --x is not defined"`). Don't swallow errors.

## CSS
- Scope rules to the module's own class prefix (BEM-ish: `.hero__title`). Max three levels of nesting, no `!important`.
- Values from tokens only. A value used once inside an effect may be a local custom property at the top of that rule.
- `prefers-reduced-motion` handled in the module that animates.

## Accessibility
- Decorative layers are `aria-hidden`. Split text keeps the full string as `aria-label`.
- Links for navigation, buttons for actions; visible focus on everything interactive.
