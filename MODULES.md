# MODULES.md

Contracts for every module. Add a row here before creating a module.

## L0 Foundation — `src/tokens/`
| File | Responsibility |
|---|---|
| `color.css` | Hero palette: navy canvas, white type, mist paragraphs, steel and field accents |
| `type.css` | Geist / Geist Mono families, fluid type scale, weights, leading, tracking |
| `space.css` | Spacing scale, radii, gutter, nav size, z-index layers |
| `motion.css` | Durations (ms) and easings, readable from CSS and JS |
| `reset.css`, `base.css` | Browser normalisation; document defaults, focus ring, skip link |

## L1 Shared
| Module | Public API | Must not |
|---|---|---|
| `lib/math` | `clamp`, `lerp`, `damp`, `smoothstep` | Touch the DOM |
| `lib/motion` | `useReducedMotion()`, `readDuration(name)`, `readEasing(name)` | Animate anything itself |
| `lib/scroll` | `useSmoothScroll(enabled)` (Lenis on motion's frame loop), `usePinProgress(ref)` (0..1 through a pinned section), `useAutoAdvance(ref, progress, options)` (glides on after a rest; any input cancels; unused for now, the hero's step glide replaced it), `useStepScroll(ref, progress, options)` (one gesture inside a stretch glides to its end; wheel, swipe, scroll keys) | Know about sections |
| `lib/tokens` | `readCssVar(name)` | Define values |
| `lib/viewport` | `useMediaQuery(query)`, `useElementSize(ref, enabled)` | Decide layouts itself |
| `lib/theme` | `useTheme()` → `{ theme, toggle }`: light/dark on `<html>`, follows the system until the visitor picks, remembered on the device | Hold colours (those are tokens) |
| `lib/fx` | `readFxFlags(search)` → `FxFlags` | Read `window` itself |

## L2 Effects — `src/effects/`
| Effect | Public API | Off / reduced motion |
|---|---|---|
| `grid-mask` | `<GridMask rise enabled>children</GridMask>`: light panel rising from the bottom with an arced top, 24 px hairline grid and lagging "+" crosshairs; children stay fixed to the frame | Not rendered |
| `logo-outline` | `<LogoOutline src box stroke />`: the logo's outline traced from its PNG at the box's size, coloured by `--color-mask-ink` via CSS mask | — (static) |
| `ascii-sculpture` | `<AsciiSculpture src label phrase placement cursorLabel enabled />`: the logo typed in mono glyphs over a full phrase field; it can turn in 3D (360° on its own, toward the pointer, or by flick; `LOGO_MOTION`, still for now), moving over the field leaves a water-wake trail; entrance ripple and twinkle | The flat logo and field drawn once, still |

Inside `ascii-sculpture`: `build-grid.ts` (phrase grid, logo tiers and the field under the logo, pure), `glyph-atlas.ts` (pre-rendered glyphs), `paint-base.ts` (the cached resting field), `paint-frame.ts` (repaints only cells the turned logo, wakes, ripples or twinkle change), `twinkle.ts` (twinkling logo cells), `logo-wake.ts` (the tilting logo drops wakes from the edge that dips, pure), `logo-pulse.ts` (logo-shaped water ripple from the outline, pure), `waves.ts` (wake and ripple shapes, pure), `logo-volume.ts` (the logo as an extruded solid: texel mask, depth, bevel distance, pure), `trace-solid.ts` (one ray through the solid, pure), `project-logo.ts` (shades the turned solid into a cell overlay, anti-aliased outline, pure), `mark-material.ts` (the Blender material as Blinn-Phong plus softbox, pure), `logo-motion.ts` (picks how the logo moves: look, flick or turn), `look-at.ts` (turns partway toward the pointer with a SmoothDamp follow, pure), `spin-body.ts` (zero-gravity flick spin with homing, or the 360° turntable, pure), `pointer-input.ts` (hover → flick spin, move → wakes), `create-sculpture-loop.ts` (frame loop, pauses off screen, skips idle frames), `retype-queue.ts` (coalesces phrase swaps: 140 ms intent, one per 700 ms, latest wins), `create-sculpture.ts` (the engine: build, phrase swap, pointer, ripples), `drop-ripple.ts` (the page-load ripple, scroll-scrubbed, from the dropped logo, pure), `sculpture-pointer.ts` (the pointer API: look, flick, trail, click), `cylinder-warp.ts` (bows the finished frame on a vertical cylinder, strip by strip), `row-scramble.ts` (rows scramble as a sweeping edge reaches them), `AsciiSculpture.tsx` (React wrapper, observers; `style`, `scrub`, `warp` and `edge` props).

