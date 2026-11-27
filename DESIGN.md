---
name: Pinnate
description: A calm place to pin your plans, move them through To Do, In Progress, and Done, and see how much you've finished.
colors:
  paper: "#fafafa"
  surface: "#ffffff"
  subtle-surface: "#f4f4f5"
  muted-surface: "#e4e4e7"
  ink: "#18181b"
  ink-hover: "#27272a"
  ink-muted: "#52525b"
  ink-subtle: "#5c5c66"
  ink-on-dark-muted: "#a1a1aa"
  activity-blue: "#0ea5e9"
  activity-blue-text: "#0369a1"
  activity-blue-border: "#bae6fd"
  activity-blue-surface: "#f0f9ff"
  done-orange: "#f97316"
  done-orange-text: "#9a3412"
  done-orange-border: "#fed7aa"
  done-orange-surface: "#fff7ed"
  card-sage: "#dcfce7"
  card-teal: "#e0f2fe"
  card-sand: "#fef9c3"
  card-lavender: "#ede9fe"
  card-rose: "#ffe4e6"
  pin-red: "#ef4444"
  pin-red-hole: "#7f1d1d"
  danger-text: "#b91c1c"
  danger-bg: "#fef2f2"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.02em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.ink-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  note-card:
    backgroundColor: "{colors.card-sage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "18px 20px"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: Pinnate

## Overview

**Creative North Star: "The Calm Pinboard"**

Pinnate combines the tactile honesty of physical paper cards pinned to a clean worktable with quiet software ergonomics. Monochrome paper (`#fafafa`) and deep carbon ink (`#18181b`) form a restrained chrome layer so user notes—soft pastel cards and stage movement toward Done—stay the emotional center of gravity.

Nothing nags, counters never scold missed days, and motion behaves like ink settling onto cotton paper: unhurried cubic-Bézier trajectories on public arrival, crisp spring overshoots when a card is pinned or placed in a stage, and total stillness while typing or under `prefers-reduced-motion`.

**Key Characteristics:**
- Tactile paper-on-ink card silhouettes with crisp `1.5px–2px` borders and subtle offset ink shadows rather than blurry floating glass.
- Strict semantic color discipline: blue denotes activity/progress motion, orange exclusively signals **Done**, and red is reserved solely for physical pushpins on **pinned** notes.
- Hand-drawn organic details (the **Pinnate** leaf mark, scroll thread, split-screen wave morph, and pause-aware auth sketches) balanced by scannable utility controls.

## Colors

### Primary
- **Carbon Ink (`{colors.ink}`):** Deep charcoal used for headings, primary CTAs (`button-primary`), card borders, and active selection chrome. Hover shifts slightly to **Charcoal Slate (`{colors.ink-hover}`)**.
- **Activity Blue (`{colors.activity-blue}`):** Reserved for motion trajectories, active consistency bar charts, and the **In Progress** stage dot. For small text on light backgrounds, always use **Cerulean Ink (`{colors.activity-blue-text}`)** (`5.93:1` on white) inside **Sky Tint (`{colors.activity-blue-surface}`)**.

### Secondary
- **Done Orange (`{colors.done-orange}`):** Strictly marks completed state (**Done** column dot, completed progress ring arc, and the terminal "done" leaflet on the Pinnate mark/illustration). Text labels use **Burnt Amber (`{colors.done-orange-text}`)** inside **Warm Apricot (`{colors.done-orange-surface}`)** (`4.88:1+`).

### Tertiary
- **Pushpin Crimson (`{colors.pin-red}`):** Reserved exclusively for pushpin badges on **actually pinned** note cards (`note.isPinned === true`) paired with **Pin Core Maroon (`{colors.pin-red-hole}`)**. Never used on unpinned cards or system alerts.
- **Signal Crimson (`{colors.danger-text}`):** Paired with **Blush Alert (`{colors.danger-bg}`)** (`5.91:1` contrast) for validation errors, destructive delete actions, and error boundaries.

