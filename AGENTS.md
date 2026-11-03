# AGENTS.md — rules for AI assistants

Read this fully before changing anything. If a rule conflicts with the owner's direct, current request, follow the owner and say so.
Based on the rules in `Robert - Portfolio`, tightened so effects and animations stay as modular as components.

## 0. Mission
A modular portfolio for Jiroh (web dev, email design, game dev; also graphic design and video editing).
Test every change against: *"Could someone change this one thing without touching anything else?"*

## 1. Read order
1. `README.md` — scope and decision log
2. `ARCHITECTURE.md` — layers and where files go
3. `MODULES.md` — every module's contract
4. `CONVENTIONS.md` — how to write it
5. `DESIGN.md` — tokens, visual rules, **motion catalogue**
6. `TASKS.md` — what is done and next

## 2. Hard rules
1. One module = one responsibility. If its description needs "and", split it.
2. Dependencies flow down the layers only (`ARCHITECTURE.md`). No sideways imports between features, effects, animations or components.
3. No copy in code. Text and links live in `content/`.
4. No global mutable state. No `window.x = ...`, no module-level singletons; use motion's `frame` loop for per-frame work.
5. No duplicated logic. Shared code moves down a layer into a purpose-named folder.
6. Soft caps: 150 lines per TS/TSX file, 200 per CSS file.
7. Design values only from `src/tokens/`. Motion durations and easings too (`read-motion-token.ts` for JS).
8. Every effect and animation: has an `enabled` switch, honours reduced motion, has a static fallback, and has a row in the DESIGN.md motion catalogue. No row, no merge.
9. No new dependency without a decision-log entry in `README.md`.
10. Build only what the Figma frame shows. Don't add backgrounds, textures or decorative layers it doesn't have; propose them first.
11. Never invent owner facts; mark gaps `TBD`. Never copy content or structure from jiroh.works (it hosts a client's portfolio).

## 3. Workflow
State the goal → find the module in `MODULES.md` (or add its row first) → list files → change → self-check → update docs → report.

## 4. Self-check
- [ ] `npx tsc -b` and `npx oxlint` clean; `npm run build` succeeds
- [ ] Each changed file has one stated purpose and sits in the right layer
- [ ] No copy or magic values in code; tokens used
- [ ] Reduced motion and `?fx=none` both give a complete, readable page
- [ ] Keyboard focus visible; landmarks and one `h1`; text contrast AA
- [ ] `MODULES.md`, `DESIGN.md` motion catalogue and `TASKS.md` updated

## 5. Report format
```
Changed:      <files>
Why:          <one sentence>
Assumed:      <guesses>
Needs owner:  <decisions or facts>
Docs updated: <files>
```
