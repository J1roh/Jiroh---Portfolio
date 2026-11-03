# TASKS.md

## Done
- [x] Project setup: Vite, React, TypeScript, oxlint, tokens, docs
- [x] Hero v1 (glass, black), superseded by v2 on 2026-10-30
- [x] Hero v2 from Figma "Hero v2 — Split ASCII (navy)": navy palette, nav pill with ticker and minimap, left copy with staggered services, ASCII logo sculpture (hover hole, click ripple, entrance, twinkle)
- [x] `?fx=` switches; reduced motion gives a still page
- [x] Hero v3 (2026-10-30): 96 px hook, ticker removed, logo tilts in 3D on hover, wakes only on drag, click ripple off for now
- [x] Logo spin (2026-10-31): zero-gravity quaternion spin with homing; rendered after the Blender model (depth, light, bevel). Now still: the logo stays flat (`LOGO_MOTION = "still"` in `logo-motion.ts`; "turn" for the 360°, "look" and "flick" kept). Owner: tune `MAX_YAW`, `MAX_PITCH`, `REACH`, `SMOOTH_S` in `look-at.ts`; optionally copy `Other/Blender/flag_mark_clean.obj` into `content/3d/` as the source of truth

## Next
- [ ] Owner review of the experiments: keep, tune or drop each one
- [ ] Check on a real phone (touch skips hover; the logo sits below the copy under 860 px)
- [ ] Design and build the next sections: Work, Services, About, Contact (nav links point to them already)

## Needs owner
- Contact destination for "Start a project" (links to `#contact`, which doesn't exist yet)
- Bring the click ripple back, or drop it? (`CLICK_RIPPLE` in `create-sculpture.ts`)
- Delete `src/animations/marquee/` (unused since the ticker went; left in place)
- Bring the logo-tilt wake back, or drop it? (`LOGO_WAKE` in `create-sculpture.ts`; code kept in `logo-wake.ts`)
- Bring the mouse-trail wake and its cursor chip back, or drop them? (`POINTER_WAKE` in `create-sculpture.ts`; `cursorLabel` in `content/hero.json`)
- Bring the service rail (cards, hint, retype on hover) back, or drop it? (`SERVICE_RAIL` in `src/features/hero/Hero.tsx`)
- Bring the logo-shaped water ripple back, or drop it? (`LOGO_PULSE` in `logo-pulse.ts`)
- Light mode (2026-10-31) is the kit inverted and not in Figma yet: add a light Website Kit to the Moodboard, or confirm the values in DESIGN.md.
- [x] Scroll minimap removed entirely (owner, 2026-10-31): nav panel, `minimap` fx flag and `src/animations/scroll-minimap/`
- [x] Hero camera pull-back on scroll (2026-10-31); placeholder section and `exit-parallax` removed
- "Selected work ↓" still links to `#work`, which no longer exists: point it somewhere, or hide it until the Work section is built
- [x] Hero scroll sequence (2026-10-31): move (copy out as the logo centres) → small zoom-out drop → scrubbed page-load ripple; parallax removed (it broke the ASCII grid)
- [x] Final part of the transition (2026-10-31): Alche-style grid mask rises, ASCII logo turns to line art, intro copy reveals; pin now five screens
- [x] Closing mask copy (2026-11-03): the wireframe's About copy types itself in on the flat grid mask with the outline logo. The Glyph tide was built and dropped the same day (owner: flat edge, outline logo)
- Copy on the closing mask is the wireframe's About copy (`content/hero.json` → `transition`), written by the assistant: owner to confirm or rewrite
- The About facts (Based in, Building since, Tools, Clients) are TBD and not on the site yet
- [x] Rest of the Alche spec (owner approved, 2026-10-31): cylinder warp at rest, ghost "JIROH" wordmark tiles, row scramble at the mask edge
- Light mode mask is the kit inverted (navy panel), not in Figma
