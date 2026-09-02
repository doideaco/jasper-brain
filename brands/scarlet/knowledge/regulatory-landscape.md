---
id: regulatory-landscape
name: The regulatory landscape for AI medical devices
description: The canonical set of standards, regulations, and guidance documents Scarlet assesses AI medical devices against. Every Scarlet publication citing a rule must reference one of these documents.
tags: [regulation, standards, canonical]
sources:
  - title: EU MDR (Regulation 2017/745)
    url: https://eur-lex.europa.eu/eli/reg/2017/745/oj
  - title: EU AI Act (Regulation 2024/1689)
    url: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
  - title: IEC 62304 — Medical device software life cycle processes
    url: https://webstore.iec.ch/publication/22794
  - title: ISO 14971 — Application of risk management to medical devices
    url: https://www.iso.org/standard/72704.html
  - title: IEC 82304-1 — Health software (general requirements for product safety)
    url: https://webstore.iec.ch/publication/24700
  - title: FDA 21 CFR Part 820 (Quality System Regulation)
    url: https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820
  - title: FDA Guidance — Software as a Medical Device (SaMD) Clinical Evaluation
    url: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation
  - title: MDCG 2019-11 — Guidance on Qualification and Classification of Software
    url: https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_qualification_classification_software_en_0.pdf
---

# What we assess against

## European Union

- **EU MDR (2017/745)** — The Medical Device Regulation. Software qualifying as a medical device is classified under Rule 11 of Annex VIII, which pushes most AI diagnostics into Class IIa or higher and therefore into the mandatory Notified Body conformity assessment route (Annex IX or Annex XI).
- **EU AI Act (2024/1689)** — Applies in parallel. Most AI medical devices fall into the "high-risk" category under Annex III §5 (medical devices are called out explicitly). The conformity assessment path for these high-risk systems is aligned with the MDR route via Article 43 §3 — meaning the MDR Notified Body is the single point of contact.
- **MDCG 2019-11** — The Medical Device Coordination Group guidance clarifying when software qualifies as a medical device (Rule 11 boundary cases) and when a wellness app does not. This is the current authoritative text for classification disputes.

## Software lifecycle and risk

- **IEC 62304** — The software lifecycle standard. Introduces the concept of *software safety class* (A / B / C) and mandates specific process controls at each class. AI systems whose failure could contribute to serious injury or death fall into Class C and inherit the fullest set of process requirements (§5–§9).
- **ISO 14971** — The risk management standard. Every AI medical device requires a risk file that traces hazards → hazardous situations → harm, with residual-risk evaluations (§7) and post-production information feedback (§10).
- **IEC 82304-1** — The general safety standard for health software (i.e. software that is not part of a hardware device). Sits above IEC 62304 for standalone software products.

## United States

- **FDA 21 CFR Part 820** — The quality system regulation. Design controls (§820.30) are the section most heavily invoked in AI-device 510(k) submissions.
- **FDA SaMD Clinical Evaluation Guidance** — The FDA's adopted version of the IMDRF (International Medical Device Regulators Forum) framework. Distinguishes valid clinical association, analytical validation, and clinical validation as three separable evidence layers — a distinction that is central to any SaMD submission.

## Things Scarlet does NOT claim

- Scarlet is a Notified Body under EU MDR; it is **not** an FDA-recognised third-party certification body. FDA submissions are the manufacturer's responsibility. Scarlet can advise on the harmonised standards but cannot issue a US clearance.
- Scarlet does **not** issue CE marks. The manufacturer issues the CE mark; Scarlet issues the certificate of conformity that the manufacturer relies on to affix the CE mark.
- Scarlet does **not** underwrite clinical performance. The certification confirms that the manufacturer's clinical evaluation meets the standard — not that any individual patient outcome will follow.
