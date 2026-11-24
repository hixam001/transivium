---
id: "design"
type: "reference"
status: "active"
created: "2026-11-24"
updated: "2026-11-24"
confidence: "high"
source: "implementation-and-executed-checks"
tags: ["transivium", "reference"]
---

# Workspace design system

## Direction and status

Operate mode: a precise classroom workbench. This implementation direction is inferred from the educational task and the user's instruction to continue, not an approved aesthetic preference. Familiar navigation, graph canvas, transition matrix and state inspector organize the work. A live state/edge highlight will be the signature interaction during simulation.

## Tokens

Warm-white canvas, cool pale-blue shell, ink text, deep blue actions; green means a verified/valid outcome, amber means a draft or stale artifact, red means an actionable error. Never use color alone. System sans-serif for controls and reading; monospace only for symbols, state IDs and expressions. Body 14–16px, page title 27px, panel headings 16px. Spacing uses 4/8/12/16/24/32px. Full 1px borders and restrained 8–12px radii group functional regions; no decorative shadows.

## Layout

Desktop navigation rail, generous work area and narrow state inspector. Graph takes the primary panel; editable transition matrix follows below. At tablet widths navigation becomes a top bar and inspector follows the graph. At mobile width controls wrap and the transition table scrolls in its own labelled region; the page itself never requires horizontal scrolling.

## Interaction

Every visible control works. Labels persist above fields. Buttons name actions, validation preserves the draft and points at fields, destructive replacement/deletion requires confirmation. Loading/disabled/empty/error states are explicit. Focus uses a deep blue (#2456bd) 3px outline; reduced-motion disables nonessential animation. Text selection and scrollbars share the palette. Table controls remain the complete keyboard alternative to graph gestures.

## Links

- [[PRODUCT]]
- [[docs/APP_FLOW]]
- [[memory/Requirements/FR-01]]
- [[memory/Requirements/NFR-04]]
