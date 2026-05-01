---
id: product-landing-page
name: Product landing page
description: Tool-agnostic structure for a single-product landing page. Renders in any CMS, design tool, or AI editor.
format: landing-page
tags: [web, conversion]
sections:
  - name: Hero
    guidance: One outcome-led headline (under 12 words), one subhead (one sentence) that names the audience and the change, and one primary CTA. Optional secondary CTA for a lower-commitment action like "see how it works."
    tone: Confident, plain.
    lengthHint: Headline under 12 words; subhead one sentence.
    required: true
    slots: [headline, subhead, primaryCta, secondaryCta]
  - name: Problem
    guidance: Name the specific frustration the reader has today, in their words. Two to three sentences. No statistics here — this is a recognition moment, not a proof point.
    lengthHint: 2–3 sentences.
    required: true
    slots: [problemStatement]
  - name: Solution
    guidance: Show the product solving the problem in three short beats. Each beat is a verb-led phrase plus one sentence of detail. Pair with a screenshot, loom, or animated demo.
    lengthHint: Three beats, ~20 words each.
    required: true
    slots: [beat1, beat2, beat3, mediaCaption]
  - name: Social proof
    guidance: One headline customer quote with name, role, and company. Optional row of customer logos beneath.
    tone: Let the customer's voice come through — do not over-edit the quote.
    required: true
    slots: [quote, customerName, customerRole, customerCompany, logos]
  - name: Feature deep-dive
    guidance: Three to five features, each with a short name, one-sentence outcome, and a one-paragraph explanation. Outcome first, mechanism second — see the lead-with-outcome guideline.
    lengthHint: 3–5 features.
    required: false
    slots: [features]
  - name: FAQ
    guidance: Four to six questions a buyer would actually ask before purchasing. Pricing, security, integrations, onboarding time. Skip questions only the marketing team cares about.
    required: false
    slots: [faqs]
  - name: Final CTA
    guidance: Restate the outcome from the hero in different words, then the same primary CTA. Add a single trust line beneath (e.g. "No credit card required. Cancel anytime.").
    lengthHint: One sentence + CTA + trust line.
    required: true
    slots: [restatedOutcome, primaryCta, trustLine]
---

This template is intentionally tool-agnostic. Any renderer (Jasper editor, Webflow, a Next.js page, a design tool, or an LLM via MCP) can consume the section list and fill the slots.

Render order is the section order above. The `required: false` sections may be omitted for short-form variants.
