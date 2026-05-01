---
id: default
name: Jasper — default typography
description: The everyday type system for Jasper marketing surfaces. Confident, clear, slightly editorial.
tags: [primary]
typefaces:
  - family: Inter
    role: primary
    stack: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500, 600, 700]
    source:
      provider: google-fonts
      url: https://fonts.google.com/specimen/Inter
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"
      files:
        - weight: 400
          style: normal
          url: https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.woff2
          format: woff2
        - weight: 600
          style: normal
          url: https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIa1ZL7.woff2
          format: woff2
    use: Body, UI, marketing copy. The default for everything unless display calls for something different.

  - family: Tiempos Headline
    role: display
    stack: "'Tiempos Headline', Georgia, 'Times New Roman', serif"
    weights: [400, 600]
    source:
      provider: self-hosted
      url: https://klim.co.nz/retail-fonts/tiempos-headline/
      cssImport: "/* Licensed via Klim Type Foundry — see source link for licensing. */"
    use: Hero headlines and editorial moments only. Pairs with Inter for body. Never for body copy or UI.

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
    fontWeight: 600
    letterSpacing: "-0.025em"
    use: Hero headlines only. Tiempos Headline.
  - name: h1
    fontSize: "48px"
    lineHeight: "1.1"
    fontWeight: 600
    letterSpacing: "-0.02em"
    use: Page titles.
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

- **One pairing.** Inter for everything; Tiempos Headline only when a piece earns a "moment" — a hero, a quote, a launch announcement.
- **Never mix scales across surfaces.** A landing page uses display, h1, body — not h2 substituting for h1 because "the headline is shorter."
- **Letter-spacing tightens at scale.** All display and h1 use negative tracking. Body and below stay at 0.
- **Numerals are tabular** in any data context (pricing tables, dashboards, comparison cards). Use `font-variant-numeric: tabular-nums`.
