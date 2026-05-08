---
id: default
name: Jasper — default typography
description: The everyday type system for Jasper marketing surfaces. Editorial display face for headlines, neutral sans for everything else.
tags: [primary]
typefaces:
  - family: Feature Display
    role: display
    stack: "'Feature Display', ui-serif, Georgia, 'Times New Roman', serif"
    weights: [300]
    source:
      provider: self-hosted
      files: []
    use: Display headlines and hero type only. Light weight (300) is the only weight — its slim, editorial proportions are the brand voice in type form. Never use a heavier weight; never substitute another serif.

  - family: Inter
    role: primary
    stack: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500, 600, 700]
    source:
      provider: google-fonts
      url: https://fonts.google.com/specimen/Inter
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"
    use: Body, UI, marketing copy, sub-headings (h2/h3), eyebrows.

  - family: JetBrains Mono
    role: mono
    stack: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace"
    weights: [400, 500]
    source:
      provider: google-fonts
      url: https://fonts.google.com/specimen/JetBrains+Mono
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');"
    use: Code, IDs, technical labels.

scale:
  - name: display
    fontSize: "72px"
    lineHeight: "1.05"
    fontWeight: 300
    letterSpacing: "-0.02em"
    use: Hero headlines only. Renders in Feature Display 300.
  - name: h1
    fontSize: "48px"
    lineHeight: "1.1"
    fontWeight: 300
    letterSpacing: "-0.02em"
    use: Page titles. Renders in Feature Display 300.
  - name: h2
    fontSize: "32px"
    lineHeight: "1.15"
    fontWeight: 600
    letterSpacing: "-0.015em"
    use: Section headings.
  - name: h3
    fontSize: "24px"
    lineHeight: "1.25"
    fontWeight: 600
    use: Subsection headings.
  - name: body-lg
    fontSize: "18px"
    lineHeight: "1.6"
    fontWeight: 400
    use: Lead paragraphs, blog body.
  - name: body
    fontSize: "16px"
    lineHeight: "1.5"
    fontWeight: 400
    use: Default body copy and UI.
  - name: body-sm
    fontSize: "14px"
    lineHeight: "1.5"
    fontWeight: 400
    use: Secondary text, captions, metadata.
  - name: caption
    fontSize: "12px"
    lineHeight: "1.4"
    fontWeight: 500
    letterSpacing: "0.04em"
    use: Eyebrows, tags, smallest UI labels. UPPERCASE recommended.
---

# Usage rules

- **Two-typeface system.** Feature Display 300 for the top of the hierarchy (display, h1). Inter for everything from h2 down — body, UI, captions, eyebrows.
- **Feature Display is 300-only.** Never request a heavier weight from Feature; the browser will synthesize fake bold and it looks wrong. If a section needs a heavier headline, use Inter h2 weight 600 instead.
- **Inter does the weight work below the fold.** h2/h3 use Inter 600. Body 400. Caption 500.
- **Letter-spacing tightens at scale.** Display and h1 use negative tracking (-0.02em). Body and below stay at 0.
- **Never mix scales across surfaces.** A landing page uses display, h1, body — not h2 substituting for h1 because "the headline is shorter."
- **Numerals are tabular** in any data context (pricing tables, dashboards, comparison cards). Use `font-variant-numeric: tabular-nums`.
