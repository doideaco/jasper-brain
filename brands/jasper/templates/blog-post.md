---
id: blog-post
name: Blog post
description: Editorial blog post for the Jasper marketing site. References the canonical brand voice, typography, palette, logos, guidelines, and guardrails.
format: blog-post
tags: [web, editorial, marketing]
sections:
  - name: Header
    guidance: |-
      Top-of-page brand bar.
      • Background: palette/default token "Surface" (#fafaf9).
      • Logo: render logo/primary asset variant=wordmark-on-light at min 96px wide. Use the asset's url verbatim from MCP — do not recreate.
      • Padding: vertical = type-scale step `body` line-height × 2 (≈48px). Horizontal: 24px gutter on mobile, 64px on desktop.
      • Nav links in `body-sm` (14px Inter 400), color Stone-700, with hover Ink.
      • Honour logo/primary clearSpace and minSize rules.
    tone: utilitarian
    lengthHint: layout only
    required: true
    slots: [navMenu, signInLink]

  - name: Hero
    guidance: |-
      Single outcome-led headline + subhead.
      • Optional eyebrow above headline using `caption` scale step (12px Inter 500, UPPERCASE, letter-spacing 0.04em, color Stone-500). Skip the eyebrow on most posts.
      • Headline uses `display` step (72px / 1.05 / 600 / -0.025em) in typography/default typeface role=display (Tiempos Headline). Color: Ink.
      • Subhead uses `body-lg` (18px / 1.6 / 400) in role=primary (Inter). Color: Stone-700. One sentence, names the audience and the change.
      • Apply guideline/lead-with-outcome — first words must answer "what becomes true for me?", not "what does the product do?".
      • No image in the hero unless the post is photo-led.
    tone: confident, plain
    lengthHint: headline ≤12 words; subhead one sentence
    required: true
    slots: [eyebrow, headline, subhead]

  - name: Author byline
    guidance: |-
      Inline below the subhead.
      • Pull author from facet/person by id (slot: authorPersonId). Use the item's name, role, and imageUrl verbatim.
      • Avatar: 40×40 rounded-full from imageUrl.
      • Name in `body-sm` Inter weight 500, color Ink.
      • Role + publish date on a second line in `body-sm` color Stone-500.
      • Date format: "May 4, 2026" — never relative ("3 days ago").
    tone: editorial
    lengthHint: two lines
    required: true
    slots: [authorPersonId, publishedAt]

  - name: Lead paragraph
    guidance: |-
      The opener. Two sentences maximum, set in `body-lg` step (18px / 1.6 / 400 Inter, color Ink).
      • Sentence 1: state the outcome from guideline/lead-with-outcome — what changes for the reader after they finish this post.
      • Sentence 2: optionally name the tension or surprise that earns the rest of the read.
      • Apply voice/default — confident, helpful, contractions on, no exclamation marks. Address as "you", never "users".
      • Run against guardrail/no-unverified-stats — if you'd otherwise need a number, remove it.
    tone: confident, plain
    lengthHint: 2 sentences
    required: true
    slots: [lead]

  - name: Body
    guidance: |-
      Main prose.
      • Default text: `body` step (16px / 1.5 / 400 Inter), color Ink. Max measure ~72ch — set max-width: 65ch on the prose container.
      • Subheadings use `h2` (32px / 1.15 / 600 / -0.015em) for top-level breaks; `h3` (24px / 1.25 / 600) for nested. Color: Ink.
      • Inline code in role=mono (JetBrains Mono) at the body size, color Stone-700, on Stone-100 background, padding 1.5px 4px, rounded 3px.
      • Section dividers: 1px solid palette token "Stone-200" with vertical rhythm of 32px.
      • Apply EVERY guideline whose scope matches outbound marketing copy. Apply EVERY guardrail; rewrite until block-severity items have zero matches.
      • Source any company-fact claim from facet/knowledge or facet/product items. Do not invent.
    tone: confident, helpful
    lengthHint: 600–1200 words
    required: true
    slots: [bodyMarkdown]

  - name: Pull quote
    guidance: |-
      One per post maximum. Optional — skip on shorter posts.
      • Style: display step at 48px italic, color palette token "Brand" (#7c3aed), border-left: 2px solid Brand, padding-left: 24px, margin: 32px 0.
      • Source: if attributing to a person, set attributionPersonId and embed person.quote VERBATIM (don't paraphrase). Otherwise use a quote already present in the body — do not invent.
    tone: punchy
    lengthHint: 1–2 sentences
    required: false
    slots: [quote, attributionPersonId]

  - name: Mid-post CTA
    guidance: |-
      Optional inline CTA card, placed roughly two-thirds through the body.
      • Card background: palette token "Brand-50" (#f5f3ff). Padding: 24px. Border-radius: 12px.
      • Heading: `h3` step in role=primary (Inter 600), color "Brand".
      • Button: filled with "Brand" (#7c3aed), text in "Surface" (#fafaf9), `body-sm` Inter 500, padding 8px 16px, rounded 6px. One CTA, one link.
      • Headline copy is outcome-led per guideline/lead-with-outcome.
      • Apply guardrail/no-unverified-stats — no numeric claims in CTA copy.
    tone: confident
    lengthHint: headline ≤8 words; button label ≤4 words
    required: false
    slots: [ctaHeadline, ctaButtonText, ctaUrl]

  - name: Closing
    guidance: |-
      Final paragraph. Restates the outcome from the hero in different words and ends with a clear next step (link to product, docs, or sign-up).
      • Style: `body` step in role=primary, color Ink.
      • Two sentences max; the second is the next-step link.
    tone: confident
    lengthHint: 2 sentences
    required: true
    slots: [closing, nextStepUrl]

  - name: Footer
    guidance: |-
      Site-wide footer at the end of the page.
      • Background: palette token "Ink" (#0c0a09).
      • Logo: render logo/primary asset variant=wordmark-on-dark verbatim.
      • Text: `body-sm` (14px / 1.5 / 400) in role=primary (Inter), color Stone-300.
      • Include a copyright line and a single link row (about, pricing, contact).
      • If facet/guardrail or facet/compliance items list a disclaimer that matches the post's claims, append the disclaimer text VERBATIM in `caption` step (12px) on a Stone-500 line at the bottom.
    tone: utilitarian
    lengthHint: 2 lines + disclaimer if applicable
    required: true
    slots: [legalDisclaimer]
---

# Blog post template — usage rules

## Resolution order for AI agents

When an AI tool generates output from this template, resolve every reference against the live brand kit via MCP **before** rendering:

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, primary author candidates, guardrails, and aiInstructions in one shot.
2. For any section that mentions a specific item id (`logo/primary`, `typography/default`, `palette/default`, `guideline/lead-with-outcome`, `guardrail/no-unverified-stats`), call `brain_get_item` to get the full content.
3. Inject typography's `cssImport` into the document head verbatim. Use family names + stacks from typography/default. Apply scale steps by their fontSize/lineHeight/fontWeight/letterSpacing exactly.
4. Use palette colors by their named tokens — never substitute.

## Hard rules

- **One outcome-led opener.** The hero headline, the lead paragraph's first sentence, and the closing all answer "what becomes true for me?". See `guideline/lead-with-outcome`.
- **One pull quote, one CTA.** Multiple of either dilutes both.
- **No invented numbers.** Every numeric claim must be sourced from `knowledge` or `product` items, or removed. See `guardrail/no-unverified-stats`.
- **Author is real.** The byline must reference an existing `person` item.
- **Brand color is rationed.** "Brand" purple appears at most twice on the page (hero CTA + mid-post CTA, OR pull quote — not both).
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.

## Variants

- **Long-form essay** — keep all sections, body 1200–2500 words, allow up to two h2 dividers.
- **Announcement** — Hero + Lead + Body + Closing only. Skip pull quote and mid-post CTA. 400–700 words.
- **Customer story** — keep pull quote (must be a real customer quote from `person` or a custom-facet `case-study` item). Body must include sourced metrics from `knowledge` or `product`.