## L2 Animations — `src/animations/`
| Animation | Public API | Off / reduced motion |
|---|---|---|
| `split-reveal` | `<SplitReveal text as className delay enabled />` | Plain text |
| `magnetic` | `<Magnetic pull enabled>child</Magnetic>` | Child unwrapped |
| `scroll-hide` | `useScrollHide(enabled)` → hidden | Always shown |
| `scroll-camera` | `<ScrollCamera progress focus zoom travel feather enabled />`: the layer shrinks to `zoom` while `focus` glides `travel` of the way to its centre (stack several for parallax; optional edge feather); `cameraCover(size, focus, zoom, travel)` → how far a child layer must reach past each edge to stay full | Plain div |
| `scroll-rise` | `<ScrollRise progress from to rise enabled>`: fades and rises in over a scroll range (power3.out) | Plain div |
| `scroll-scramble` | `<ScrollScramble text progress from to glyphs className enabled />`: characters type in over a scroll range, each scrambling through `glyphs` then locking, staggered from the first (motion.dev `stagger`); reverses with the scroll; screen readers get the plain text | Plain text |
| `scroll-slide` | `<ScrollSlide progress distanceVw until enabled />`: content slides sideways out of frame | Plain div |

## L2 Components — `src/components/`
| Component | Public API |
|---|---|
| `surface-panel` | `<SurfacePanel as className label />`: raised navy panel with a hairline edge |
| `button` | `<Button href variant="solid" \| "label" \| "text" />`: link styled as a button |
| `theme-toggle` | `<ThemeToggle theme onToggle labels />`: sun/moon icon button that flips light and dark |
| `section-head` | `<SectionHead content id className />`: a section's h2 (its `id` labels the section) and the one line under it |
| `loop-video` | `<LoopVideo src poster label labels enabled />`: muted loop that plays only on screen and not paused, with a Pause/Play button; off shows the poster |

## L3 Features — `src/features/`
| Feature | Input | Composes |
|---|---|---|
| `top-bar` | `SiteContent` | button, theme-toggle, lib/theme: edge-aligned bar, wordmark, section links, one action |
| `hero-statement` | `StatementContent`, `motion` | button, scroll-scramble: the first screen (Figma "Hero · big type + craft list (G)", 2026-11-09). Craft's work full-bleed, "I make [word] that sell." bottom left, craft list top right, timed tabs at the foot. `use-craft-cycle.ts` (the 2.4 s cycle), `CraftWord.tsx` (the scrambling word), `CraftPicker.tsx` (list and tabs, one choice) are hero-statement only |
| `intro` (not composed since 2026-11-09) | `IntroContent` | button: the Stage hero, hook and a real email on its sheet |
| `email-grid` | `EmailsContent` | section-head: four emails cropped to their top, each linking to the full file |
| `motion-reel` | `MotionContent`, `play` | section-head, loop-video: lead clip across, then a 7 / 5 pair |
| `graphics` | `GraphicsContent` | section-head: head beside two posters |
| `edit-index` | `EditsContent` | section-head: table of edited videos with Drive links |
| `contact` | `ContactContent` | the close: the ask, the address (TBD), what Jiroh makes |
| `site-footer` | `FooterContent`, nav `Link[]`, cta `Link`, `ContactContent` | index ledger: the address large over numbered link columns (Sections, Contact, Elsewhere when filled; no eyebrow or services, those live in the contact close), base row with wordmark, note, back to top (Figma "2 · Index ledger", 2026-11-09) |
| `site-nav` (not composed since 2026-11-07) | `SiteContent`, `SiteNavFx` | surface-panel, button, theme-toggle, lib/theme, magnetic, scroll-hide |
| `hero` (not composed since 2026-11-07) | `HeroContent`, `ImageContent` (logo), `HeroFx` | button, split-reveal, scroll-camera, scroll-slide, scroll-rise, scroll-scramble, ascii-sculpture, lib/scroll; `ServiceRail.tsx` (bottom strip that retypes the logo per service; hidden for now by `SERVICE_RAIL`) `HeroCameraStage.tsx` (the pinned pan → small zoom-out → ripple → close sequence) and `HeroTransition.tsx` (the closing grid mask, logo line art and intro copy) are hero-only; also composes grid-mask, logo-outline, scroll-rise |

## L4 Pages — `src/pages/`
| Page | Responsibility |
|---|---|
| `Home.tsx` | Reads fx flags and reduced motion, starts smooth scroll, composes top-bar → hero-statement → email-grid → motion-reel → graphics → edit-index → contact → site-footer (2026-11-07 rebuild; hero-statement replaced intro 2026-11-09) |
