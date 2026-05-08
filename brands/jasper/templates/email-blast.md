---
id: email-blast
name: Email blast
description: Marketing email for the Jasper subscriber list — launches, announcements, content drops. References the canonical brand voice, type, palette, and logo, and respects email-client constraints.
format: email
renderAs: html-email
tags: [email, lifecycle, marketing]
scaffold: |-
  <!-- Subject: {{subject}} -->
  <!-- Preview: {{preview}} -->
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{subject}}</title>
    <style>
      /* Fallback only — most clients strip <style>. Inline styles below do the work. */
      @media (prefers-color-scheme: dark) {
        body { background: #0c0a09 !important; }
        .surface { background: #0c0a09 !important; }
        .ink { color: #fafaf9 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#fafaf9;font-family:Inter,ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <!-- Preview-text spacer (hidden but used by Gmail/iOS Mail) -->
    <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">{{preview}}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafaf9;" class="surface">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header logo -->
          <tr><td align="center" style="padding:32px 24px;">
            <img src="{{logoUrl}}" alt="{{brandName}}" width="96" style="display:block;width:96px;height:auto;">
          </td></tr>

          <!-- Hero block -->
          <tr><td style="padding:0 24px 16px 24px;">
            <h1 style="margin:0 0 12px 0;font-family:'Feature Display',Georgia,serif;font-size:48px;line-height:1.1;font-weight:300;letter-spacing:-0.02em;color:#0c0a09;" class="ink">{{headline}}</h1>
            <p style="margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:18px;line-height:1.6;font-weight:400;color:#44403c;">{{subhead}}</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;line-height:1.5;color:#0c0a09;" class="ink">
            {{bodyHtml}}
          </td></tr>

          <!-- Primary CTA -->
          <tr><td align="center" style="padding:16px 24px 32px 24px;">
            <a href="{{ctaUrl}}" style="display:inline-block;background:#FA4028;color:#fafaf9;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:16px;font-weight:500;text-decoration:none;padding:12px 24px;border-radius:999px;">{{ctaLabel}}</a>
            <p style="margin:16px 0 0 0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;color:#78716c;">
              Or follow this link: <a href="{{ctaUrl}}" style="color:#FA4028;">{{ctaUrl}}</a>
            </p>
          </td></tr>

          <!-- Postscript (optional — remove this row if not used) -->
          <tr><td style="padding:0 24px 32px 24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.5;color:#44403c;font-style:italic;">
            {{postscript}}
          </td></tr>

          <!-- Footer -->
          <tr><td style="background:#e7e5e4;padding:24px;text-align:center;font-family:Inter,ui-sans-serif,system-ui,sans-serif;font-size:12px;line-height:1.4;font-weight:500;letter-spacing:0.04em;text-transform:uppercase;color:#78716c;">
            <img src="{{logoUrl}}" alt="{{brandName}}" width="64" style="display:block;width:64px;height:auto;margin:0 auto 12px auto;">
            <p style="margin:0 0 8px 0;">{{physicalAddress}}</p>
            <p style="margin:0;">
              <a href="{{unsubscribeUrl}}" style="color:#78716c;">Unsubscribe</a>
              &nbsp;·&nbsp;
              <a href="{{viewInBrowserUrl}}" style="color:#78716c;">View in browser</a>
            </p>
            <p style="margin:12px 0 0 0;color:#a8a29e;text-transform:none;letter-spacing:0;font-style:normal;">{{legalDisclaimer}}</p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>
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
      • Headline uses `h1` step (48px / 1.1 / 300 / -0.02em) in typography/default role=display (Feature Display). Color: palette token "Ink".
      • Subhead uses `body-lg` (18px / 1.6 / 400) role=primary (Inter). Color: palette token "Stone-700".
      • Outcome-led headline per guideline/lead-with-outcome.
      • IMPORTANT: include a web-safe fallback stack (`ui-sans-serif, system-ui, sans-serif`) inline for clients that strip @import. Use typography/default cssImport verbatim AND keep the inline fallback on every element.
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
      • Pill-shaped button: filled with palette token "Brand" (#FA4028), text in palette token "Surface" (#fafaf9).
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

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML email document. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. No summary, no "here's the email". The fence opens, the doc renders, the fence closes. End of response.
2. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
3. **Email-client compatible.**
   - All critical styling lives on each element as inline `style="..."` attributes — most clients strip `<style>` blocks. A `<style>` block in `<head>` is allowed as a fallback only.
   - Use absolute `https://` URLs for all assets. Never relative paths.
   - Provide a `<title>` that matches the subject line.
   - Include a `<meta name="viewport" content="width=device-width, initial-scale=1">` and a `<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">` in `<head>`.
4. **Resolve every brand-kit reference VERBATIM.**
   - Colours: only hex codes from `palette.colors[].hex`. Never invent a value.
   - Fonts: include the typography `cssImport` in `<head>` AND specify a web-safe inline fallback stack on every element using the brand font (`font-family: 'Feature Display', Georgia, serif`).
   - Logos: only `logo.assets[].url` strings, absolute `https://` URLs.
5. **Required structure.** Subject line as a comment at the top of the doc inside the fence: `<!-- Subject: ... -->` and `<!-- Preview: ... -->`. Then the document. Required body sections per `sections[]`: header logo, hero block, body, primary CTA, footer with unsubscribe + physical address.
6. **Slot resolution.** Every `{{slot}}` filled. No Lorem Ipsum, no `<!-- TODO -->`, no `[address-here]` placeholders. If `physicalAddress` or `unsubscribeUrl` weren't supplied, ask for them — do not invent them.
7. **Pre-return self-check.** Before finalising:
   - First non-whitespace of response is the ```html fence.
   - First non-whitespace inside the fence is `<!-- Subject: ... -->` followed by `<!-- Preview: ... -->` followed by `<!doctype html>`.
   - Exactly one ```html fence pair in the response.
   - Every colour hex appears in the brand kit palette.
   - Every URL is `https://...` and points to either `logo.assets[].url` or a CTA URL the user supplied.
   - Unsubscribe link present and points to the URL the user supplied.

If you cannot satisfy all seven rules, do not return — ask the user for the missing input first.

## Why HTML

This template renders to a previewable artifact in Claude.ai (which adds an "Open in new tab" affordance for cross-checking layout in Safari) and a copy-paste-ready email document in Claude Desktop. Markdown output, prose summaries, or partial HTML break both surfaces.

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