### Neutral & Note Surfaces
- **Warm Paper (`{colors.paper}`)** serves as app canvas behind **Pure Sheet (`{colors.surface}`)** cards and modals; **Soft Ash (`{colors.subtle-surface}`)** houses sidebar chrome and view toggles; **Stone Divider (`{colors.muted-surface}`)** draws hairline dividers and default input strokes.
- **Ink Muted (`{colors.ink-muted}`)** & **Graphite Subtle (`{colors.ink-subtle}`)** carry secondary body and metadata copy with guaranteed **`>= 5.2:1` WCAG AA contrast** across subtle gray AND all five pastel surfaces (`Sage`, `Teal/Sky`, `Sand`, `Lavender`, `Rose`).
- **Pastel Note Surfaces:** Light desaturated washes reserved purely for note/plan cards (`Slate` white, `Sage` mint, `Teal` sky, `Sand` butter, `Lavender` mist, `Rose` petal).

**The Semantic Restraint Rule.** Orange means *Done* and Blue means *Active*. Never paint generic tape, borders, or uncompleted chrome in orange, and never place a red pushpin on an unpinned card.

**The Subtle Contrast Rule.** Secondary text on gray (`subtle-surface`) or pastel card fills must maintain `>= 4.5:1` contrast using Graphite Subtle (`#5c5c66`) or Ink Muted (`#52525b`) — never low-contrast `#71717a`.

## Typography

**Display & Body Font:** Plus Jakarta Sans (with system sans fallback) — explicitly retained across headings, UI labels, and note copy per Pinnate product specification (`wordmark in sentence case, app's current sans`).
**Label / Shortcut / Mono Font:** JetBrains Mono for keyboard keycaps (`⌘K`, `ENTER`, `Q`), timestamps, and IDs.

**Character:** Compact geometric letterforms with tight headline tracking (`-0.025em` to `-0.03em`) and balanced multi-line headings (`text-wrap: balance`), anchored at an `11px+` readability floor (avoiding sub-11px axis microtext).

### Hierarchy
- **Display** (`800`, `{typography.display.fontSize}`, `1.04`, `-0.03em`): Landing hero headline only.
- **Headline** (`800`, `{typography.headline.fontSize}`, `1.1`, `-0.025em`): Landing section titles and auth page headings (`<h1>`).
- **Title** (`700`, `1.125rem`, `1.3`, `-0.015em`): Workspace page `<h1>` landmarks, panel headers, and note card headings.
- **Body** (`400`, `0.9375rem`, `1.55`, measure `52ch–68ch`): Note previews, descriptions, and inline instructions (`text-wrap: pretty`).
- **Label** (`600`, `0.75rem`, `1.3`, `0.02em`): Stage tags, badges, helper copy, and shortcut captions.

**The Balance-Without-Stragglers Rule.** Public headings apply `text-wrap: balance` and body leads use `text-wrap: pretty` inside constrained `ch` measures so single-word orphans never dangle on mobile or desktop.

## Layout

- **Landing Canvas:** Max `1160px` container (`24px` desktop gutter, `20px` mobile gutter), sticky `64px` top navigation bar (`--z-topbar: 10`), generous vertical breathing room (`48px–96px` section padding) framed by the non-blocking blue-to-orange scroll thread.
- **Split Auth Stage:** `100svh` 2-column grid (`1fr 1fr`) on desktop collapsing to a compact `minmax(180px, 28svh) 1fr` two-row layout on mobile (`< 768px`), with form headers top-aligned (`clamp(56px, 14svh, 136px)`) so switching Login <-> Signup never jumps vertically.
- **Authenticated Shell:** Sticky left sidebar (`272px` expanded / `80px` collapsed pill rail) on `#fafafa` paper ground; below `768px`, desktop sidebar switches cleanly to top header + floating labeled **Mobile Navigation Dock** (`>= 44×44px` touch targets) plus an inline horizontal `#folder` pill bar so no feature is hidden on phones.

## Elevation & Depth

Pinnate uses a **hybrid tactile elevation system**: neutral utility chrome (`sidebar`, columns, popovers) sits flat or softly lifted with subtle ambient shadows (`0 1px 2px` / `0 10px 15px`), whereas interactive physical artifacts (**Note cards, Board cards, Action stamps, Keyboard keycaps**) wear crisp `1.5px–2px` Carbon Ink borders paired with compact offset ink shadows (`2px 2px 0px rgba(24, 24, 27, 0.85)` at rest, `3px 4px 0px rgba(24, 24, 27, 0.9)` on hover).

