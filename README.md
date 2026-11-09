# Jiroh — Portfolio

Portfolio for Jiroh: websites, launch emails and games, plus graphic design and video.

```
npm install
npm run dev       # http://localhost:5173  (add ?fx=none, ?fx=-magnetic, ... to compare animations)
npm run build
npm run lint
```

Start with `AGENTS.md`.

## Status
Hero section built from Figma `Hero v3 — Large H1` (v2 layout, 96 px hook, no ticker). Everything below it is a placeholder. See `TASKS.md`.

## Decision log
| # | Date | Decision |
|---|---|---|
| D1 | 2026-10-30 | Stack: React + Vite + TypeScript (owner choice). Rules adapted from `Robert - Portfolio`, with separate effects and animations layers. |
| D2 | 2026-10-30 | ~~`three` for WebGL backdrop~~ Removed same day: owner wants a plain black background, matching Figma. |
| D3 | 2026-10-30 | `motion` for UI animation and as the single frame loop (`frame`), per the Robert rule "consult motion.dev first". |
| D4 | 2026-10-30 | `lenis` for smooth scroll, as on alche.studio and The Content Architecture. |
| D5 | 2026-10-30 | Fonts: Geist and Geist Mono via `@fontsource-variable/*` (self-hosted, no Google Fonts request). |
| D6 | 2026-10-30 | `oxlint` for linting, as in Robert - Portfolio. |
| D8 | 2026-11-09 | `react-router` for the v1 pages (Home, Work, Work detail, Enquire, 404): data-free library mode, `createBrowserRouter`. |
| D9 | 2026-11-09 | `@supabase/supabase-js` for the enquiry form (submits through the `submit-enquiry` edge function); without env keys the form falls back to mailto. |
| D7 | 2026-10-30 | Palette and layout v2 (owner): navy and white, Content Architecture split with an ASCII logo; electric blue and arcade retired. The ASCII sculpture uses Canvas 2D with a glyph atlas, so no new dependency. |
