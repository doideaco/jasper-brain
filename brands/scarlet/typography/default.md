---
id: default
name: Scarlet — default typography
description: One geometric sans across the whole hierarchy. Aeonik Pro is the primary typeface used on scarlet.cc; Inter is the free fallback used in demos and any surface that cannot self-host the licensed files. JetBrains Mono is reserved for regulatory citations.
tags: [primary]
typefaces:
  - family: Aeonik Pro
    role: display
    stack: "'Aeonik Pro', 'Aeonik Pro Medium', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500, 600]
    source:
      provider: self-hosted
      url: https://www.cotypefoundry.com/fonts/aeonik-pro
      files: []
    use: Display headlines, page titles, mission statements. Weight 500 is the everyday heading weight on scarlet.cc — never 700, never black. Aeonik Pro is a licensed CoType Foundry face; self-host the files once purchased and reference them via @font-face in the scaffold's <head>.

  - family: Aeonik Pro
    role: primary
    stack: "'Aeonik Pro', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500]
    source:
      provider: self-hosted
      url: https://www.cotypefoundry.com/fonts/aeonik-pro
      files: []
    use: Body, UI, byline, nav, buttons. Body copy is 400; UI labels and short headings step to 500. The primary and display roles share the family — the type system is one face, three sizes of decision.

  - family: Inter
    role: primary-fallback
    stack: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    weights: [400, 500, 600]
    source:
      provider: google-fonts
      url: https://fonts.google.com/specimen/Inter
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');"
    use: Free fallback for surfaces that cannot self-host Aeonik Pro (playground previews, artifact demos, third-party embeds). Inter is metrically compatible enough that the layout does not shift when Aeonik loads on top of it.

  - family: JetBrains Mono
    role: mono
    stack: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace"
    weights: [400, 500]
    source:
      provider: google-fonts
      url: https://fonts.google.com/specimen/JetBrains+Mono
      cssImport: "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');"
    use: Regulatory citations (`IEC 62304 §5.7.2`, `EU MDR Annex IX`), certification IDs (`SCR-2026-0117`), and tabular numerics. The mono treatment marks the object as citable — a reader can copy the citation as an ID and search for it.

scale:
  - name: display
    fontSize: "56px"
    lineHeight: "1.08"
    fontWeight: 500
    letterSpacing: "-0.02em"
    use: Hero headlines on scarlet.cc-style surfaces. Aeonik Pro 500 — the site's default heading weight.
  - name: h1
    fontSize: "40px"
    lineHeight: "1.12"
    fontWeight: 500
    letterSpacing: "-0.015em"
    use: Page titles. Aeonik Pro 500.
  - name: h2
    fontSize: "28px"
    lineHeight: "1.2"
    fontWeight: 500
    letterSpacing: "-0.01em"
    use: Section headings. Aeonik Pro 500.
  - name: h3
    fontSize: "20px"
    lineHeight: "1.3"
    fontWeight: 500
    use: Subsection headings and table headers.
  - name: body-lg
    fontSize: "18px"
    lineHeight: "1.6"
    fontWeight: 400
    use: Lead paragraphs, blog opening.
  - name: body
    fontSize: "16px"
    lineHeight: "1.6"
    fontWeight: 400
    use: Default body copy and table cells.
  - name: body-sm
    fontSize: "14px"
    lineHeight: "1.55"
    fontWeight: 400
    use: Secondary text, footnotes, byline.
  - name: caption
    fontSize: "12px"
    lineHeight: "1.4"
    fontWeight: 500
    letterSpacing: "0.06em"
    use: Eyebrows, section labels, certification-ID captions. UPPERCASE recommended.
---

# Usage rules

- **One face, one weight, most of the time.** Aeonik Pro 500 does the heavy lifting from display down to h3. Body drops to 400. Do not reach for 700 for emphasis — the type system does not have an emphatic weight on purpose. Emphasise with size or space.
- **Aeonik or Inter — not both.** On surfaces where Aeonik is self-hosted, use Aeonik. On surfaces where it cannot be self-hosted (playground previews, external artifact renders), use Inter alone and drop Aeonik from the CSS entirely. Do not stack them in a way that produces a visible reflow when one loads over the other.
- **Mono is for citations.** JetBrains Mono is reserved for regulatory clauses, certification IDs, and numerical tables that need tabular alignment. Not for pull quotes, not for headings, not for body prose.
- **Tabular numerics** are on by default in any `<table>`. Set `font-variant-numeric: tabular-nums` on the container.
- **Measure caps.** Body copy caps at 68ch. Anything wider degrades scan-lines.
- **Letter-spacing** stays negative through h2 (-0.02em → -0.01em) and neutral below. Only caption steps back to +0.06em because uppercase needs the room.
