---
id: default
name: Jasper — default palette
description: Core brand palette. Quiet, editorial, confident. Reads as "premium tool for marketers" not "consumer SaaS."
tags: [primary]
colors:
  - name: Ink
    hex: "#0c0a09"
    role: foreground
    use: Primary text, headlines, body. The default for any text on light backgrounds.
    contrast:
      onLight: AAA
      onDark: AA-fail

  - name: Stone-700
    hex: "#44403c"
    role: foreground-secondary
    use: Secondary text, captions. Sufficient contrast on light backgrounds without competing with primary text.
    contrast:
      onLight: AAA

  - name: Stone-500
    hex: "#78716c"
    role: foreground-muted
    use: Tertiary text, metadata, IDs.
    contrast:
      onLight: AA

  - name: Stone-200
    hex: "#e7e5e4"
    role: border
    use: Default borders, dividers, subtle separators.

  - name: Surface
    hex: "#fafaf9"
    role: background
    use: Default page background. Slightly warm off-white — never pure #fff.

  - name: Card
    hex: "#ffffff"
    role: background-elevated
    use: Cards, panels, elevated surfaces on top of Surface.

  - name: Brand
    hex: "#7c3aed"
    role: primary
    use: Primary actions, key links, brand accents. Use sparingly — once per screen ideally.
    contrast:
      onLight: AA

  - name: Brand-50
    hex: "#f5f3ff"
    role: primary-tint
    use: Hover states, selected backgrounds, gentle brand emphasis.

  - name: Success
    hex: "#15803d"
    role: status-success
    use: Confirmations, positive feedback, "do" examples.

  - name: Warning
    hex: "#b45309"
    role: status-warning
    use: Warn-level guardrails, caution states.

  - name: Danger
    hex: "#b91c1c"
    role: status-danger
    use: Destructive actions, block-level guardrails, errors.
---

# Usage rules

- **One brand color per screen.** Brand purple draws the eye — multiple uses dilute it. Pick the single most important action and own that color.
- **Never pure white or pure black.** Ink (`#0c0a09`) and Surface (`#fafaf9`) read as deliberate. `#000000` and `#ffffff` read as default-CSS.
- **Status colors are status-only.** Don't use Success green for a "marketing" accent. Don't use Brand purple for a confirmation toast.
- **Borders are Stone-200 by default.** Reserve darker borders for emphasised regions (e.g., active form fields).
