---
id: default
name: Scarlet — default palette
description: The palette used on scarlet.cc. Warm dark ink, cool light neutrals, and one bright coral-red accent — the scarlet — earned on the page by using it only for the moment of action.
tags: [primary]
colors:
  - name: Ink
    hex: "#221E1E"
    role: foreground
    use: Primary text, headlines, body. Warm near-black — reads as human, not clinical. Default for any text on the paper background.
    contrast:
      onLight: AAA

  - name: Ink-alt
    hex: "#1E1E1F"
    role: foreground-alt
    use: Alternate near-black for dark surface backgrounds and dark-mode footers. Slightly cooler than Ink.
    contrast:
      onLight: AAA

  - name: Slate-700
    hex: "#8C827D"
    role: foreground-secondary
    use: Secondary text, bylines, testimonial attributions. Warm mid-tone that sits above Slate-500 without pulling toward grey-blue.
    contrast:
      onLight: AA

  - name: Slate-500
    hex: "#767676"
    role: foreground-muted
    use: Tertiary text, dates, metadata, form-field placeholders.
    contrast:
      onLight: AA

  - name: Slate-200
    hex: "#E9E4E4"
    role: border
    use: Default borders, dividers, table rules, card outlines. Slight warm tint keeps the surface off cold-white.

  - name: Paper
    hex: "#F5F5F5"
    role: background
    use: Default page background. Cool light neutral — reads as considered, not clinical white.

  - name: Card
    hex: "#FFFFFF"
    role: background-elevated
    use: Cards, panels, elevated surfaces. Certification-page evidence tables use this on top of Paper.

  - name: Scarlet
    hex: "#FF4747"
    role: primary
    use: The single moment of action on any page — the primary CTA, the "Get in touch" button, the certified pill on a device page. Bright coral-red, not a deep red. Never more than once per screen.
    contrast:
      onLight: AA

  - name: Scarlet-dark
    hex: "#903A39"
    role: primary-dark-surface
    use: The scarlet accent adjusted for dark surfaces (Ink-alt footers, dark hero photography). Same accent, safer contrast on near-black.
    contrast:
      onDark: AA

  - name: Scarlet-50
    hex: "#FFEBEB"
    role: primary-tint
    use: Subtle background for the active row of the certification register, or the current section of a long-form table of contents.

  - name: Approved
    hex: "#1F6E4A"
    role: status-success
    use: Green for "certified" / "closed finding" status pills, and approved certification badges on public pages.

  - name: Caution
    hex: "#A15B0F"
    role: status-warning
    use: Amber for "surveillance-review-pending", "conditional pass", and warn-severity guardrails.

  - name: Restricted
    hex: "#8B1520"
    role: status-danger
    use: Deep red for "certification suspended", block-severity guardrails, and hard non-conformity findings. Distinct enough from Scarlet that "action" and "problem" never read as the same colour.
---

# Usage rules

- **Scarlet is the action, not the accent.** The bright coral-red appears exactly once per screen — on the primary CTA, the certified pill, or the wordmark. Never on section headings, never on borders, never on hover states for body text. If you find yourself using Scarlet twice, one use is decoration and needs to go.
- **Paper, not pure white.** `#F5F5F5` is the surface. Reserve Card white (`#FFFFFF`) for elevated panels where dense typography needs the extra contrast — evidence tables on a certification page, testimonial cards on a customer story.
- **Warm neutrals only.** Every grey in the palette carries a warm shift (`#E9E4E4`, `#8C827D`, `#221E1E`). Do not introduce a cool grey — the palette drifts toward "hospital brochure" the moment blue-grey lands on the page.
- **Status colours are semantic.** Approved green means "certified" or "conforms". Caution amber means "surveillance-pending" or a warn-level guardrail. Restricted deep-red means a block-severity finding or a suspended certification. Never Approved green for a "get in touch" CTA — the CTA is Scarlet.
- **Scarlet vs Restricted.** Bright Scarlet (`#FF4747`) is for action. Restricted deep-red (`#8B1520`) is for problems. They occupy different roles and never appear on the same element.
- **No mid-tone reds between them.** Anything between `#FF4747` and `#8B1520` reads as accidental palette drift.
