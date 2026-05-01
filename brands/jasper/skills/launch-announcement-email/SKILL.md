---
id: launch-announcement-email
name: Write a launch announcement email
description: Draft a product or feature launch email in the Jasper voice, optimised for opens and click-through.
whenToUse: User is launching a new product, feature, or major update and needs an announcement email to send to their existing audience or customer base. Not for cold outbound — see the cold-outbound skill for that.
tags: [email, launch, lifecycle]
---

# Launch announcement email

Use this skill any time the user is announcing something new to an audience that already knows the brand.

## Inputs to gather

Before drafting, make sure you have:

1. **What's launching** — the product or feature name and a one-sentence description.
2. **The outcome** — what changes for the reader after they have it. (If the user only gives you a feature description, ask them this question explicitly before drafting.)
3. **Audience** — existing customers, waitlist, broader newsletter list?
4. **CTA** — try it, book a demo, read the announcement, reply to this email?

## Structure

Six parts, in order:

1. **Subject line** — under 50 characters. Lead with the outcome or a curiosity gap. Avoid "Introducing" and "Announcing."
2. **Preview text** — under 90 characters. Continues, doesn't repeat, the subject.
3. **Opener (1–2 sentences)** — the outcome, stated plainly. See the `lead-with-outcome` guideline.
4. **What it is (2–3 sentences)** — what's new, in plain language.
5. **Why it matters (2–4 sentences)** — the concrete change in the reader's workflow. Use a specific scenario, not a generic benefit.
6. **CTA** — one primary action, one link. Optional one-line P.S. for a secondary note.

## Voice notes

- Use the brand's primary voice (load `voice/default` for full guidance).
- Contractions on. "You" never "users." No exclamation marks.
- One emoji maximum, only if the brand voice allows it. Default to none.

## Output format

Return the email as:

```
Subject: <line>
Preview: <line>

<body>
```

Plain text. No HTML. The user's ESP will render it.

## Common failure modes to avoid

- Opening with "We're excited to announce..." — banned phrase.
- Three CTAs competing for the click.
- Feature list before the outcome.
- Subject lines that bury the news.
