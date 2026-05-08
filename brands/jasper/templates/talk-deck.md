---
id: talk-deck
name: Talk deck
description: Topic-agnostic presentation deck. Feed it any topic — a strategy proposal, a conference talk, a research finding, an internal POV — and it renders a 9-slide brand-consistent deck. Same interactive HTML5 shell as pitch-deck (keyboard nav, speaker notes drawer, light/dark theme toggle, print-aware), with sections shaped for argument-led talks rather than company pitches.
format: talk-deck
renderAs: html-document
tags: [deck, slides, presentation, talk, web]
scaffold: |-
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{topicTitle}} — {{brandName}}</title>
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
      .slide.cover { justify-content: center; align-items: flex-start; }
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
      .slide.cover img.logo { height: 48px; width: auto; margin-bottom: 64px; }
      .slide.cover .topic {
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
      .pillar .num {
        font-family: var(--display-family);
        font-size: 64px;
        font-weight: 300;
        color: var(--brand);
        line-height: 1;
        margin-bottom: 16px;
      }
      .pillar .pillar-title {
        font-size: 22px;
        font-weight: 600;
        color: var(--ink);
        margin-bottom: 8px;
      }
      .pillar .pillar-body { font-size: 16px; color: var(--stone-700); line-height: 1.5; }
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
      .voices {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 48px;
        margin-top: 48px;
      }
      .voice img {
        width: 96px;
        height: 96px;
        border-radius: 9999px;
        object-fit: cover;
        margin-bottom: 16px;
        border: 1px solid var(--stone-200);
      }
      .voice .name { font-size: 20px; font-weight: 600; color: var(--ink); }
      .voice .role { font-size: 16px; color: var(--stone-500); margin-top: 4px; }
      .voice .quote { font-size: 14px; color: var(--stone-700); margin-top: 12px; line-height: 1.5; font-style: italic; }
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
        <div class="topic">{{topicTitle}}</div>
        <div class="meta">{{occasion}}</div>
        <!-- Optional cover accent illustration (top-right). REMOVE the entire <img> if no illustration fits. -->
        <img src="{{coverIllustrationUrl}}" alt="" style="position:absolute;top:clamp(48px,6vw,96px);right:clamp(64px,9vw,144px);max-width:200px;height:auto;opacity:0.95;">
      </section>

      <section class="slide" data-notes="{{thesisNotes}}">
        <div class="eyebrow">Thesis</div>
        <h1 class="display">{{thesisStatement}}</h1>
      </section>

      <section class="slide" data-notes="{{contextNotes}}">
        <div class="eyebrow">Why now</div>
        <h2 class="display">{{contextHeadline}}</h2>
        <p class="lead">{{contextBody}}</p>
      </section>

      <section class="slide" data-notes="{{shiftNotes}}">
        <div class="eyebrow">The shift</div>
        <h2 class="display">{{shiftHeadline}}</h2>
        <p class="lead">{{shiftBody}}</p>
      </section>

      <section class="slide" data-notes="{{frameworkNotes}}">
        <div class="eyebrow">The framework</div>
        <h2 class="display">{{frameworkHeadline}}</h2>
        <div class="three-up">
          <div class="pillar">
            <div class="num">01</div>
            <div class="pillar-title">{{pillar1Title}}</div>
            <div class="pillar-body">{{pillar1Body}}</div>
          </div>
          <div class="pillar">
            <div class="num">02</div>
            <div class="pillar-title">{{pillar2Title}}</div>
            <div class="pillar-body">{{pillar2Body}}</div>
          </div>
          <div class="pillar">
            <div class="num">03</div>
            <div class="pillar-title">{{pillar3Title}}</div>
            <div class="pillar-body">{{pillar3Body}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{evidenceNotes}}">
        <div class="eyebrow">Evidence</div>
        <h2 class="display">{{evidenceHeadline}}</h2>
        <div class="stats">
          <div class="stat">
            <div class="figure">{{evidence1Figure}}</div>
            <div class="label">{{evidence1Label}}</div>
          </div>
          <div class="stat">
            <div class="figure">{{evidence2Figure}}</div>
            <div class="label">{{evidence2Label}}</div>
          </div>
          <div class="stat">
            <div class="figure">{{evidence3Figure}}</div>
            <div class="label">{{evidence3Label}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{voicesNotes}}">
        <div class="eyebrow">Voices</div>
        <h2 class="display">{{voicesHeadline}}</h2>
        <div class="voices">
          <div class="voice">
            <img src="{{voice1ImageUrl}}" alt="{{voice1Name}}">
            <div class="name">{{voice1Name}}</div>
            <div class="role">{{voice1Role}}</div>
            <div class="quote">{{voice1Quote}}</div>
          </div>
          <div class="voice">
            <img src="{{voice2ImageUrl}}" alt="{{voice2Name}}">
            <div class="name">{{voice2Name}}</div>
            <div class="role">{{voice2Role}}</div>
            <div class="quote">{{voice2Quote}}</div>
          </div>
          <div class="voice">
            <img src="{{voice3ImageUrl}}" alt="{{voice3Name}}">
            <div class="name">{{voice3Name}}</div>
            <div class="role">{{voice3Role}}</div>
            <div class="quote">{{voice3Quote}}</div>
          </div>
        </div>
      </section>

      <section class="slide" data-notes="{{takeawayNotes}}">
        <div class="eyebrow">What this means</div>
        <h2 class="display">{{takeawayHeadline}}</h2>
        <p class="lead">{{takeawayBody}}</p>
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
      Title slide. Brand wordmark + the topic + the occasion.
      • {{logoUrlLight}} = logo.assets[].url for the wordmark-on-light variant, verbatim.
      • {{topicTitle}} = the topic of the talk in display type. Punchy, ≤8 words. Examples: "AI's stake in brand integrity.", "Why design tokens are political.", "The end of the persona slide."
      • {{occasion}} = audience + date eyebrow ("Industry summit · May 2026", "Internal kickoff · Q3", "Conference talk · Berlin").
      • {{coverNotes}} = optional speaker notes (use ` · ` between paragraphs).
      • {{coverIllustrationUrl}} = OPTIONAL — a URL from facet/illustration assets[].url, picked via brain_pick_illustration with mood matching the talk's register. Sits top-right at ~200px max. If no illustration fits, REMOVE the entire <img> from the scaffold rather than leaving a placeholder.
    tone: confident, plain
    lengthHint: title ≤8 words; occasion ≤8 words
    required: true
    slots: [logoUrlLight, topicTitle, occasion, coverNotes, coverIllustrationUrl]

  - name: Thesis
    guidance: |-
      The single sentence that is the whole talk.
      • {{thesisStatement}} = one sentence, max 18 words. Strong claim. Apply guideline/lead-with-outcome — answer "what becomes true for me?", not "what is this about?". Voice/default applies hard: contractions on, no exclamation marks, no banned vocab.
      • {{thesisNotes}} = the audience reaction you're aiming for — relief, recognition, productive disagreement.
    tone: confident, plain
    lengthHint: 1 sentence ≤18 words
    required: true
    slots: [thesisStatement, thesisNotes]

  - name: Why now (Context)
    guidance: |-
      What changed. Why this matters this year, this quarter, this room.
      • {{contextHeadline}} = the shift in the world (≤14 words).
      • {{contextBody}} = 2 sentences. Concrete. No fabricated stats — apply guardrail/no-unverified-stats.
      • If you'd otherwise need a stat to make the point, ASK the user; do not invent.
    tone: direct, plain
    lengthHint: headline ≤14 words; body 2 sentences
    required: true
    slots: [contextHeadline, contextBody, contextNotes]

  - name: The shift
    guidance: |-
      The lens this talk applies. The new frame the audience walks out with.
      • {{shiftHeadline}} = the headline reframe (≤14 words). Often a "from X to Y" shape.
      • {{shiftBody}} = 2 sentences explaining the shift in plain language. No jargon, no "users".
    tone: confident, plain
    lengthHint: headline ≤14 words; body 2 sentences
    required: true
    slots: [shiftHeadline, shiftBody, shiftNotes]

  - name: The framework
    guidance: |-
      Three pillars. The structure the audience can take home and use tomorrow.
      • {{pillarNTitle}} = ≤4 words, action verb or noun phrase ("Make it queryable", "Prefer truth to taste", "Cite or remove").
      • {{pillarNBody}} = 1 sentence, plain language, ideally ending on a verb.
      • Pillars must be coherent — three angles on the same idea, not three different ideas.
    tone: clear, instructive
    lengthHint: title ≤4 words; body 1 sentence
    required: true
    slots:
      - frameworkHeadline
      - pillar1Title
      - pillar1Body
      - pillar2Title
      - pillar2Body
      - pillar3Title
      - pillar3Body
      - frameworkNotes

  - name: Evidence
    guidance: |-
      Three pieces of proof. Stats, comparative claims, or short before/after points.
      • {{evidenceNFigure}} = the headline figure or short claim (≤8 chars for numbers, ≤4 words for short claims). Examples: "$2.4M", "12,400", "98%", "30 min", "0 outages".
      • {{evidenceNLabel}} = what it measures or the supporting context, ≤14 words.
      • Apply guardrail/no-unverified-stats hard. Every figure must be sourced — from facet/knowledge, facet/product, or supplied by the user. If three real points don't exist, ASK; do not fabricate.
      • {{evidenceHeadline}} = a one-line frame ("What we've seen.", "The signal in the data.", "Receipts.").
    tone: confident, factual
    lengthHint: figure ≤8 chars or ≤4 words; label ≤14 words
    required: true
    slots:
      - evidenceHeadline
      - evidence1Figure
      - evidence1Label
      - evidence2Figure
      - evidence2Label
      - evidence3Figure
      - evidence3Label
      - evidenceNotes

  - name: Voices (optional)
    guidance: |-
      Three quotes from people who matter to this argument.
      • Pull from facet/person verbatim where applicable: name, role, imageUrl, quote.
      • OR use voices the user explicitly named in the request — never invent quotes or attribute them to public figures from training data.
      • {{voiceNQuote}} = ONE short sentence, in quotation marks, VERBATIM (don't paraphrase).
      • If three real voices aren't supplied or available, OMIT THIS SLIDE ENTIRELY (delete the entire `<section class="slide" ...>...</section>` block from the scaffold). The deck becomes 8 slides; the JS slide counter will adapt automatically.
      • {{voicesHeadline}} = "What others see." or audience-tuned ("Customers.", "The team.", "The skeptics.").
    tone: warm, confident
    lengthHint: quote 1 sentence
    required: false
    slots:
      - voicesHeadline
      - voice1Name
      - voice1Role
      - voice1ImageUrl
      - voice1Quote
      - voice2Name
      - voice2Role
      - voice2ImageUrl
      - voice2Quote
      - voice3Name
      - voice3Role
      - voice3ImageUrl
      - voice3Quote
      - voicesNotes

  - name: What this means (Takeaway)
    guidance: |-
      The implication. The "so what" the audience leaves with.
      • {{takeawayHeadline}} = the implication in one line (≤14 words). Outcome-led per guideline/lead-with-outcome.
      • {{takeawayBody}} = 2 sentences. What the audience should do differently on Monday morning.
    tone: confident, plain
    lengthHint: headline ≤14 words; body 2 sentences
    required: true
    slots: [takeawayHeadline, takeawayBody, takeawayNotes]

  - name: Closing
    guidance: |-
      The takeaway slide. Big headline + one CTA OR a single quotable line.
      • {{closingEyebrow}} = audience-tuned ("To this room.", "What we're asking.", "Next.").
      • {{closingHeadline}} = the line to remember. ≤12 words. The audience repeats this in the hallway.
      • {{ctaLabel}} = ≤4 words ("Read the doc", "Talk to us", "Try it", "See the brain").
      • {{ctaUrl}} = user-supplied URL, or brand.primaryUrl as fallback. If no URL is appropriate (a pure-takeaway closing), still supply a useful one (e.g. brand.primaryUrl); the button is small enough to ignore but breaks if missing.
    tone: direct, confident
    lengthHint: headline ≤12 words; CTA ≤4 words
    required: true
    slots: [closingEyebrow, closingHeadline, ctaLabel, ctaUrl, closingNotes]
---

# Talk-deck template — usage rules

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML5 deck. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. No "here's the deck". The fence opens, the document renders, the fence closes. End of response.
2. **Use the scaffold provided in this template's `scaffold` field as your starting document.** Fill every `{{slotName}}` placeholder with real content. Do not redesign the structure. The Voices slide is the ONLY slide you may remove (when no real voices are available); every other slide is fixed.
3. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
4. **Resolve every brand-kit reference VERBATIM:**
   - Colours: only hex codes from `palette.colors[].hex`. Never invent.
   - Fonts: replace `{{typographyHeadCss}}` with `<style>@import url(...)</style>` from the kit, plus `<style>` blocks of `@font-face` rules built from any `typography.typefaces[].source.files[]` (use file URLs verbatim).
   - Logos: `{{logoUrlLight}}` is `logo.assets[].url` for the `wordmark-on-light` variant, verbatim. Never construct domain paths.
   - Voices: pull from `facet/person` items VERBATIM, OR use names+quotes the user explicitly supplied in the request. NEVER invent voices, NEVER quote public figures from training data.
5. **No invented numbers.** Every figure on the Evidence slide must come from `facet/knowledge`, `facet/product`, or the user's request. If three real points don't exist, ASK the user; never fabricate.
6. **Speaker notes use ` · ` (middle dot) between paragraphs.** Optional per slide. Plain text — no HTML inside `data-notes`.
7. **Pre-return self-check:**
   - First three chars of response are the fence.
   - First non-whitespace inside the fence is `<!doctype html>`.
   - Exactly one ```html opening fence and one closing fence.
   - 8 or 9 `<section class="slide">` elements (Voices is the only optional one).
   - Every `#xxxxxx` colour appears in the kit palette.
   - Every URL is from `logo.assets[].url`, `person.imageUrl`, or a CTA URL the user supplied.
   - No `{{slot}}`, `Lorem`, `TODO`, or `[bracketed-placeholder]` survives.

If you cannot satisfy all seven rules, do not return — ask the user for the missing input first.

## How to drive this template

The user feeds you a topic. Examples:

- "the future of brand identity in AI"
- "why our retention dropped in March"
- "what we learned shipping the rebrand"
- "the case for typed design tokens"
- "scaling design ops past 50 designers"

You build a 9-slide deck (or 8 if no voices) that ARGUES that topic in the brand's voice — not a survey of it. Pick a thesis, defend it.

## Why HTML

The deck is a single self-contained HTML5 document. Triggers Claude.ai's artifact preview ("Open in new tab" → fullscreen Safari). Keyboard nav (← → space) works in the artifact panel and in Safari. ⌘P prints the deck as a real PDF, one slide per page.

## Resolution order for AI agents

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, all guardrails in one shot.
2. `brain_get_item` for each `facet/person` you intend to quote (need full quotes verbatim).
3. Inject typography's `cssImport` and any `@font-face` rules built from `source.files` into `{{typographyHeadCss}}`.
4. Apply voice/default to every line of prose. Apply every guardrail. Apply guideline/lead-with-outcome to thesis, takeaway, and closing.

## Hard rules

- **Eight or nine slides. No more.** Cover, Thesis, Why now, The shift, The framework, Evidence, [Voices — optional], What this means, Closing.
- **The thesis is one sentence.** Not two. Not a paragraph. The whole talk hangs on it.
- **Three pillars. Coherent.** Three angles on the same idea, not three different ideas.
- **No invented evidence.** Every figure or claim on the Evidence slide is sourced or removed.
- **Voices are real or absent.** No fabricated quotes. No public-figure attributions from training data.
- **Brand color rationed.** Brand red appears as: pillar numbers, evidence figures, CTA button. Three places. Never more.
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.

## Variants (controlled by section emphasis, not by changing the scaffold)

- **Conference talk** — thesis is provocative; framework is the takeaway memory aid; closing is a quotable line, not a CTA.
- **Strategy proposal** — context+shift do the heavy lifting; framework is the proposed plan; closing CTA is the decision asked for.
- **Internal POV / memo** — voices slide pulls from `facet/person`; closing is what you're asking the team to do differently.
- **Research findings** — evidence slide is the centerpiece; takeaway is the implication; voices show the customer perspective.
