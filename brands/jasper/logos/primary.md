---
id: primary
name: Jasper — primary wordmark
description: The default Jasper wordmark. Use this anywhere a logo is needed unless the context specifically calls for an alternate variant.
tags: [primary, wordmark]
assets: []
clearSpace: Maintain at least 1× cap-height of clear space around the wordmark on all sides. No other elements may sit closer.
minSize: 96px wide for the wordmark; 24px square for the icon. Below these, legibility breaks.
---

# Usage rules

**First-time setup:** upload SVGs (light variant + dark variant) via `/brands/jasper/assets`, then edit this item and use the **Browse** button on each Asset row to pick the file. Storing SVGs in Vercel Blob means every consumer of the Logo facet (admin, public page, MCP, JSON-LD) gets the same proxied URL.

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
