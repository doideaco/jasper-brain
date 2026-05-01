---
id: primary
name: Jasper — primary wordmark
description: The default Jasper wordmark. Use this anywhere a logo is needed unless the context specifically calls for an alternate variant.
tags: [primary, wordmark]
assets:
  - variant: wordmark-on-light
    format: svg
    url: https://jasper.ai/brand/wordmark-light.svg
    use: Default logo on light backgrounds. The everyday choice.
    background: light
  - variant: wordmark-on-dark
    format: svg
    url: https://jasper.ai/brand/wordmark-dark.svg
    use: Inverted wordmark for use on dark backgrounds and photography.
    background: dark
  - variant: icon-on-light
    format: svg
    url: https://jasper.ai/brand/icon-light.svg
    use: App icon, favicon, anywhere the full wordmark won't fit.
    background: light
  - variant: wordmark-on-light
    format: png
    url: https://jasper.ai/brand/wordmark-light@2x.png
    use: Fallback for environments that don't render SVG (some legacy email clients).
    background: light
clearSpace: Maintain at least 1× cap-height of clear space around the wordmark on all sides. No other elements may sit closer.
minSize: 96px wide for the wordmark; 24px square for the icon. Below these, legibility breaks.
---

# Usage rules

**Do**
- Use the SVG wherever possible. PNG only as a fallback.
- Pair with Surface (`#fafaf9`) backgrounds; the inverted variant pairs with Ink (`#0c0a09`) or photography.
- Treat the wordmark as type — its kerning, letter-shapes, and proportions are fixed. Don't re-set it.

**Don't**
- Don't recolour the wordmark outside of the supplied light/dark variants.
- Don't apply effects — drop shadows, gradients, outlines, glows.
- Don't lock the wordmark to other marks or text. The clear-space rule is the rule.
- Don't stretch or squash. Always scale uniformly.
- Don't place on insufficient-contrast backgrounds (e.g., wordmark-on-light over a beige hero photo).
