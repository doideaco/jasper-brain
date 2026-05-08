---
id: product-landing-page
name: Product landing page
description: Conversion-focused product landing page rendered as a complete HTML5 document. Hero with dual CTAs, trust bar, problem, three-beat solution, customer quote, feature grid, FAQ accordion (pulled from facet/faq), final CTA banner, footer. Brand-themed, scroll-reveal animated, print-aware. One slash command, one shippable page.
format: landing-page
renderAs: html-document
tags: [web, conversion, marketing]
scaffold: |-
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{pageTitle}} — {{brandName}}</title>
    <meta name="description" content="{{pageMetaDescription}}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {{typographyHeadCss}}
    <style>
      :root {
        --ink: #0c0a09;
        --stone-700: #44403c;
        --stone-500: #78716c;
        --stone-300: #d6d3d1;
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
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--body-family); font-size: 16px; line-height: 1.5; }
      a { color: inherit; text-decoration: none; }
      .container { max-width: 1080px; margin: 0 auto; padding: 0 32px; }

      /* Header */
      header.bar { padding: 20px 0; border-bottom: 1px solid var(--stone-200); position: sticky; top: 0; background: var(--surface); z-index: 50; backdrop-filter: saturate(140%) blur(8px); }
      header.bar nav { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
      header.bar img { height: 40px; width: auto; display: block; }
      .nav-links { display: flex; gap: 24px; font-size: 14px; color: var(--stone-700); }
      .nav-links a:hover { color: var(--ink); }

      /* Hero */
      .hero { padding: 96px 0 48px 0; }
      .hero .eyebrow { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stone-500); margin: 0 0 20px 0; }
      .hero h1.display { font-family: var(--display-family); font-size: clamp(48px, 6vw, 88px); line-height: 1.02; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 24px 0; color: var(--ink); max-width: 22ch; }
      .hero .subhead { font-size: clamp(18px, 1.4vw, 22px); line-height: 1.55; color: var(--stone-700); max-width: 56ch; margin: 0 0 32px 0; }
      .cta-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
      .btn { display: inline-block; padding: 12px 24px; border-radius: 9999px; font-size: 15px; font-weight: 500; transition: opacity 150ms, background 150ms, color 150ms; }
      .btn.primary { background: var(--brand); color: var(--surface); }
      .btn.primary:hover { opacity: 0.88; }
      .btn.secondary { background: transparent; color: var(--ink); border: 1px solid var(--stone-300); }
      .btn.secondary:hover { background: var(--stone-100); }
      .btn.big { padding: 16px 36px; font-size: 17px; }
      .hero-illustration { margin: 56px 0 0 0; padding: 0; text-align: center; }
      .hero-illustration img { max-width: 560px; width: 100%; height: auto; }

      /* Trust bar */
      .trust-bar { padding: 32px 0; border-top: 1px solid var(--stone-200); border-bottom: 1px solid var(--stone-200); background: var(--card); }
      .trust-bar .label { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stone-500); text-align: center; margin: 0 0 16px 0; }
      .trust-bar .logos { display: flex; gap: 40px; flex-wrap: wrap; justify-content: center; align-items: center; opacity: 0.7; }
      .trust-bar .logos img, .trust-bar .logos span { height: 28px; width: auto; opacity: 0.8; filter: grayscale(1); }
      .trust-bar .logos span { display: inline-flex; align-items: center; font-weight: 600; font-size: 18px; color: var(--stone-500); }

      /* Problem */
      .problem { padding: 96px 0 48px 0; }
      .problem h2.display { font-family: var(--display-family); font-size: clamp(36px, 4vw, 56px); line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 24px 0; color: var(--ink); max-width: 22ch; }
      .problem .lead { font-size: clamp(18px, 1.3vw, 22px); line-height: 1.55; color: var(--stone-700); max-width: 60ch; margin: 0; }

      /* Solution beats */
      .solution { padding: 64px 0 96px 0; }
      .solution .eyebrow { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stone-500); margin: 0 0 20px 0; }
      .solution h2.display { font-family: var(--display-family); font-size: clamp(36px, 4vw, 56px); line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 56px 0; color: var(--ink); max-width: 22ch; }
      .beats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
      .beat .num { font-family: var(--display-family); font-size: 56px; font-weight: 300; color: var(--brand); line-height: 1; margin: 0 0 16px 0; }
      .beat h3 { font-family: var(--body-family); font-size: 20px; font-weight: 600; margin: 0 0 8px 0; color: var(--ink); }
      .beat p { font-size: 16px; line-height: 1.55; color: var(--stone-700); margin: 0; }
      @media (max-width: 720px) { .beats { grid-template-columns: 1fr; gap: 32px; } }

      /* Customer quote */
      .customer-quote { padding: 96px 0; background: var(--card); border-top: 1px solid var(--stone-200); border-bottom: 1px solid var(--stone-200); }
      .customer-quote blockquote { margin: 0; padding: 0; }
      .customer-quote blockquote p { font-family: var(--display-family); font-size: clamp(28px, 3vw, 40px); line-height: 1.25; font-weight: 300; font-style: italic; color: var(--ink); margin: 0 0 32px 0; max-width: 30ch; }
      .customer-quote blockquote footer { display: flex; align-items: center; gap: 16px; }
      .customer-quote blockquote footer img { width: 56px; height: 56px; border-radius: 9999px; object-fit: cover; }
      .customer-quote .name { font-size: 16px; font-weight: 600; color: var(--ink); }
      .customer-quote .meta { font-size: 14px; color: var(--stone-500); margin-top: 2px; }

      /* Features */
      .features { padding: 96px 0; }
      .features h2.display { font-family: var(--display-family); font-size: clamp(36px, 4vw, 56px); line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 48px 0; color: var(--ink); max-width: 22ch; }
      .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
      .feature { background: var(--card); border: 1px solid var(--stone-200); border-radius: 16px; padding: 28px; }
      .feature .name { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--brand); margin: 0 0 12px 0; }
      .feature h3 { font-family: var(--body-family); font-size: 22px; font-weight: 600; line-height: 1.25; margin: 0 0 12px 0; color: var(--ink); }
      .feature p { font-size: 15px; line-height: 1.55; color: var(--stone-700); margin: 0; }
      @media (max-width: 980px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }

      /* FAQ */
      .faq { padding: 96px 0; background: var(--card); border-top: 1px solid var(--stone-200); }
      .faq h2.display { font-family: var(--display-family); font-size: clamp(36px, 4vw, 56px); line-height: 1.1; font-weight: 300; letter-spacing: -0.02em; margin: 0 0 48px 0; color: var(--ink); max-width: 22ch; }
      .faq details { border-bottom: 1px solid var(--stone-200); padding: 24px 0; }
      .faq details:first-child { border-top: 1px solid var(--stone-200); }
      .faq summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: baseline; gap: 24px; font-size: 18px; font-weight: 500; color: var(--ink); }
      .faq summary::-webkit-details-marker { display: none; }
      .faq summary::after { content: '+'; font-family: var(--mono-family); font-size: 16px; opacity: 0.5; transition: transform 200ms; }
      .faq details[open] summary::after { transform: rotate(45deg); opacity: 1; }
      .faq details p { font-size: 16px; line-height: 1.6; color: var(--stone-700); margin: 16px 0 0 0; max-width: 60ch; }
      .faq details ul.sources { font-size: 13px; color: var(--stone-500); margin: 12px 0 0 0; padding: 0 0 0 16px; }

      /* Final CTA */
      .final-cta { padding: 120px 0; text-align: center; background: var(--ink); color: var(--surface); }
      .final-cta .eyebrow { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stone-300); margin: 0 0 20px 0; }
      .final-cta h2.display { font-family: var(--display-family); font-size: clamp(40px, 5vw, 72px); line-height: 1.05; font-weight: 300; letter-spacing: -0.02em; margin: 0 auto 40px auto; color: var(--surface); max-width: 22ch; }
      .final-cta .btn.primary { background: var(--brand); color: var(--surface); }
      .final-cta .trust-line { font-size: 13px; color: var(--stone-300); margin: 24px 0 0 0; opacity: 0.7; }

      /* Footer */
      footer.site { background: var(--ink); color: #d6d3d1; padding: 48px 0; border-top: 1px solid #292524; }
      footer.site img { height: 32px; width: auto; margin-bottom: 16px; }
      footer.site .row { display: flex; gap: 24px; flex-wrap: wrap; font-size: 14px; }
      footer.site a { color: #d6d3d1; }
      footer.site a:hover { color: var(--surface); }
      footer.site .copy { font-size: 12px; color: #a8a29e; margin-top: 16px; }

      /* Scroll-triggered reveal — applied via JS at end of body. */
      .reveal-up { opacity: 0; transform: translateY(18px); transition: opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1); will-change: opacity, transform; }
      .reveal-up.in-view { opacity: 1; transform: translateY(0); }
      @media (prefers-reduced-motion: reduce) {
        .reveal-up { transition: none; transform: none; opacity: 1; }
        html { scroll-behavior: auto; }
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
        <div class="eyebrow">{{heroEyebrow}}</div>
        <h1 class="display">{{heroHeadline}}</h1>
        <p class="subhead">{{heroSubhead}}</p>
        <div class="cta-row">
          <a href="{{primaryCtaUrl}}" class="btn primary">{{primaryCtaLabel}}</a>
          <a href="{{secondaryCtaUrl}}" class="btn secondary">{{secondaryCtaLabel}}</a>
        </div>
        <!-- Hero illustration (OPTIONAL — remove the entire <figure> if no illustration fits) -->
        <figure class="hero-illustration">
          <img src="{{heroIllustrationUrl}}" alt="">
        </figure>
      </div>
    </section>

    <!-- Trust bar (OPTIONAL — remove the entire <section> if no customer logos available) -->
    <section class="trust-bar">
      <div class="container">
        <p class="label">{{trustBarLabel}}</p>
        <div class="logos">{{customerLogosHtml}}</div>
      </div>
    </section>

    <section class="problem">
      <div class="container">
        <h2 class="display">{{problemHeadline}}</h2>
        <p class="lead">{{problemBody}}</p>
      </div>
    </section>

    <section class="solution">
      <div class="container">
        <div class="eyebrow">{{solutionEyebrow}}</div>
        <h2 class="display">{{solutionHeadline}}</h2>
        <div class="beats">
          <div class="beat">
            <div class="num">01</div>
            <h3>{{beat1Title}}</h3>
            <p>{{beat1Body}}</p>
          </div>
          <div class="beat">
            <div class="num">02</div>
            <h3>{{beat2Title}}</h3>
            <p>{{beat2Body}}</p>
          </div>
          <div class="beat">
            <div class="num">03</div>
            <h3>{{beat3Title}}</h3>
            <p>{{beat3Body}}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Customer quote (OPTIONAL — remove the entire <section> if no real customer quote available from facet/person) -->
    <section class="customer-quote">
      <div class="container">
        <blockquote>
          <p>&ldquo;{{customerQuote}}&rdquo;</p>
          <footer>
            <img src="{{customerImageUrl}}" alt="{{customerName}}">
            <div>
              <div class="name">{{customerName}}</div>
              <div class="meta">{{customerRole}}, {{customerCompany}}</div>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="display">{{featuresHeadline}}</h2>
        <div class="features-grid">
          {{featuresHtml}}
        </div>
      </div>
    </section>

    <!-- FAQ accordion. Pull from facet/faq verbatim. (OPTIONAL — remove the entire <section> if no FAQs configured) -->
    <section class="faq">
      <div class="container">
        <h2 class="display">{{faqHeadline}}</h2>
        <div class="faqs">
          {{faqsHtml}}
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container">
        <div class="eyebrow">{{finalEyebrow}}</div>
        <h2 class="display">{{finalHeadline}}</h2>
        <a href="{{finalCtaUrl}}" class="btn primary big">{{finalCtaLabel}}</a>
        <p class="trust-line">{{finalTrustLine}}</p>
      </div>
    </section>

    <footer class="site">
      <div class="container">
        <img src="{{logoUrlDark}}" alt="{{brandName}}">
        <div class="row">{{footerLinksHtml}}</div>
        <p class="copy">{{copyright}}</p>
        {{legalDisclaimer}}
      </div>
    </footer>

    <script>
      // Scroll-triggered reveal — same pattern as blog-post. Marks
      // every meaningful section/child with .reveal-up; an
      // IntersectionObserver flips them to .in-view as they enter
      // the viewport. Respects prefers-reduced-motion.
      (function () {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        var selectors = [
          '.hero .eyebrow',
          '.hero h1.display',
          '.hero .subhead',
          '.hero .cta-row',
          '.hero-illustration',
          '.trust-bar .label',
          '.trust-bar .logos',
          '.problem h2.display',
          '.problem .lead',
          '.solution .eyebrow',
          '.solution h2.display',
          '.solution .beat',
          '.customer-quote blockquote',
          '.features h2.display',
          '.feature',
          '.faq h2.display',
          '.faq details',
          '.final-cta .eyebrow',
          '.final-cta h2.display',
          '.final-cta .btn',
          '.final-cta .trust-line',
          'footer.site .container > *'
        ].join(', ');

        var els = document.querySelectorAll(selectors);
        for (var i = 0; i < els.length; i++) els[i].classList.add('reveal-up');

        var io = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (e.isIntersecting) {
              e.target.classList.add('in-view');
              io.unobserve(e.target);
            }
          }
        }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
        for (var j = 0; j < els.length; j++) io.observe(els[j]);
      })();
    </script>
  </body>
  </html>
sections:
  - name: Header
    guidance: |-
      Sticky top bar with the brand wordmark and a short nav.
      • {{logoUrlLight}} = logo.assets[].url for the wordmark-on-light variant, verbatim. Logo height is 40px in this template.
      • {{navLinks}} = a small block of `<a>` elements (3-5 links: Product, Pricing, Customers, Docs, Sign in). Use only the link text + URLs the user supplied or that exist as brand.urls.
    tone: utilitarian
    lengthHint: layout only
    required: true
    slots: [logoUrlLight, navLinks]

  - name: Hero
    guidance: |-
      One outcome-led headline + subhead + dual CTAs. The single most important block on the page.
      • {{heroEyebrow}} = optional category line (e.g. "Brand voice for marketing teams"). Skip on most pages by leaving it as a single short phrase or empty.
      • {{heroHeadline}} = ≤12 words, outcome-led per guideline/lead-with-outcome. Names what becomes true for the reader.
      • {{heroSubhead}} = one sentence, names the audience and the change. No fabricated stats per guardrail/no-unverified-stats.
      • {{primaryCtaLabel}} / {{primaryCtaUrl}} = the single most important action — "Try it", "See how it works", "Get started". Use the supplied CTA URL or brand.primaryUrl.
      • {{secondaryCtaLabel}} / {{secondaryCtaUrl}} = lower-commitment ask — "Read the docs", "See pricing". Optional: if the user only wants one CTA, REMOVE the second `<a class="btn secondary">` from the scaffold.
      • {{heroIllustrationUrl}} = OPTIONAL editorial illustration below the CTAs. Call brain_pick_illustration with mood matching the page's tone. If no fitting illustration exists, REMOVE the entire `<figure class="hero-illustration">` block.
    tone: confident, plain
    lengthHint: headline ≤12 words; subhead 1 sentence
    required: true
    slots:
      - heroEyebrow
      - heroHeadline
      - heroSubhead
      - primaryCtaLabel
      - primaryCtaUrl
      - secondaryCtaLabel
      - secondaryCtaUrl
      - heroIllustrationUrl

  - name: Trust bar (optional)
    guidance: |-
      A row of customer logos or a "trusted by" line below the hero.
      • {{trustBarLabel}} = a short eyebrow ("Trusted by marketing teams at", "Loved by leading brands"). Voice/default applies; never use forbidden vocabulary.
      • {{customerLogosHtml}} = HTML for 4-6 customer marks. Use real logo URLs the user supplied OR replace each <img> with <span>Customer</span> as a text placeholder.
      • If you have ZERO real customer references AND apply guardrail/no-unverified-stats, REMOVE the entire `<section class="trust-bar">`. Do not fabricate customer names or logos.
    tone: utilitarian
    lengthHint: 4-6 logos
    required: false
    slots: [trustBarLabel, customerLogosHtml]

  - name: Problem
    guidance: |-
      Name the specific frustration the reader has today, in their words. Two to three sentences.
      • {{problemHeadline}} = ≤14 words. Concrete. Apply voice/default — no jargon.
      • {{problemBody}} = 2-3 sentences. Make the reader feel seen. NO statistics here — this is recognition, not proof. Apply guardrail/no-unverified-stats hard.
    tone: direct, plain
    lengthHint: headline ≤14 words; body 2-3 sentences
    required: true
    slots: [problemHeadline, problemBody]

  - name: Solution (three beats)
    guidance: |-
      Show the product solving the problem in three short beats. Each beat is a verb-led title plus one sentence of detail.
      • {{solutionEyebrow}} = "How it works", "The pivot", or audience-specific framing.
      • {{solutionHeadline}} = the outcome the product delivers (≤14 words).
      • {{beatNTitle}} = ≤4 words, action verb first ("Capture the voice", "Apply at scale", "Ship faster").
      • {{beatNBody}} = 1 sentence each. Outcome first, mechanism second per guideline/lead-with-outcome.
      • Beats must be in causal order (1 enables 2 enables 3).
    tone: clear, instructive
    lengthHint: title ≤4 words; body 1 sentence
    required: true
    slots:
      - solutionEyebrow
      - solutionHeadline
      - beat1Title
      - beat1Body
      - beat2Title
      - beat2Body
      - beat3Title
      - beat3Body

  - name: Customer quote (optional)
    guidance: |-
      Single hero customer quote.
      • Pull from facet/person VERBATIM where applicable: name, role, imageUrl, quote.
      • {{customerQuote}} = person.quote VERBATIM. One sentence, in italic display type. Do NOT paraphrase.
      • {{customerName}} = person.name verbatim.
      • {{customerRole}} = person.role verbatim.
      • {{customerCompany}} = the customer's company. If the person item doesn't carry a company, ASK the user; never invent one.
      • {{customerImageUrl}} = person.imageUrl verbatim.
      • If no real customer quote is available, REMOVE the entire `<section class="customer-quote">` rather than fabricating one.
    tone: warm, confident
    lengthHint: quote 1 sentence
    required: false
    slots:
      - customerQuote
      - customerName
      - customerRole
      - customerCompany
      - customerImageUrl

  - name: Features
    guidance: |-
      3-5 features in a grid. Each card has an uppercase feature name (mono, brand-coloured), a one-line outcome headline, and a 2-3 line explanation. Outcome first, mechanism second per guideline/lead-with-outcome.
      • {{featuresHeadline}} = the section frame ("How marketing teams use it", "Built for shipping").
      • {{featuresHtml}} = a block of `<div class="feature">` cards. Each card has this exact structure:
        <div class="feature">
          <div class="name">FEATURE NAME</div>
          <h3>One-line outcome headline</h3>
          <p>Two to three sentences explaining how. Source from facet/product valueProps and features. Apply guardrail/no-unverified-stats.</p>
        </div>
      • Render 3, 4, or 5 cards depending on what's in facet/product.
      • NEVER fabricate features. Pull only from product.features and product.valueProps.
    tone: confident, factual
    lengthHint: 3-5 cards; each ≤30 words
    required: true
    slots: [featuresHeadline, featuresHtml]

  - name: FAQ
    guidance: |-
      Frequently asked questions, pulled from facet/faq.
      • {{faqHeadline}} = "Questions, answered" or audience-specific ("Common questions from marketing leaders").
      • {{faqsHtml}} = a block of `<details>` elements, one per FAQ item. Each:
        <details>
          <summary>Question</summary>
          <p>Canonical answer VERBATIM from faq.answer — do not paraphrase.</p>
          <ul class="sources">
            <li><a href="{{source.url}}">{{source.title}}</a></li>
          </ul>
        </details>
      • Pick 4-6 FAQs that match the page's audience (pricing, security, integrations, onboarding). NEVER paraphrase a stock answer per facet/faq aiInstructions.
      • Always render every entry from `faq.sources` as a citation. If sources is empty, omit the <ul>.
      • If facet/faq is empty, REMOVE the entire `<section class="faq">`.
    tone: helpful, factual
    lengthHint: 4-6 questions
    required: false
    slots: [faqHeadline, faqsHtml]

  - name: Final CTA
    guidance: |-
      Restate the outcome from the hero in different words, then a big primary CTA, then a single trust line.
      • {{finalEyebrow}} = "Ready when you are", "What's next", or audience-tuned.
      • {{finalHeadline}} = ≤12 words. The line the reader takes to their decision-maker. Outcome-led.
      • {{finalCtaLabel}} / {{finalCtaUrl}} = the SAME primary CTA from the hero — never two different primary asks on one page.
      • {{finalTrustLine}} = "No credit card required. Cancel anytime." OR a sourced reassurance from facet/knowledge. Apply guardrail/no-unverified-stats — no fabricated stats.
    tone: direct, confident
    lengthHint: headline ≤12 words; trust line ≤14 words
    required: true
    slots:
      - finalEyebrow
      - finalHeadline
      - finalCtaLabel
      - finalCtaUrl
      - finalTrustLine

  - name: Footer
    guidance: |-
      Site-wide footer at the end of the page.
      • {{logoUrlDark}} = logo.assets[].url for the wordmark-on-dark variant, verbatim. Logo height is 32px here.
      • {{footerLinksHtml}} = a row of `<a>` elements (5-8 links: Product, Pricing, Customers, Docs, Blog, About, Privacy, Terms).
      • {{copyright}} = "© {currentYear} {brandName}. All rights reserved."
      • {{legalDisclaimer}} = if facet/guardrail or facet/compliance has matching disclaimers, append the text VERBATIM in a `<p>` with `font-size:11px;color:#a8a29e;margin-top:16px`.
    tone: utilitarian
    lengthHint: 5-8 links + copyright + optional disclaimer
    required: true
    slots: [logoUrlDark, footerLinksHtml, copyright, legalDisclaimer]
---

# Product landing page template — usage rules

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML5 landing page. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. The fence opens, the document renders, the fence closes.
2. **Use the scaffold provided as your starting document.** Fill every `{{slotName}}` placeholder. Do not redesign the structure.
3. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
4. **Optional sections.** Trust bar, Customer quote, Hero illustration, and FAQ are OPTIONAL. If you don't have real content for them (no real customer logos, no real quote in `facet/person`, no fitting illustration, no FAQs in `facet/faq`), REMOVE the entire `<section>` (or `<figure>`) from the scaffold. Do NOT leave placeholders.
5. **Resolve every brand-kit reference VERBATIM:**
   - Colours: only hex codes from `palette.colors[].hex`. Never invent.
   - Fonts: replace `{{typographyHeadCss}}` with `<style>@import url(...)</style>` from the kit, plus `<style>` blocks of `@font-face` rules built from `typography.typefaces[].source.files[]`.
   - Logos: only `logo.assets[].url` strings, by variant (light for header, dark for footer).
   - Customer voice: only `facet/person.quote` strings, verbatim.
   - FAQs: only `facet/faq.answer` strings, verbatim with sources cited.
   - Features: only `facet/product.features` and `valueProps`.
6. **Apply EVERY guardrail.** Block-severity guardrails (especially `no-unverified-stats`) are non-negotiable. If you'd otherwise need a number that isn't sourced, remove the number rather than invent.
7. **Pre-return self-check:**
   - First three chars of response are the fence.
   - First non-whitespace inside the fence is `<!doctype html>`.
   - Exactly one ```html opening fence and one closing fence.
   - Every `#xxxxxx` colour appears in the kit palette.
   - Every URL is from `logo.assets[].url`, `person.imageUrl`, supplied CTA URLs, or `faq.sources[].url`.
   - No `{{slot}}`, `Lorem`, `TODO`, or `[bracketed-placeholder]` survives.

If you cannot satisfy all seven rules, do not return — ask the user for the missing input first.

## Why HTML

The landing page is a single self-contained HTML5 document. Triggers Claude.ai's artifact preview ("Open in new tab" → live page in Safari). ⌘P prints a clean PDF. Drop into Webflow / Framer / Next.js by lifting the `<style>` and `<body>` content directly.

## Resolution order for AI agents

1. `brain_get_brand_kit` — pulls voice, palette, typography, logo, primary product, all guardrails, FAQs in one shot.
2. `brain_get_item` for the specific `facet/person` you'll quote (need full quote VERBATIM).
3. `brain_pick_illustration` if including the hero illustration — pass mood matching the page's tone.
4. Inject typography's `cssImport` and any `@font-face` rules built from `source.files` into `{{typographyHeadCss}}`.
5. Apply voice/default to every line of prose. Apply EVERY guardrail. Apply `guideline/lead-with-outcome` to all headlines.

## Hard rules

- **One primary CTA, repeated.** Hero primary CTA = Final CTA. Never two different "main" actions.
- **No invented stats.** Every number on the page is sourced from `facet/knowledge`, `facet/product`, or removed.
- **No fabricated customers.** Trust bar logos and customer quotes are real (from `facet/person`) or removed entirely.
- **Brand color rationed.** Brand red appears as: hero primary CTA, beat numbers, feature card eyebrows, final CTA. Four places. Never more.
- **Voice non-negotiables.** Contractions on, "you" not "users", no exclamation marks, no banned vocabulary from `voice/default`.

## Variants

- **Single-product launch** — full template. Hero subhead names the launch ("New: Brand Voice"). Trust bar carries early-customer logos.
- **Pricing page** — replace the Features section with a pricing-tier grid (3 tiers). Keep everything else.
- **Customer story** — promote the Customer quote section higher (between Hero and Problem). Body copy framed as the customer's narrative.
- **Compact / mobile-first** — drop the Trust bar and Customer quote sections. Hero + Problem + Solution + Features + Final CTA.
