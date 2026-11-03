# ARCHITECTURE.md

React + Vite + TypeScript, static output. Dependencies only flow downward.

## Layers

| Layer | Folder | Owns | May import |
|---|---|---|---|
| L0 Foundation | `src/tokens/` | Design tokens, reset, base element styles | — |
| L1 Shared | `src/lib/<purpose>/` | Pure helpers and hooks (math, motion, scroll, tokens, theme, fx flags) | L0 |
| L2 Effect | `src/effects/<effect>/` | One visual effect | L1 |
| L2 Animation | `src/animations/<animation>/` | One reusable motion behaviour | L1 |
| L2 Component | `src/components/<component>/` | One UI part with no content knowledge | L1 |
| L3 Feature | `src/features/<feature>/` | One page section; composes L2 modules | L2, L1, content types |
| L4 Page | `src/pages/` | Loads content, reads fx flags, composes features in order | L3, L1, content |
| Content | `content/` | Copy, links, and their types | — |

L2 modules never import each other. If two need the same thing, it moves to L1.
Features never import each other. Only pages compose features.

## Module folder shape
```
<module>/
  Name.tsx | create-name.ts   implementation
  name.css                    styles (tokens only)
  index.ts                    the public API; import only from here
```

## Experiment switches
`?fx=` on the URL (parsed in `lib/fx/fx-flags.ts`, read once by the page):
`?fx=none`, `?fx=reveal,smooth`, `?fx=-magnetic`. Names: reveal, magnetic, camera, smooth, sculpture.
