---
id: blog-post
name: Blog post
description: Editorial blog post for the Scarlet standards blog. References the canonical brand voice, typography, palette, logo, guidelines, and guardrails. Every claim cites a clause.
format: blog-post
renderAs: html-document
tags: [web, editorial, regulatory]
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
        --ink: #221E1E;
        --ink-alt: #1E1E1F;
        --slate-700: #8C827D;
        --slate-500: #767676;
        --slate-200: #E9E4E4;
        --slate-100: #F0ECEC;
        --paper: #F5F5F5;
        --card: #ffffff;
        --scarlet: #FF4747;
        --scarlet-dark: #903A39;
        --scarlet-50: #FFEBEB;
        --approved: #1F6E4A;
        --caution: #A15B0F;
        --restricted: #8B1520;
        --display-family: 'Aeonik Pro', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --body-family: 'Aeonik Pro', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --mono-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--paper); color: var(--ink); font-family: var(--body-family); font-size: 16px; line-height: 1.6; }
      a { color: inherit; }
      .container { max-width: 720px; margin: 0 auto; padding: 0 24px; }
      header.bar { padding: 20px 0; border-bottom: 1px solid var(--slate-200); background: var(--paper); }
      header.bar nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      header.bar img { height: 28px; width: auto; }
      .nav-links { display: flex; gap: 24px; font-size: 14px; color: var(--ink); font-weight: 500; }
      .nav-links a { text-decoration: none; }
      .nav-links a:hover { color: var(--scarlet); }
      .hero { padding: 88px 0 40px 0; }
      .eyebrow { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); margin: 0 0 20px 0; }
      h1.headline { font-family: var(--display-family); font-size: 56px; line-height: 1.08; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 24px 0; color: var(--ink); max-width: 22ch; }
      .subhead { font-family: var(--body-family); font-size: 20px; line-height: 1.5; font-weight: 400; color: var(--slate-700); margin: 0; max-width: 48ch; }
      .byline { display: flex; align-items: center; gap: 12px; padding: 32px 0; border-top: 1px solid var(--slate-200); border-bottom: 1px solid var(--slate-200); }
      .byline img { width: 44px; height: 44px; border-radius: 9999px; object-fit: cover; background: var(--slate-200); }
      .byline .author { font-size: 15px; font-weight: 500; color: var(--ink); }
      .byline .meta { font-size: 14px; color: var(--slate-500); }
      .lead { font-family: var(--body-family); font-size: 20px; line-height: 1.55; padding: 40px 0 24px 0; margin: 0; color: var(--ink); max-width: 44ch; font-weight: 400; }
      article.body { padding: 16px 0 40px 0; max-width: 68ch; }
      article.body p { font-size: 17px; line-height: 1.7; margin: 0 0 20px 0; color: var(--ink); }
      article.body h2 { font-family: var(--display-family); font-size: 28px; line-height: 1.2; font-weight: 500; letter-spacing: -0.01em; margin: 48px 0 16px 0; color: var(--ink); }
      article.body h3 { font-family: var(--display-family); font-size: 20px; line-height: 1.3; font-weight: 500; margin: 32px 0 12px 0; color: var(--ink); }
      article.body code { font-family: var(--mono-family); font-size: 14px; background: var(--slate-100); color: var(--ink); padding: 2px 6px; border-radius: 3px; font-weight: 500; }
      article.body ul, article.body ol { padding-left: 24px; margin: 0 0 20px 0; }
      article.body li { margin-bottom: 8px; }
      article.body blockquote { border-left: 3px solid var(--slate-500); padding: 4px 0 4px 20px; margin: 32px 0; color: var(--slate-700); font-size: 17px; line-height: 1.65; }
      blockquote.pullquote { font-family: var(--display-family); font-size: 28px; line-height: 1.3; font-weight: 500; color: var(--ink); border-left: 3px solid var(--scarlet); padding-left: 24px; margin: 56px 0; max-width: 36ch; }
      blockquote.pullquote cite { display: block; margin-top: 16px; font-family: var(--mono-family); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); font-style: normal; font-weight: 400; }
      .cta { background: var(--card); border: 1px solid var(--slate-200); padding: 28px; border-radius: 6px; margin: 56px 0; }
      .cta .eyebrow { color: var(--slate-500); margin-bottom: 12px; }
      .cta h3 { font-family: var(--display-family); font-size: 22px; font-weight: 500; color: var(--ink); margin: 0 0 12px 0; }
      .cta p { font-size: 15px; color: var(--slate-700); margin: 0 0 16px 0; }
      .cta a.button { display: inline-block; background: var(--scarlet); color: #ffffff; font-family: var(--body-family); font-size: 15px; font-weight: 500; text-decoration: none; padding: 12px 22px; border-radius: 4px; }
      .cta a.button:hover { background: var(--ink); }
      .closing { padding: 32px 0 24px 0; font-size: 17px; line-height: 1.7; color: var(--slate-700); border-top: 1px solid var(--slate-200); max-width: 68ch; }
      .citations { padding: 24px 0 64px 0; border-top: 1px solid var(--slate-200); }
      .citations h4 { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); margin: 0 0 12px 0; }
      .citations ol { padding-left: 24px; margin: 0; font-size: 14px; color: var(--slate-700); font-family: var(--mono-family); line-height: 1.7; }
      .citations a { color: var(--slate-700); }
      footer.site { background: var(--ink-alt); color: #C9C4C0; padding: 56px 0; }
      footer.site img { height: 24px; width: auto; margin-bottom: 20px; }
      footer.site .row { display: flex; gap: 24px; flex-wrap: wrap; font-size: 13px; font-weight: 500; }
      footer.site a { color: #C9C4C0; text-decoration: none; }
      footer.site .copy { font-size: 12px; color: #767070; margin-top: 20px; }
      footer.site .disclaimer { font-size: 12px; color: #767070; margin-top: 16px; max-width: 68ch; line-height: 1.6; }

      /* Scroll-triggered reveal. Elements get .reveal-up via JS at the end of body. */
      .reveal-up {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1),
          transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
        will-change: opacity, transform;
      }
      .reveal-up.in-view { opacity: 1; transform: translateY(0); }
      @media (prefers-reduced-motion: reduce) {
        .reveal-up { transition: none; transform: none; opacity: 1; }
      }
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

      <div class="citations">
        <h4>Sources cited in this piece</h4>
        <ol>
          {{citationsList}}
        </ol>
      </div>
    </div>

    <footer class="site">
      <div class="container">
        <img src="{{logoUrlDark}}" alt="{{brandName}}">
        <div class="row">{{footerLinks}}</div>
        <p class="copy">{{copyright}}</p>
        <p class="disclaimer">{{legalDisclaimer}}</p>
      </div>
    </footer>

    <script>
      // Scroll-triggered reveal. Marks every meaningful section with
      // .reveal-up; an IntersectionObserver flips them to .in-view as
      // they enter the viewport. Respects prefers-reduced-motion.
      (function () {
        if (
          typeof window === 'undefined' ||
          !('IntersectionObserver' in window)
        ) {
          return;
        }
        var prefersReduced =
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        var selectors = [
          '.hero h1.headline',
          '.hero p.subhead',
          '.hero .eyebrow',
          '.byline',
          '.lead',
          'article.body > *',
          'blockquote.pullquote',
          '.cta',
          '.closing',
          '.citations',
          'footer.site .container > *'
        ].join(', ');

        var els = document.querySelectorAll(selectors);
        for (var i = 0; i < els.length; i++) els[i].classList.add('reveal-up');

        var io = new IntersectionObserver(
          function (entries) {
            for (var i = 0; i < entries.length; i++) {
              var e = entries[i];
              if (e.isIntersecting) {
                e.target.classList.add('in-view');
                io.unobserve(e.target);
              }
            }
          },
          { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
        );
        for (var j = 0; j < els.length; j++) io.observe(els[j]);
      })();
    </script>
  </body>
  </html>
sections:
  - name: Header
    guidance: |-
      Top-of-page brand bar.
      • Background: palette/default token "Paper" (#F7F5F1).
      • Logo: render logo/primary asset variant=wordmark-on-light at min 96px wide. Use the asset's url verbatim from MCP — do not recreate the wordmark in HTML text.
      • Nav links render in JetBrains Mono 13px UPPERCASE letter-spacing 0.06em, color Slate-700, hover Ink.
      • Honour logo/primary clearSpace and minSize rules.
    tone: utilitarian
    lengthHint: layout only
    required: true
    slots: [navMenu]

  - name: Hero
    guidance: |-
      Named-argument headline + evidentiary subhead.
      • Optional eyebrow: caption step (12px JetBrains Mono 500, UPPERCASE, letter-spacing 0.06em, color Slate-500). Use it to name the standard the post is about — e.g. "IEC 62304 §5.7 · Software updates".
      • Headline uses display step (56px / 1.08 / 500 / -0.02em) in Aeonik Pro. Color: Ink. Names the argument in one sentence — never a question, never a metaphor.
      • Subhead uses body-lg (20px Aeonik Pro 400 / 1.5). Color: Slate-700. One sentence naming the specific reader (regulatory-affairs leads, review teams, manufacturers preparing an MDR file).
      • Apply voice/default — confident and human on the outside, technically precise underneath. Active verbs. Short sentences. No hype vocabulary from voice/default.avoid.
    tone: confident, human, precise
    lengthHint: headline ≤14 words; subhead one sentence
    required: true
    slots: [eyebrow, headline, subhead]

  - name: Author byline
    guidance: |-
      Inline below the hero.
      • Pull author from facet/person by id (slot: authorPersonId). Default is `person/dr-eleanor-vance`. Use the item's name, role, and imageUrl verbatim.
      • Avatar: 44×44 rounded-full from imageUrl. If imageUrl is empty, render the neutral Slate-200 circle (already styled in the scaffold).
      • Name in Inter 15px weight 500, color Ink.
      • Role + publish date on a second line: JetBrains Mono 13px letter-spacing 0.02em color Slate-500.
      • Date format: "15 September 2026" — never relative ("3 days ago"), never US-format ("Sep 15, 2026").
    tone: editorial
    lengthHint: two lines
    required: true
    slots: [authorPersonId, publishedAt]

  - name: Lead paragraph
    guidance: |-
      The opener. Two sentences maximum, set in body-lg (20px Aeonik Pro 400 / 1.55, color Ink).
      • Sentence 1: state the argument the post will make. Not the topic — the argument. "Software of unknown provenance is the single most common non-conformity at first surveillance audit" is an argument; "This post discusses software provenance" is not.
      • Sentence 2: name the reader and what changes for them by the end of the piece.
      • Voice: confident, active, plain English. Contractions are fine ("here's what you need"). Address manufacturers as "you"; refer to patients in the third person ("the people who need it", "clinicians") — never "end-users".
      • Run against guardrail/no-safety-claims-without-scope — no bare "safe" or "certified" claims without a scope in the same sentence.
    tone: confident, active, plain
    lengthHint: 2 sentences
    required: true
    slots: [lead]

  - name: Body
    guidance: |-
      Main prose.
      • Default text: 17px Inter 400 / 1.7, color Ink. Max measure 68ch — set max-width on the prose container.
      • Section headings: h2 in Aeonik Pro 500 at 28px / 1.2 / -0.01em; h3 in Aeonik Pro 500 at 20px / 1.3. Color: Ink.
      • Every regulatory statement cites the clause. Apply guideline/cite-the-standard rigorously. Render clause references in <code> — the scaffold styles them in JetBrains Mono on Slate-100. Examples: <code>IEC 62304 §5.7.2</code>, <code>ISO 14971 §7.4</code>, <code>EU MDR Annex II §3</code>.
      • Blockquote for extracted regulatory text: use plain <blockquote>. Reserve blockquote.pullquote (styled elsewhere) for the pull-quote section.
      • Source every claim from facet/knowledge (regulatory-landscape) or facet/product items. Do not invent standards, clause numbers, or dates.
      • Apply EVERY guardrail. Rewrite until block-severity items have zero matches. Apply EVERY guideline whose scope matches editorial/regulatory content.
    tone: confident, plain, cited
    lengthHint: 700–1400 words
    required: true
    slots: [bodyMarkdown]

  - name: Pull quote
    guidance: |-
      One per post maximum. Optional — often skipped on standards-explainer posts, occasionally used on opinion pieces.
      • Style: Aeonik Pro 28px weight 500, color Ink, border-left 3px solid Scarlet (#FF4747), padding-left 24px, margin 56px 0, max-width 36ch. Not italic — Aeonik does not have a strong italic and the weight step carries the emphasis.
      • Attribution: JetBrains Mono 12px UPPERCASE Slate-500, prefixed with "—". Format: "— DR ELEANOR VANCE, HEAD OF REVIEWS".
      • Source: if attributing to a person from facet/person, embed person.quote VERBATIM (never paraphrase). Otherwise quote a source cited elsewhere in the post — do not invent quotes.
    tone: measured
    lengthHint: 1–2 sentences
    required: false
    slots: [quote, attributionPersonId]

  - name: Mid-post CTA
    guidance: |-
      Optional inline CTA card, placed roughly two-thirds through the body. On regulatory posts this card usually points to the standards register or a specific product page — NOT to a marketing conversion.
      • Card background: palette token "Card" (#FFFFFF) on top of Paper. 1px border in Slate-200. Padding 28px. Border-radius 6px.
      • Eyebrow: JetBrains Mono 12px UPPERCASE in Slate-500.
      • Heading: Aeonik Pro 22px weight 500 in Ink. Names what the reader will get (e.g. "The current EU MDR / EU AI Act interaction table").
      • Button: filled with Scarlet (#FF4747), white text, Aeonik Pro 15px weight 500, padding 12px 22px, rounded 4px. Hover state swaps to Ink. This is the single per-page use of the Scarlet accent — do not also use Scarlet in the pull quote if you use it here.
      • Apply guideline/cite-the-standard — the CTA copy names what specific document is behind the link.
    tone: measured
    lengthHint: headline ≤10 words; button label ≤3 words
    required: false
    slots: [ctaEyebrow, ctaHeadline, ctaBody, ctaButtonText, ctaUrl]

  - name: Closing
    guidance: |-
      Final paragraph. Restates the argument from the hero in different words and ends with the specific next step (link to the standards register, a certification page, or a review file).
      • Style: 17px Inter 400 / 1.7, color Slate-700.
      • Two sentences max; the second is the next-step link.
    tone: precise, direct
    lengthHint: 2 sentences
    required: true
    slots: [closing, nextStepUrl]

  - name: Citations
    guidance: |-
      Numbered list of every source cited in the piece — standards, regulations, peer-reviewed studies, or completed Scarlet reviews.
      • Render as an <ol> in JetBrains Mono 14px on Slate-700.
      • Each entry: full document identifier, section reference if cited, and hyperlink where available.
      • Source order matches order of first appearance in the body — reader can trace a claim to its citation by scanning down.
      • Do not include general-purpose web pages that were not cited in the body. This list is the audit trail, not further reading.
    tone: bibliographic
    lengthHint: 3–10 entries
    required: true
    slots: [citations]

  - name: Footer
    guidance: |-
      Site-wide footer at the end of the page.
      • Background: palette token "Ink" (#0A0908).
      • Logo: render logo/primary asset variant=wordmark-on-dark verbatim.
      • Text: JetBrains Mono 12px UPPERCASE letter-spacing 0.06em, color #C9CDD2.
      • Include a copyright line and a single link row (standards register, services, contact).
      • Include the standing legal disclaimer: "Scarlet is a Notified Body under Regulation (EU) 2017/745. This publication is guidance only and does not constitute a certification decision." — verbatim, in JetBrains Mono 12px color #7C838C.
    tone: utilitarian, compliant
    lengthHint: 3 lines + disclaimer
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
   - Colours: only hex codes from `palette.colors[].hex`. Never invent, never approximate, never use a colour name without resolving the hex.
   - Fonts: inline `typography.typefaces[].source.cssImport` in `<head>` exactly as provided.
   - Logos: only `logo.assets[].url` strings. Never construct `scarletmd.com/...` or any other URL.
5. **Slot resolution.** Every `{{slot}}` referenced in section guidance must be filled with real content. No `{{...}}` placeholders, no Lorem Ipsum, no `<!-- TODO -->` comments, no `[bracketed-instruction-text]`.
6. **Citations are the audit trail.** The Citations section is required. If a claim cannot be sourced to a standard, regulation, peer-reviewed study, or completed Scarlet review, the claim comes out of the post — not into the citations list.

## Why HTML

This template renders to a previewable artifact in Claude.ai (which adds an "Open in new tab" affordance) and a copy-paste-ready document in Claude Desktop. Markdown output, prose summaries, or fragmentary HTML defeat both.

## Resolution order for AI agents

When an AI tool generates output from this template, resolve every reference against the live Scarlet brand kit via MCP **before** rendering:

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, primary author (Dr Vance), guardrails, and the aiInstructions for every facet in one shot.
2. For any section that mentions a specific item id (`logo/primary`, `typography/default`, `palette/default`, `guideline/cite-the-standard`, `guardrail/no-safety-claims-without-scope`, `knowledge/regulatory-landscape`), call `brain_get_item` to get the full content.
3. Inject typography's `cssImport` into the document head verbatim. Use family names + stacks from typography/default. Apply scale steps by their fontSize/lineHeight/fontWeight/letterSpacing exactly.
4. Use palette colors by their named tokens — never substitute.

## Hard rules

- **Argument, not topic, in the hero.** The headline states the position the post takes. "Software of unknown provenance is the single most common surveillance-audit non-conformity" — not "Software of unknown provenance".
- **Every clause reference in `<code>`.** The mono treatment is what signals to the reader that the reference is citable. Bare "IEC 62304" in prose reads as paraphrase; `<code>IEC 62304 §5.3.4</code>` reads as citation.
- **No bare safety claims.** Every "safe", "trusted", "approved", "validated" statement carries a scope in the same sentence. See `guardrail/no-safety-claims-without-scope`.
- **Author is named.** Byline is a real person from `facet/person`. Default: `person/dr-eleanor-vance`.
- **Scarlet accent appears once, at most.** In the CTA eyebrow or the pull-quote border, not both. Every other accent is Ink.
- **Citations list is complete.** Every clause cited in the body appears in the Citations list with its full document identifier and link.
- **Contractions are fine in headlines and lead.** "Here's what changed" reads as human; "This document sets out the changes" reads as legalese. Keep the register plain in the outer voice — the citations underneath do the regulatory work.

## Variants

- **Standards explainer** — Headline names the standard; body walks the clauses. All sections required except pull quote and mid-post CTA. 900–1400 words.
- **Review-file digest** — Anonymised summary of a completed certification. Headline names the class of finding. Body walks the finding, the standard cited, and the manufacturer's remediation pattern. Pull quote pulls from the review letter (with client permission). 700–1100 words.
- **Opinion piece** — Headline states the position. Body defends it against the strongest counter-argument the author can construct. Pull quote required. 800–1200 words.
