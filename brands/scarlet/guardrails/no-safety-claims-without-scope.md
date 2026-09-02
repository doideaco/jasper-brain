---
id: no-safety-claims-without-scope
name: No safety claims without the scope of certification
description: Any claim that a certified device is "safe", "trusted", "clinically validated", "approved" or similar MUST be accompanied by the specific scope of certification (population, intended use, standards assessed, and the certification ID). A bare safety claim is a block-level violation.
severity: block
tags: [publications, marketing, review-reports]
scope: Any Scarlet-branded output that describes a certified device — website copy, blog posts, press quotes, product-page snippets, LinkedIn content, or a manufacturer's landing page that uses a Scarlet quote.
violations:
  - '"Scarlet-certified means clinically safe."'
  - '"Certified by Scarlet — trusted by clinicians worldwide."'
  - '"Approved for hospital use by Scarlet."'
  - '"Scarlet has validated this device as safe for patients."'
  - '"This is a fully certified AI diagnostic."'
compliant:
  - '"Scarlet has certified DeepRadiology-1 (certification SCR-2026-0117) for use in the adult chest-X-ray triage indication, assessed against IEC 62304, ISO 14971, and EU MDR Annex II. Paediatric use is outside the scope of this certification."'
  - '"Scarlet reviewed the device''s clinical evaluation report and post-market surveillance plan; certification remains valid pending the next surveillance audit on 2026-09-15."'
  - '"Certification SCR-2025-0092 covers the drug-interaction module only. Scarlet has not assessed the natural-language triage feature."'
---

# Why this guardrail exists

A bare safety claim from a Notified Body is the single most consequential statement any medical-device organisation can make. Every certification is bounded — by population, by intended use, by the version of the software that was assessed, and by the standards it was audited against. Detaching a "safe" or "certified" claim from those bounds converts a scoped audit into an unbounded endorsement, which is:

1. A legal risk to Scarlet under EU MDR Article 46 (obligations of notified bodies).
2. A patient-safety risk when the device is used outside the scope its certification covered.
3. A market-integrity risk that harms manufacturers who *do* keep their scope explicit.

## How to satisfy it

Every safety-adjacent claim must resolve to:

- **A certification ID.** From facet/product or the review record. Format: `SCR-YYYY-NNNN`.
- **The scope**: population, intended use, indication.
- **The standards.** The clauses actually assessed (e.g. IEC 62304, ISO 14971, EU MDR Annex II).
- **The audit boundary.** What was *not* assessed. If a feature was excluded, name it.

If any of the four is missing, do not publish — rewrite to remove the claim or add the missing anchor.

## Rewriting patterns

- Replace **"safe"** with **"certified for [indication] under [standard]"**.
- Replace **"trusted"** with **"reviewed and certified by [reviewer name], [date]"**.
- Replace **"approved"** with **"conforms to [regulation/standard] within the scope of [certification ID]"**.
- Replace **"clinically validated"** with **"assessed against [clinical evidence standard clause]"** — validation is a technical term with specific meaning; certification is not validation.

The correction is almost always to add scope, not to remove the claim.
