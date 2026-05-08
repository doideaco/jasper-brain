---
id: pitch-deck
name: Pitch deck
description: Investor / executive pitch deck rendered as an interactive HTML5 slide presentation. 9 slides — cover, mission, problem, solution, how it works, traction, team, product, closing. Keyboard navigation (← → space), speaker notes drawer (n), light/dark theme toggle (t), print-aware (⌘P → real PDF).
format: pitch-deck
renderAs: html-document
tags: [deck, slides, presentation, pitch, web]
scaffold: |-
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{deckTitle}} — {{brandName}}</title>
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
      [data-theme="dark"] {
        --ink: #fafaf9;
        --stone-700: #d6d3d1;
        --stone-500: #a8a29e;
        --stone-200: #292524;
        --stone-100: #1c1917;
        --surface: #0c0a09;
        --card: #1c1917;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        height: 100vh;
        overflow: hidden;
        background: var(--surface);
        color: var(--ink);
        font-family: var(--body-family);
        transition: background 200ms ease, color 200ms ease;
      }
      .deck { width: 100vw; height: 100vh; position: relative; overflow: hidden; }
      .slide {
        position: absolute;
        inset: 0;
        padding: clamp(48px, 6vw, 96px) clamp(64px, 9vw, 144px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 250ms ease;
      }
      .slide.active { opacity: 1; pointer-events: auto; }
      .slide.cover { justify-content: flex-start; align-items: flex-start; padding-top: clamp(96px, 12vw, 168px); }
      .eyebrow {
        font-family: var(--mono-family);
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--stone-500);
        margin-bottom: 32px;
      }
      h1.display {
        font-family: var(--display-family);
        font-size: clamp(56px, 7vw, 120px);
        line-height: 1.0;
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--ink);
        max-width: 18ch;
      }
      h2.display {
        font-family: var(--display-family);
        font-size: clamp(40px, 5vw, 80px);
        line-height: 1.05;
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--ink);
        max-width: 22ch;
        margin-bottom: 24px;
      }
      .lead {
        font-size: clamp(18px, 1.5vw, 26px);
        line-height: 1.5;
        color: var(--stone-700);
        max-width: 60ch;
      }
      .slide.cover img.logo { height: 60px; width: auto; margin-bottom: 64px; }
      .slide.cover .tagline {
        font-family: var(--display-family);
        font-size: clamp(56px, 7vw, 120px);
        line-height: 1.0;
        font-weight: 300;
        letter-spacing: -0.02em;
        color: var(--ink);
        max-width: 18ch;
      }
      .slide.cover .meta {
        margin-top: 48px;
        font-family: var(--mono-family);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--stone-500);
      }
      .three-up {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 48px;
        margin-top: 48px;
      }
      .step .num {
        font-family: var(--display-family);
        font-size: 64px;
        font-weight: 300;
        color: var(--brand);
        line-height: 1;
        margin-bottom: 16px;
      }
      .step .step-title {
        font-size: 22px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 8px;
      }
      .step .step-body { font-size: 16px; color: var(--stone-700); line-height: 1.5; }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 64px;
        margin-top: 64px;
      }
      .stat .figure {
        font-family: var(--display-family);
        font-size: clamp(72px, 8vw, 144px);
        font-weight: 300;
        letter-spacing: -0.03em;
        line-height: 1;
        color: var(--brand);
      }
      .stat .label { font-size: 18px; color: var(--stone-700); margin-top: 16px; max-width: 24ch; line-height: 1.4; }
      .team {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 48px;
        margin-top: 48px;
      }
      .person img {
        width: 96px;
        height: 96px;
        border-radius: 9999px;
        object-fit: cover;
        margin-bottom: 16px;
        border: 1px solid var(--stone-200);
      }
      .person .name { font-size: 20px; font-weight: 600; color: var(--ink); }
      .person .role { font-size: 16px; color: var(--stone-500); margin-top: 4px; }
      .person .quote { font-size: 14px; color: var(--stone-700); margin-top: 12px; line-height: 1.5; font-style: italic; }
      .cta { margin-top: 48px; }
      .cta a.button {
        display: inline-block;
        background: var(--brand);
        color: #fafaf9;
        font-size: 20px;
        font-weight: 500;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 9999px;
        transition: opacity 150ms;
      }
      .cta a.button:hover { opacity: 0.85; }
      .chrome {
        position: fixed;
        bottom: 24px;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 32px;
        z-index: 10;
        pointer-events: none;
      }
      .chrome .meta-left img { height: 14px; width: auto; opacity: 0.7; }
      .chrome .progress {
        flex: 1;
        max-width: 240px;
        height: 2px;
        background: var(--stone-200);
        border-radius: 1px;
        overflow: hidden;
        margin: 0 32px;
      }
      .chrome .progress .bar { height: 100%; background: var(--brand); width: 0; transition: width 200ms ease; }
      .chrome .meta-right {
        font-family: var(--mono-family);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--stone-500);
      }
      .chrome .meta-right .keys { margin-left: 24px; opacity: 0.55; }
      .notes {
        position: fixed;
        bottom: 0; left: 0; right: 0;
        max-height: 40vh;
        background: #0c0a09;
        color: #fafaf9;
        padding: 24px 48px 32px;
        transform: translateY(100%);
        transition: transform 220ms ease;
        z-index: 20;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.55;
      }
      .notes.open { transform: translateY(0); }
      .notes h3 {
        font-family: var(--mono-family);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.55;
        margin-bottom: 12px;
        font-weight: 500;
      }
      .notes p { opacity: 0.92; max-width: 80ch; }
      .notes p + p { margin-top: 8px; }

      /* Slide-content reveal — staggered fade-up when a slide becomes active. */
      .slide > * {
        opacity: 0;
        transform: translateY(14px);
        transition:
          opacity 600ms cubic-bezier(0.2, 0.8, 0.2, 1),
          transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .slide.active > * { opacity: 1; transform: translateY(0); }
      .slide.active > *:nth-child(1) { transition-delay: 0ms; }
      .slide.active > *:nth-child(2) { transition-delay: 80ms; }
      .slide.active > *:nth-child(3) { transition-delay: 160ms; }
      .slide.active > *:nth-child(4) { transition-delay: 240ms; }
      .slide.active > *:nth-child(5) { transition-delay: 320ms; }
      /* Inner grids (steps / stats / team) also stagger their cards. */
      .three-up > *, .stats > *, .team > * {
        opacity: 0;
        transform: translateY(10px);
        transition:
          opacity 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
          transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .slide.active .three-up > *,
      .slide.active .stats > *,
      .slide.active .team > * {
        opacity: 1;
        transform: translateY(0);
      }
      .slide.active .three-up > *:nth-child(2),
      .slide.active .stats > *:nth-child(2),
      .slide.active .team > *:nth-child(2) { transition-delay: 200ms; }
      .slide.active .three-up > *:nth-child(3),
      .slide.active .stats > *:nth-child(3),
      .slide.active .team > *:nth-child(3) { transition-delay: 350ms; }
      @media (prefers-reduced-motion: reduce) {
        .slide > *,
        .three-up > *, .stats > *, .team > * {
          transition: none;
          transform: none;
        }
      }

      @media print {
        html, body { height: auto; overflow: visible; }
        .chrome, .notes { display: none; }
        .slide {
          position: relative;
          opacity: 1 !important;
          pointer-events: auto !important;
          page-break-after: always;
          height: 100vh;
        }
      }
    </style>
  </head>
  <body data-theme="light">
    <div class="deck" id="deck">

      <section class="slide cover" data-notes="{{coverNotes}}">
        <img class="logo" src="{{logoUrlLight}}" alt="{{brandName}}">
        <div class="tagline">{{tagline}}</div>
        <div class="meta">{{deckOccasion}}</div>
        <!-- Optional cover accent illustration (top-right). REMOVE the entire <img> if no illustration fits. -->
        <img src="{{coverIllustrationUrl}}" alt="" style="position:absolute;top:clamp(48px,6vw,96px);right:clamp(64px,9vw,144px);max-width:200px;height:auto;opacity:0.95;">
      </section>

      <section class="slide" data-notes="{{missionNotes}}">
        <div class="eyebrow">Mission</div>
        <h1 class="display">{{missionStatement}}</h1>
      </section>

      <section class="slide" data-notes="{{problemNotes}}">
        <div class="eyebrow">The problem</div>
        <h2 class="display">{{problemHeadline}}</h2>
        <p class="lead">{{problemBody}}</p>
      </section>

      <section class="slide" data-notes="{{solutionNotes}}">
        <div class="eyebrow">Our answer</div>
        <h2 class="display">{{solutionHeadline}}</h2>
        <p class="lead">{{solutionBody}}</p>
      </section>

      <section class="slide" data-notes="{{howItWorksNotes}}">
        <div class="eyebrow">How it works</div>
        <h2 class="display">{{howItWorksHeadline}}</h2>
        <div class="three-up">
          <div class="step">
            <div class="num">01</div>
            <div class="step-title">{{step1Title}}</div>
            <div class="step-body">{{step1Body}}</div>
          </div>
          <div class="step">
            <div class="num">02</div>
            <div class="step-title">{{step2Title}}</div>
            <div class="step-body">{{step2Body}}</div>
          </div>
          <div class="step">
            <div class="num">03</div>
            <div class="step-title">{{step3Title}}</div>
            <div class="step-body">{{step3Body}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{tractionNotes}}">
        <div class="eyebrow">Traction</div>
        <h2 class="display">{{tractionHeadline}}</h2>
        <div class="stats">
          <div class="stat">
            <div class="figure">{{stat1Figure}}</div>
            <div class="label">{{stat1Label}}</div>
          </div>
          <div class="stat">
            <div class="figure">{{stat2Figure}}</div>
            <div class="label">{{stat2Label}}</div>
          </div>
          <div class="stat">
            <div class="figure">{{stat3Figure}}</div>
            <div class="label">{{stat3Label}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{teamNotes}}">
        <div class="eyebrow">Team</div>
        <h2 class="display">{{teamHeadline}}</h2>
        <div class="team">
          <div class="person">
            <img src="{{person1ImageUrl}}" alt="{{person1Name}}">
            <div class="name">{{person1Name}}</div>
            <div class="role">{{person1Role}}</div>
            <div class="quote">{{person1Quote}}</div>
          </div>
          <div class="person">
            <img src="{{person2ImageUrl}}" alt="{{person2Name}}">
            <div class="name">{{person2Name}}</div>
            <div class="role">{{person2Role}}</div>
            <div class="quote">{{person2Quote}}</div>
          </div>
          <div class="person">
            <img src="{{person3ImageUrl}}" alt="{{person3Name}}">
            <div class="name">{{person3Name}}</div>
            <div class="role">{{person3Role}}</div>
            <div class="quote">{{person3Quote}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{productNotes}}">
        <div class="eyebrow">Product</div>
        <h2 class="display">{{productHeadline}}</h2>
        <p class="lead">{{productBody}}</p>
      </section>

      <section class="slide" data-notes="{{closingNotes}}">
        <div class="eyebrow">{{closingEyebrow}}</div>
        <h1 class="display">{{closingHeadline}}</h1>
        <div class="cta">
          <a class="button" href="{{ctaUrl}}">{{ctaLabel}}</a>
        </div>
      </section>

    </div>

    <div class="chrome">
      <div class="meta-left">
        <img src="{{logoUrlLight}}" alt="{{brandName}}">
      </div>
      <div class="progress"><div class="bar" id="bar"></div></div>
      <div class="meta-right">
        <span id="counter">1 / 1</span>
        <span class="keys">← → space  ·  n notes  ·  t theme</span>
      </div>
    </div>

    <div class="notes" id="notes">
      <h3>Speaker notes</h3>
      <div id="note-content"><p style="opacity:0.5">No speaker notes for this slide.</p></div>
    </div>

    <script>
      (function () {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
        var total = slides.length;
        var counter = document.getElementById('counter');
        var bar = document.getElementById('bar');
        var noteContent = document.getElementById('note-content');
        var notes = document.getElementById('notes');
        var i = 0;

        function escapeHtml(s) {
          return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function go(n) {
          i = Math.max(0, Math.min(total - 1, n));
          for (var k = 0; k < total; k++) {
            slides[k].classList.toggle('active', k === i);
          }
          counter.textContent = (i + 1) + ' / ' + total;
          bar.style.width = ((i + 1) / total * 100) + '%';
          var note = (slides[i].dataset.notes || '').trim();
          if (note) {
            var paras = note.split(/\s*·\s*|\s*\|\s*/);
            noteContent.innerHTML = paras.map(function (p) {
              return '<p>' + escapeHtml(p) + '</p>';
            }).join('');
          } else {
            noteContent.innerHTML = '<p style="opacity:0.5">No speaker notes for this slide.</p>';
          }
        }

        window.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
            e.preventDefault();
            go(i + 1);
          } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            go(i - 1);
          } else if (e.key === 'n' || e.key === 'N') {
            notes.classList.toggle('open');
          } else if (e.key === 't' || e.key === 'T') {
            var b = document.body;
            b.dataset.theme = b.dataset.theme === 'dark' ? 'light' : 'dark';
          } else if (e.key === 'Home') {
            go(0);
          } else if (e.key === 'End') {
            go(total - 1);
          }
        });

        go(0);
      })();
    </script>
  </body>
  </html>