**The No Nested-Cards Rule.** Never place a bordered, shadowed note card *inside* another bordered rounded card container; place tactile cards directly onto open warm paper (`--bg-app`) or borderless tonal composition zones.

## Shapes

- **Organic Mark & Vector Craft:** The **PinnateMark** places a central botanical vein with paired leaflets (terminal leaflet orange for *Done*) inside a `{rounded.sm}` (`8px`) Carbon Ink frame, simplifying to 2 leaflet pairs at `16px–20px` (`favicon.svg`, inline UI icons) and strictly omitting any red pushpin inside the logo mark.
- **Corners:** Nested micro-badges (`kbd`, checkboxes) use `{rounded.xs}` (`4px`); controls, inputs, and buttons inside workspace panels use `{rounded.sm}` (`8px`); note cards and kanban columns use `{rounded.md}` (`14px`); primary marketing CTAs, sidebar nav pills, stage tags, and bottom dock use `{rounded.pill}` (`9999px`).

## Components

### Buttons
- **Shape:** Pill (`9999px`) for primary public CTAs & floating docks; softly rounded (`8px`) inside forms, modals, and toolbars.
- **Primary:** Carbon Ink background (`#18181b`), white label, subtle shadow (`--shadow-sm`), lifting `-1px` on hover to Charcoal Slate (`#27272a`) using tactile spring timing (`140ms cubic-bezier(0.16, 1, 0.3, 1)`).
- **Secondary:** Crisp white surface, `#e4e4e7` border (`1px`) or Carbon Ink outline (`1.5px`) for hard-confirmation drawer actions; never relies on outline-less gray hover alone (`:focus-visible` `2px` Ink ring + `2px` offset everywhere).

### Note & Board Cards
- **Corner Style:** Soft paper corner (`14px` on grid cards, `8px` compact board cards) with `1.5px–2px` Carbon Ink border and offset shadow (`--card-shadow`).
- **Pin Semantics:** Red pushpin renders **only when `note.isPinned === true`** (rotated lightly via `getNoteTilt(note.id)`). Stage indicators render as subtle semantic pills (`To Do`, `In Progress`, `Done`) instead of decorative color-matched icons.

### Inputs & Quick Capture
- **Style:** `min-height: 44px` comfortable touch surface on auth/mobile inputs (`38px–44px` on desktop search), `1.5px` subtle border sharpening to `#18181b` on focus, and crisp red-tinted `--danger-bg` with inline field error message (`aria-invalid` + `aria-describedby`).

### Navigation & Modals
- **Style:** Unified `PinnateMark` + sentence-case `"Pinnate"` header link (`/`), consistent page `<h1>` landmarks on every screen, `Escape`-dismissible dialogs (`KeyboardHelpModal`, `CommandPalette`, `AddFolderModal`, `NoteEditor`), and explicit confirmation before permanent deletes in `/archive`.

## Do's and Don'ts

### Do:
- **Do** use plain Pinnate vocabulary everywhere (`Pin`, `Board`, `Stage`, `Scratchpad`, `Progress`, `Done`, `Add to notes`, `Quick add`).
- **Do** apply `prefers-reduced-motion` static fallbacks (`150ms` fades max, zero looping scale/spin) and pause idle art motion while users focus or type in auth fields.
- **Do** ensure every interactive control meets `>= 44×44px` on touch/mobile viewports and includes descriptive visible labels or `aria-label`.

### Don't:
- **Don't** reintroduce `"Tack"`, `"Quick tack"`, `"Desk"`, `"Cloud Desk"`, `"Notes Workspace"`, or Lucide's generic `BookOpen` logo icon anywhere.
- **Don't** put `#ef4444` pushpins on unpinned Kanban cards or reuse `#ef4444` on error icons (`--danger-text` `#b91c1c` owns errors).
- **Don't** ship unconfirmed destructive actions, silent catch blocks, or streak/missed-day guilt metrics.
