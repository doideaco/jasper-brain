---
id: blog-post
name: Blog post
description: Editorial blog post for the Jasper marketing site. References the canonical brand voice, typography, palette, logos, guidelines, and guardrails.
format: blog-post
renderAs: html-document
tags: [web, editorial, marketing]
scaffold: |-
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{title}} — {{brandName}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {{typographyHeadCss}}
    <style>
      :root {
        --ink: #0c0a09;
        --stone-700: #44403c;
        --stone-500: #78716c;
        --stone-200: #e7e5e4;
        --stone-100: #f5f5f4;
        --surface: #fafaf9;
        --card: #ffffff;
        --brand: #FA4028;
        --brand-50: #FFE9E4;
        --display-family: 'Feature Display', Georgia, 'Times New Roman', serif;
        --body-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --mono-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--body-family); font-size: 16px; line-height: 1.5; }
      a { color: inherit; }
      .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }
      header.bar { padding: 24px 0; border-bottom: 1px solid var(--stone-200); }
      header.bar nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      header.bar img { height: 28px; width: auto; }
      .nav-links { display: flex; gap: 20px; font-size: 14px; color: var(--stone-700); }
      .nav-links a { text-decoration: none; }
      .nav-links a:hover { color: var(--ink); }
      .hero { padding: 80px 0 48px 0; }
      .eyebrow { font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: var(--stone-500); margin: 0 0 16px 0; }
      h1.headline { font-family: var(--display-family); font-size: 72px; line-height: 1.05; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 24px 0; color: var(--ink); }
      .subhead { font-size: 18px; line-height: 1.6; font-weight: 400; color: var(--stone-700); margin: 0; }
      .byline { display: flex; align-items: center; gap: 12px; padding: 24px 0; border-bottom: 1px solid var(--stone-200); }
      .byline img { width: 40px; height: 40px; border-radius: 9999px; object-fit: cover; }
      .byline .author { font-size: 14px; font-weight: 500; color: var(--ink); }
      .byline .meta { font-size: 14px; color: var(--stone-500); }
      .lead { font-size: 18px; line-height: 1.6; padding: 32px 0; margin: 0; color: var(--ink); max-width: 65ch; }
      article.body { padding: 16px 0 40px 0; max-width: 65ch; }
      article.body p { font-size: 16px; line-height: 1.5; margin: 0 0 16px 0; color: var(--ink); }
      article.body h2 { font-family: var(--body-family); font-size: 32px; line-height: 1.15; font-weight: 600; letter-spacing: -0.015em; margin: 32px 0 16px 0; color: var(--ink); }
      article.body h3 { font-family: var(--body-family); font-size: 24px; line-height: 1.25; font-weight: 600; margin: 24px 0 12px 0; color: var(--ink); }
      article.body code { font-family: var(--mono-family); font-size: 14px; background: var(--stone-100); color: var(--stone-700); padding: 1.5px 4px; border-radius: 3px; }
      blockquote.pullquote { font-family: var(--display-family); font-size: 48px; line-height: 1.15; font-weight: 300; font-style: italic; color: var(--brand); border-left: 2px solid var(--brand); padding-left: 24px; margin: 48px 0; }
      .cta { background: var(--brand-50); padding: 24px; border-radius: 12px; margin: 48px 0; }
      .cta h3 { font-family: var(--body-family); font-size: 24px; font-weight: 600; color: var(--brand); margin: 0 0 12px 0; }
      .cta a.button { display: inline-block; background: var(--brand); color: var(--surface); font-size: 14px; font-weight: 500; text-decoration: none; padding: 8px 16px; border-radius: 6px; }
      .closing { padding: 32px 0 64px 0; font-size: 16px; line-height: 1.5; color: var(--ink); border-top: 1px solid var(--stone-200); max-width: 65ch; }
      footer.site { background: var(--ink); color: #d6d3d1; padding: 48px 0; }
      footer.site img { height: 24px; width: auto; margin-bottom: 16px; }
      footer.site .row { display: flex; gap: 20px; flex-wrap: wrap; font-size: 14px; }
      footer.site a { color: #d6d3d1; text-decoration: none; }
      footer.site .copy { font-size: 12px; color: #a8a29e; margin-top: 16px; }
    </style>
  </head>
  <body>

    <header class="bar">
      <div class="container">
        <nav>
          <img src="{{logoUrlLight}}" alt="{{brandName}}">
          <div class="nav-links">{{navLinks}}</div>
        </nav>
      </div>
    </header>

    <section class="hero">
      <div class="container">
        {{eyebrowBlock}}
        <h1 class="headline">{{headline}}</h1>
        <p class="subhead">{{subhead}}</p>
      </div>
    </section>

    <div class="container">
      <div class="byline">
        <img src="{{authorImageUrl}}" alt="{{authorName}}">
        <div>
          <div class="author">{{authorName}}</div>
          <div class="meta">{{authorRole}} · {{publishedAt}}</div>
        </div>
      </div>

      <p class="lead">{{lead}}</p>

      <article class="body">
        {{bodyHtml}}
      </article>

      {{pullQuoteBlock}}

      {{midPostCtaBlock}}

      <p class="closing">{{closing}}</p>
    </div>

    <footer class="site">
      <div class="container">
        <img src="{{logoUrlDark}}" alt="{{brandName}}">
        <div class="row">{{footerLinks}}</div>
        <p class="copy">{{copyright}}</p>
        {{legalDisclaimer}}
      </div>
    </footer>

  </body>
  </html>
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
      • Headline uses `display` step (72px / 1.05 / 300 / -0.02em) in typography/default role=display (Feature Display). Color: Ink.
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
      • Style: display step at 48px italic, color palette token "Brand" (#FA4028), border-left: 2px solid Brand, padding-left: 24px, margin: 32px 0.
      • Source: if attributing to a person, set attributionPersonId and embed person.quote VERBATIM (don't paraphrase). Otherwise use a quote already present in the body — do not invent.
    tone: punchy
    lengthHint: 1–2 sentences
    required: false
    slots: [quote, attributionPersonId]

  - name: Mid-post CTA
    guidance: |-
      Optional inline CTA card, placed roughly two-thirds through the body.
      • Card background: palette token "Brand-50" (#FFE9E4). Padding: 24px. Border-radius: 12px.
      • Heading: `h3` step in role=primary (Inter 600), color "Brand".
      • Button: filled with "Brand" (#FA4028), text in "Surface" (#fafaf9), `body-sm` Inter 500, padding 8px 16px, rounded 6px. One CTA, one link.
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

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML5 document. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. No summary. No "here's the post". The fence opens, the doc renders, the fence closes. End of response.
2. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
3. **Self-contained.** All CSS lives in a single `<style>` element in `<head>`. No external stylesheets except the typography `cssImport` (Google Fonts `<link>` is also fine in `<head>`).
4. **Resolve every brand-kit reference VERBATIM.**
   - Colours: only hex codes from `palette.colors[].hex`. Never invent a value, never approximate, never use a colour name without resolving the hex.
   - Fonts: inline `typography.typefaces[].source.cssImport` in `<head>` exactly as provided. For self-hosted fonts (`source.files`), emit `@font-face` rules with the file URLs verbatim.
   - Logos: only `logo.assets[].url` strings. Never construct `jasper.ai/...` or any other URL.
5. **Slot resolution.** Every `{{slot}}` referenced in section guidance must be filled with real content. No `{{...}}` placeholders, no Lorem Ipsum, no `<!-- TODO -->` comments, no "[author name]" placeholders.
6. **Pre-return self-check.** Before you finalise the response, verify:
   - First three characters of your response are ` ``` ` (the fence).
   - First non-whitespace inside the fence is `<!doctype html>`.
   - Exactly one ```html opening fence and one closing fence in the entire response.
   - Every `#xxxxxx` colour code in the document appears in the brand kit's palette.
   - The `<head>` includes typography font loading.
   - No `Lorem`, no `TODO`, no `placeholder`, no `[bracketed-instruction-text]` survives.

If you cannot satisfy all six rules, do not return — ask the user for the missing input first.

## Why HTML

This template renders to a previewable artifact in Claude.ai (which adds an "Open in new tab" affordance) and a copy-paste-ready document in Claude Desktop. Markdown output, prose summaries, or fragmentary HTML defeat both.

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
- **Brand color is rationed.** "Brand" red appears at most twice on the page (hero CTA + mid-post CTA, OR pull quote — not both).
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.

## Variants

- **Long-form essay** — keep all sections, body 1200–2500 words, allow up to two h2 dividers.
- **Announcement** — Hero + Lead + Body + Closing only. Skip pull quote and mid-post CTA. 400–700 words.
- **Customer story** — keep pull quote (must be a real customer quote from `person` or a custom-facet `case-study` item). Body must include sourced metrics from `knowledge` or `product`.