sections:
  - name: Cover
    guidance: |-
      Title slide. Logo, tagline, and the occasion (e.g. "Series A · May 2026" or "All-hands · Q3").
      • {{logoUrlLight}} = logo.assets[].url for the wordmark-on-light variant, verbatim.
      • {{tagline}} = a punchy headline. Pull from brand.tagline if it lands, otherwise compose one in voice/default.
      • {{deckOccasion}} = a short eyebrow line — investor stage + month/year, or audience + meeting.
      • {{coverNotes}} = optional speaker notes (use ` · ` between paragraphs).
      • {{coverIllustrationUrl}} = OPTIONAL — a URL from facet/illustration assets[].url, picked via brain_pick_illustration with mood matching the deck tone. Sits top-right at ~200px max. If no illustration fits the moment (or the cover is busy enough already), REMOVE the entire <img> from the scaffold rather than leaving a placeholder.
    tone: confident, plain
    lengthHint: tagline ≤10 words; occasion ≤8 words
    required: true
    slots: [logoUrlLight, tagline, deckOccasion, coverNotes, coverIllustrationUrl]

  - name: Mission
    guidance: |-
      Single sentence. The mission VERBATIM from brand.mission. Do not paraphrase. Sets the room.
      • If brand.mission is empty, refuse — the deck cannot exist without it.
      • {{missionNotes}} = why this matters now (voice/default), 1–2 sentences.
    tone: confident, plain
    lengthHint: 1 sentence
    required: true
    slots: [missionStatement, missionNotes]

  - name: Problem
    guidance: |-
      Name the pain. One headline + one short paragraph. Apply guideline/lead-with-outcome.
      • {{problemHeadline}} = what's broken in the world today (≤14 words).
      • {{problemBody}} = 2 sentences max. Concrete, not vague. No fabricated stats.
      • Apply guardrail/no-unverified-stats — if you'd otherwise need a number, remove it.
    tone: direct, plain
    lengthHint: headline ≤14 words; body 2 sentences
    required: true
    slots: [problemHeadline, problemBody, problemNotes]

  - name: Solution
    guidance: |-
      How the brand solves it. One headline + one short paragraph.
      • {{solutionHeadline}} = the outcome the brand creates (apply guideline/lead-with-outcome).
      • {{solutionBody}} = 2 sentences. Voice/default — no jargon, no "users", contractions on.
    tone: confident, plain
    lengthHint: headline ≤14 words; body 2 sentences
    required: true
    slots: [solutionHeadline, solutionBody, solutionNotes]

  - name: How it works
    guidance: |-
      Three-step explanation. Each step is one verb-led title + one sentence.
      • {{stepNTitle}} = ≤4 words, action verb first.
      • {{stepNBody}} = 1 sentence, plain language.
      • Steps must be in causal order (1 enables 2 enables 3).
    tone: clear, instructive
    lengthHint: title ≤4 words; body 1 sentence
    required: true
    slots:
      - howItWorksHeadline
      - step1Title
      - step1Body
      - step2Title
      - step2Body
      - step3Title
      - step3Body
      - howItWorksNotes

  - name: Traction
    guidance: |-
      Three big numbers. EVERY figure must be sourced — pull from facet/knowledge or facet/product items, never invent.
      • {{statNFigure}} = the number itself, formatted for impact ("$2.4M", "12,400", "98%").
      • {{statNLabel}} = what the number measures, ≤14 words.
      • Apply guardrail/no-unverified-stats hard. If only one or two real stats exist, ASK the user — do not fabricate to fill three slots.
      • {{tractionHeadline}} = a one-line frame ("Twelve months in.", "Since launch.").
    tone: confident, factual
    lengthHint: figure ≤8 chars; label ≤14 words
    required: true
    slots:
      - tractionHeadline
      - stat1Figure
      - stat1Label
      - stat2Figure
      - stat2Label
      - stat3Figure
      - stat3Label
      - tractionNotes

  - name: Team
    guidance: |-
      Three people. Pull DIRECTLY from facet/person items — name, role, imageUrl, quote.
      • {{personNImageUrl}} = person.imageUrl verbatim, never construct.
      • {{personNName}} = person.name verbatim.
      • {{personNRole}} = person.role verbatim.
      • {{personNQuote}} = person.quote VERBATIM (don't paraphrase). One short sentence each.
      • If fewer than 3 people exist, ASK the user — do not invent.
      • {{teamHeadline}} = "The team" or a punchier one-liner ("Why we're the ones to do this.").
    tone: warm, confident
    lengthHint: quote 1 sentence
    required: true
    slots:
      - teamHeadline
      - person1Name
      - person1Role
      - person1ImageUrl
      - person1Quote
      - person2Name
      - person2Role
      - person2ImageUrl
      - person2Quote
      - person3Name
      - person3Role
      - person3ImageUrl
      - person3Quote
      - teamNotes

  - name: Product
    guidance: |-
      The product slide. Pull from the primary item in facet/product (or the one the user named).
      • {{productHeadline}} = product.name + a one-line frame ("How it ships.").
      • {{productBody}} = 2 sentences combining product.description with the strongest valueProp. Apply guideline/lead-with-outcome.
    tone: confident, plain
    lengthHint: headline ≤10 words; body 2 sentences
    required: true
    slots: [productHeadline, productBody, productNotes]

  - name: Closing
    guidance: |-
      The ask. Single big headline + one CTA button.
      • {{closingEyebrow}} = "What's next" or "The ask" or audience-specific ("To our team", "To our investors").
      • {{closingHeadline}} = the actual ask in one line. ≤12 words. Outcome-led per guideline/lead-with-outcome.
      • {{ctaLabel}} = ≤4 words ("Talk to us", "Read the doc", "Get an invite").
      • {{ctaUrl}} = the user-supplied URL (or brand.primaryUrl as fallback).
    tone: direct, confident
    lengthHint: headline ≤12 words; CTA ≤4 words
    required: true
    slots: [closingEyebrow, closingHeadline, ctaLabel, ctaUrl, closingNotes]
---

# Pitch deck template — usage rules

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML5 deck. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. No "here's the deck". The fence opens, the document renders, the fence closes. End of response.
2. **Use the scaffold provided in this template's `scaffold` field as your starting document.** Fill every `{{slotName}}` placeholder with real content. Do not redesign the structure. Do not remove slides. Do not add slides — 9 is the count.
3. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
4. **Resolve every brand-kit reference VERBATIM:**
   - Colours: only hex codes from `palette.colors[].hex`. Never invent.
   - Fonts: replace `{{typographyHeadCss}}` with `<style>@import url(...)</style>` from the kit, plus `<style>` blocks of `@font-face` rules built from any `typography.typefaces[].source.files[]` (use file URLs verbatim).
   - Logos: `{{logoUrlLight}}` is `logo.assets[].url` for the `wordmark-on-light` variant, verbatim. Never construct domain paths.
   - People: `{{personNImageUrl}}`, `{{personNName}}`, `{{personNRole}}`, `{{personNQuote}}` are pulled from `facet/person` items VERBATIM.
5. **Numeric claims are sourced or absent.** Every traction stat must come from `facet/knowledge` or `facet/product`. If three real stats don't exist, ASK the user. Never fabricate.
6. **Speaker notes use ` · ` (middle dot) between paragraphs.** Optional per slide. Plain text — no HTML inside `data-notes`.
7. **Pre-return self-check:**
   - First three chars of response are the fence.
   - First non-whitespace inside the fence is `<!doctype html>`.
   - Exactly one ```html opening fence and one closing fence.
   - 9 `<section class="slide">` elements (no more, no fewer).
   - Every `#xxxxxx` colour appears in the kit palette.
   - Every URL is from `logo.assets[].url`, `person.imageUrl`, or a CTA URL the user supplied.
   - No `{{slot}}`, `Lorem`, `TODO`, or `[bracketed-placeholder]` survives.

If you cannot satisfy all seven rules, do not return — ask the user for the missing input first.

## Why HTML

The deck is a single self-contained HTML5 document. Triggers Claude.ai's artifact preview ("Open in new tab" → fullscreen Safari). Keyboard nav (← → space) works in the artifact panel and in Safari. ⌘P prints the whole deck as a real PDF, one slide per page.

## Resolution order for AI agents

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, primary product, all people, all guardrails in one shot.
2. `brain_get_item` for each `facet/person` referenced (need the full quote VERBATIM).
3. Inject typography's `cssImport` and any `@font-face` rules built from `source.files` into `{{typographyHeadCss}}`.
4. Apply voice/default to every line of prose. Apply every guardrail. Apply guideline/lead-with-outcome to headlines.

## Hard rules

- **Nine slides. Always.** Cover, Mission, Problem, Solution, How it works, Traction, Team, Product, Closing.
- **No invented stats.** Every figure on the Traction slide is sourced from `knowledge` or `product`. If you'd otherwise need to invent, ask.
- **Real people only.** The Team slide pulls from `facet/person`. If fewer than 3 exist, ask for direction — do not fabricate teammates.
- **Brand color rationed.** Brand red appears as: traction figures, step numbers, CTA button. Three places. Never more.
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.
- **Audience tuning.** The deck adapts to occasion (`{{deckOccasion}}`). Investor → traction emphasis; team → mission/closing emphasis; conference → problem/solution emphasis.

## Variants (controlled by section emphasis, not by changing the scaffold)

- **Investor pitch** — traction stats are the most concrete; closing CTA is a meeting ask.
- **All-hands** — closing CTA is a rallying line; traction is internal milestones.
- **Conference talk** — problem and solution slides do the heavy lifting; closing is a takeaway.
- **Sales narrative** — product slide leads with valueProps; closing is a demo / trial CTA.
