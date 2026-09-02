---
id: cite-the-standard
name: Cite the standard
description: Every regulatory statement in a Scarlet publication names the exact clause it comes from — IEC / ISO / EU MDR / FDA — and renders that citation in the mono typeface so the reader can see it is a citable object, not paraphrase.
tags: [publications, blog, review-reports]
scope: Any Scarlet-authored writing that makes a claim about what a manufacturer must do, what a device must contain, or what a review will check. Blog posts, standards guidance, review reports, LinkedIn posts.
examples:
  do:
    - '"Software of unknown provenance must be evaluated to `IEC 62304 §5.3.4`, including a documented rationale for the classification of the software safety class."'
    - '"A risk file that omits the residual-risk evaluation required by `ISO 14971 §7.4` will result in a non-conformity at first surveillance audit."'
    - '"General-purpose AI systems that fall within Annex III use cases are subject to the transparency obligations in `EU AI Act Art. 50` and, where they are also a medical device, the conformity assessment route of `EU MDR Annex IX`."'
  dont:
    - '"The relevant standard requires manufacturers to document their software provenance."'
    - '"Risk management should follow ISO 14971."'
    - '"AI medical devices must meet the requirements of the EU AI Act and the MDR."'
    - '"Best practice is to include a residual-risk evaluation."'
---

# Why this guideline exists

A Scarlet reader — whether a manufacturer's regulatory-affairs lead, a competing Notified Body, or a Medical Device Coordination Group official — needs to be able to trace every claim back to a source in one click. Paraphrased regulatory language is worse than useless; it invites arguments about interpretation that the actual clause resolves in one line.

## How to apply

Every regulatory or technical statement in a Scarlet publication must:

1. **Name the standard.** Full document identifier: `IEC 62304`, `ISO 14971`, `EU MDR (2017/745)`, `EU AI Act (2024/1689)`, `FDA 21 CFR 820.30`. Not "the software lifecycle standard".
2. **Name the clause.** Section number: `§5.3.4`, `Annex II §3`, `Art. 50`. Not "the risk-management section".
3. **Render the citation in the mono typeface** (`<code>` in the scaffold's rendered CSS). The mono treatment signals to the reader that this is an addressable object they can look up.
4. **Prefer the specific clause over the whole document.** "The standard requires X" is a paraphrase; "§5.3.4 requires X" is a citation.

## The mono treatment

In every Scarlet template's scaffold, `<code>` is styled in JetBrains Mono at the body size with a subtle Slate-100 background. Reader sees `IEC 62304 §5.3.4` and reads it as citable.

## When paraphrase is acceptable

- In an opening paragraph that is *summarising* what the piece will cover ("This post walks through the risk-management expectations at surveillance audit."). Not for any statement of what a manufacturer must actually do.
- In a headline. Headlines carry the argument; the body carries the citations.

The rule of thumb: if a competitor's regulatory-affairs lead read this sentence out loud in a compliance meeting, could they defend it against a challenge without leaving the paragraph? If not, the citation is missing.
