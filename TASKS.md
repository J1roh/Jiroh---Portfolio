# TASKS.md

## Done
- [x] Project setup: Vite, React, TypeScript, oxlint, tokens, docs
- [x] Hero v1 (glass, black), superseded by v2 on 2026-10-30
- [x] Hero v2 from Figma "Hero v2 — Split ASCII (navy)": navy palette, nav pill with ticker and minimap, left copy with staggered services, ASCII logo sculpture (hover hole, click ripple, entrance, twinkle)
- [x] `?fx=` switches; reduced motion gives a still page
- [x] Hero v3 (2026-10-30): 96 px hook, ticker removed, logo tilts in 3D on hover, wakes only on drag, click ripple off for now
- [x] Logo spin (2026-10-31): zero-gravity quaternion spin with homing; rendered after the Blender model (depth, light, bevel). Now still: the logo stays flat (`LOGO_MOTION = "still"` in `logo-motion.ts`; "turn" for the 360°, "look" and "flick" kept). Owner: tune `MAX_YAW`, `MAX_PITCH`, `REACH`, `SMOOTH_S` in `look-at.ts`; optionally copy `Other/Blender/flag_mark_clean.obj` into `content/3d/` as the source of truth

- [x] Footer: index ledger (Figma "2 · Index ledger · 1440", picked from 3 concepts in "Footer concepts (for review)", 2026-11-09)

- [x] Hero G (2026-11-09): `features/hero-statement` replaces `intro` on Home; Figma "Hero · big type + craft list (G)"

- [x] v1 pages (2026-11-09): router; /work (by craft, ?craft= filter), /work/:slug, /enquire (form; Supabase or mailto fallback), 404; per-page titles; OG image, robots, sitemap, favicon, vercel.json

## Next
- [ ] Owner: create the Supabase project and follow `supabase/README.md` (until then the form opens the visitor's mail app)
- [ ] Owner: import github.com/J1roh/Jiroh---Portfolio in Vercel (framework Vite, branch section-transitions or merge to main), then point jiroh.works at it once the current site is down
- [ ] Owner: per-piece briefs, years and roles for /work/:slug (left out until given)
- [ ] 404 page is plain (not in Figma yet)
- [ ] Mobile nav shows only Enquire (Work, Services hidden under 60rem): design a menu or accept
- [ ] Owner: hero words per craft are assumed (emails, ads, animations, videos, websites, games); confirm in `content/work.json` → `statement`
- [ ] Owner: Web backdrop for the hero (none yet, shows the plain canvas); Video uses the CS Colloquium still for now
- [x] Home rebuilt to Figma v4.1 (2026-11-09): nav, clients marquee, reel grow, Selected work track, Emails A v3, Services, Tools, Testimonials (hidden until real quotes), Enquire band D, footer ledger, glyph backdrop
- [ ] Owner: delete the uncomposed old features? (intro, email-grid, motion-reel, graphics, edit-index, contact)
- [ ] Owner: About is out of the nav until you decide: a page, a Home section, or drop it
- [ ] Owner: the 2026 showreel video; CS 180 "1 day to go" stands in
- [ ] Owner: subject lines for Uniworld, Dispatch, Garnier emails (only Salt Lab's is shown)
- [ ] Owner: real testimonials (section hidden while `testimonials.items` is empty in content/home.json)
- [x] 2026-11-07 rebuild (Hallmark): new page from the Drive work; sloplint 0 FAIL
- [ ] Owner: approve deleting the unused ASCII hero stack (`features/hero`, `features/site-nav`, `effects/*`, `animations/*`, `content/hero.json`, `content/3d/`); none of them is composed any more
- [x] Contact email: contact@jiroh.works (nav, hero and contact close, 2026-11-07)
- [ ] Owner: web and game dev work to show (repos, URLs or screenshots); listed as services only
- [ ] Figma v4.1 (2026-11-08): Selected work tiles are now Garnier email campaigns, Reels and video edits, Launch creative, Game development, Web development (+ "Games" filter chip). Web and Game tiles and the case study frames "Case study · Website 01/02 · 1440" use grey placeholders: owner to send site names, URLs, stacks and screenshots, and game screenshots
- [ ] Owner: confirm copy in `content/work.json` (hook, section lines, Nike piece labelled a concept)
- [ ] Owner review of the experiments: keep, tune or drop each one
- [ ] CMS: testimonials section setting to switch layout between Concept A (spotlight, words fill on scroll) and Concept B (wall, two drifting rows); Figma frames "Statement · Concept A/B" in Site v4.1. Home uses A for now (2026-11-09). Needs real client quotes, names, roles and photos; Figma copy is placeholder
- [ ] Check on a real phone (touch skips hover; the logo sits below the copy under 860 px)

## Needs owner
- Footer "Elsewhere" links (socials/profiles): `footer.elsewhere` in `content/work.json`; the column stays hidden while empty
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
