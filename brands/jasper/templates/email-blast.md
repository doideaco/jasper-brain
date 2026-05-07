---
id: email-blast
name: Email blast
description: Marketing email for the Jasper subscriber list — launches, announcements, content drops. References the canonical brand voice, type, palette, and logo, and respects email-client constraints.
format: email
tags: [email, lifecycle, marketing]
sections:
  - name: Subject line
    guidance: |-
      The single highest-leverage line in the whole email.
      • Under 50 characters. Renders fully on iOS Mail and Gmail mobile.
      • Lead with the outcome (guideline/lead-with-outcome) OR a curiosity gap. Banned openers: "Introducing…", "Announcing…", "We're excited to…".
      • Voice: voice/default. No exclamation marks. No emoji unless the brand voice explicitly allows them — voice/default forbids them by default.
      • Run guardrail/no-unverified-stats — never put a fabricated number in the subject.
    tone: confident, plain
    lengthHint: ≤50 characters
    required: true
    slots: [subject]

  - name: Preview text
    guidance: |-
      The preheader Gmail/iOS Mail show next to the subject. Continue, don't repeat, the subject.
      • Under 90 characters. Anything longer truncates.
      • Voice/default rules apply. Reads naturally as the sentence that follows the subject.
    tone: confident
    lengthHint: ≤90 characters
    required: true
    slots: [preview]

  - name: Header logo
    guidance: |-
      Email header band.
      • Background: palette/default token "Surface" (#fafaf9). For dark-mode aware clients, also supply the dark variant — palette token "Ink" with logo/primary asset variant=wordmark-on-dark.
      • Logo: render logo/primary asset variant=wordmark-on-light at 96px wide (don't go below logo.minSize).
      • Padding: 32px top/bottom, 24px sides. Centred.
      • IMPORTANT: use absolute https URLs for the logo asset — relative URLs break in email clients. Use logo.assets[].url verbatim from MCP.
    tone: utilitarian
    lengthHint: layout only
    required: true
    slots: []

  - name: Hero block
    guidance: |-
      The opening message.
      • Headline uses `h1` step (48px / 1.1 / 600 / -0.02em) in typography/default role=display (Tiempos Headline). Color: palette token "Ink".
      • Subhead uses `body-lg` (18px / 1.6 / 400) role=primary (Inter). Color: palette token "Stone-700".
      • Outcome-led headline per guideline/lead-with-outcome.
      • IMPORTANT: include a CSS @font-face fallback with web-safe `Georgia, serif` for clients that strip @import. Use typography/default cssImport verbatim AND a fallback inline.
    tone: confident, plain
    lengthHint: headline ≤10 words; subhead one sentence
    required: true
    slots: [headline, subhead]

  - name: Body
    guidance: |-
      The actual message.
      • Default text: `body` step (16px / 1.5 / 400 Inter), color "Ink", max-width: 600px (the de-facto email max width).
      • Subheadings if needed: `h3` (24px / 1.25 / 600) role=primary, color "Ink".
      • Apply voice/default — short, medium, short sentence rhythm. Contractions on. Address as "you".
      • Apply EVERY guideline whose scope matches outbound marketing. Apply EVERY guardrail; rewrite until block-severity items have zero matches.
      • For announcements: 3 short paragraphs maximum. Lead with the outcome, name the change in concrete terms, end with what the reader does next.
      • No images mid-body unless the email is photo-led — they break in many clients and slow load.
    tone: confident, helpful
    lengthHint: 80–200 words for announcements; up to 400 for content drops
    required: true
    slots: [bodyMarkdown]

  - name: Primary CTA
    guidance: |-
      One button. One destination.
      • Pill-shaped button: filled with palette token "Brand" (#7c3aed), text in palette token "Surface" (#fafaf9).
      • `body` step Inter weight 500. Padding: 12px 24px. Border-radius: 999px (full pill).
      • Centred horizontally with 32px margin top/bottom.
      • Button label is outcome-led, ≤4 words. "See how it works" / "Start a 14-day trial" / "Read the announcement".
      • Apply guardrail/no-unverified-stats — no claims with numbers in button copy.
      • IMPORTANT: provide an explicit fallback `<a>` text link below the button for plain-text email clients.
    tone: direct
    lengthHint: button label ≤4 words
    required: true
    slots: [ctaLabel, ctaUrl]

  - name: Postscript
    guidance: |-
      Optional one-line P.S. below the CTA.
      • Used for a secondary low-commitment ask ("reply if you have questions") OR a friendly aside.
      • `body-sm` step (14px / 1.5 / 400) role=primary, color "Stone-700".
      • Italic if it reads as voice/aside; regular if informational.
      • One line max — never two.
    tone: warm
    lengthHint: 1 sentence
    required: false
    slots: [postscript]

  - name: Footer
    guidance: |-
      Site-wide email footer.
      • Background: palette token "Stone-200" (#e7e5e4) for separation from body.
      • Logo: logo/primary asset variant=wordmark-on-light at 64px wide.
      • Type: `caption` step (12px / 1.4 / 500 / 0.04em UPPERCASE) role=primary (Inter), color "Stone-500".
      • Required: physical mailing address (CAN-SPAM), unsubscribe link, view-in-browser link.
      • If facet/guardrail or facet/compliance items match the email's claims, append the disclaimer text VERBATIM at the bottom in `caption` step.
      • Unsubscribe link MUST be a real one-click unsubscribe — RFC 8058 compliant.
    tone: utilitarian
    lengthHint: 3 lines + disclaimer if applicable
    required: true
    slots: [physicalAddress, unsubscribeUrl, viewInBrowserUrl, legalDisclaimer]
---

# Email blast template — usage rules

## Resolution order for AI agents

When generating the email from this template, resolve every reference against the live brand kit via MCP **before** rendering:

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, guardrails, and aiInstructions in one shot.
2. For specific item references (`logo/primary`, `typography/default`, `palette/default`, `voice/default`, `guideline/lead-with-outcome`, `guardrail/no-unverified-stats`), call `brain_get_item` for full content.
3. Use absolute `https://` URLs for ALL assets — relative URLs break in email clients.
4. Inline every style — most email clients strip `<style>` blocks. typography.cssImport is a fallback only; the actual rendering uses inline `style=` attributes on each element with the resolved family/size/weight/color.

## Hard rules

- **Subject + preview together tell the whole story.** A reader who only sees those two lines should know what changed for them.
- **One CTA. One link.** Multiple CTAs split the click. Multiple links train readers to scan, not act.
- **Outcome-led everywhere.** Subject, headline, lead, button label — all answer "what becomes true for me?". Apply `guideline/lead-with-outcome`.
- **No invented numbers.** Especially in the subject — fabricated stats in subjects damage list health long-term. See `guardrail/no-unverified-stats`.
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.
- **Email-client compatibility.**
  - Inline all critical styles. `<style>` is best-effort.
  - Use absolute https URLs for images.
  - Provide a plain-text alternative — render a text version that strips images, layout, and code, keeping subject + preview + body + CTA URL.
  - Test in Gmail (web + iOS) and Apple Mail at minimum.

## Variants

- **Launch announcement** — Full template. Body 100–200 words. Single primary CTA = "Try it" / "Read the announcement".
- **Content drop** — Replace the hero block headline with the content title. Body 60–120 words summarising the piece. CTA = "Read it" linking to the content.
- **Lifecycle / nurture** — Skip the postscript. Body 80–150 words. CTA = a single next step inside the product.
- **Plain-text variant** — For high-deliverability lists. Strip the header, footer, and styled CTA. Render subject + lead + body + plain `<a>` link as the CTA. Voice rules unchanged.
