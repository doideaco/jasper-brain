---
id: certification-page
name: Device certification page
description: Public per-device certification record. One page per certified device — every field is either verified from the review file or the certificate is not issued.
format: certification-page
renderAs: html-document
tags: [web, regulatory, public-record, canonical]
scaffold: |-
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{deviceName}} — Certification {{certificationId}} — {{brandName}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {{typographyHeadCss}}
    <style>
      :root {
        --ink: #221E1E;
        --ink-alt: #1E1E1F;
        --slate-700: #8C827D;
        --slate-500: #767676;
        --slate-200: #E9E4E4;
        --slate-100: #F0ECEC;
        --paper: #F5F5F5;
        --card: #ffffff;
        --scarlet: #FF4747;
        --scarlet-dark: #903A39;
        --scarlet-50: #FFEBEB;
        --approved: #1F6E4A;
        --approved-50: #E4EFEA;
        --caution: #A15B0F;
        --caution-50: #F5E9D8;
        --restricted: #8B1520;
        --restricted-50: #F3DEE0;
        --ground: #D6D2CE;
        --page-bg: #FFFFFF;
        --border-rule: #C2BBB5;
        --border-rule-inner: #D4CEC8;
        --page-inset: 20px;
        --content-pad: 56px;
        --display-family: 'Aeonik Pro', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --body-family: 'Aeonik Pro', 'Aeonik', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
        --mono-family: 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace;
      }
      @media (prefers-color-scheme: dark) {
        :root:not([data-theme="light"]) {
          --ground: #141210;
          --page-bg: #222020;
          --ink: #F2EFE9;
          --ink-alt: #E8E4DE;
          --slate-700: #A8A09A;
          --slate-500: #8A847B;
          --slate-200: #383432;
          --slate-100: #2E2B29;
          --paper: #1E1C1A;
          --card: #2A2725;
          --border-rule: #484340;
          --border-rule-inner: #3C3836;
          --scarlet-50: #3A2020;
          --approved-50: #1A2E24;
          --caution-50: #2E2418;
          --restricted-50: #2E1A1C;
        }
      }
      :root[data-theme="dark"] {
        --ground: #141210;
        --page-bg: #222020;
        --ink: #F2EFE9;
        --ink-alt: #E8E4DE;
        --slate-700: #A8A09A;
        --slate-500: #8A847B;
        --slate-200: #383432;
        --slate-100: #2E2B29;
        --paper: #1E1C1A;
        --card: #2A2725;
        --border-rule: #484340;
        --border-rule-inner: #3C3836;
        --scarlet-50: #3A2020;
        --approved-50: #1A2E24;
        --caution-50: #2E2418;
        --restricted-50: #2E1A1C;
      }
      * { box-sizing: border-box; margin: 0; }
      body { background: var(--ground); color: var(--ink); font-family: var(--body-family); font-size: 16px; line-height: 1.6; min-height: 100vh; padding: 56px 24px; }
      a { color: inherit; }
      code { font-family: var(--mono-family); font-size: 0.92em; background: var(--slate-100); color: var(--ink); padding: 2px 6px; border-radius: 3px; font-weight: 500; }

      /* ── Physical page ── */
      .page { max-width: 880px; margin: 0 auto; background: var(--page-bg); box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.05), 0 20px 48px rgba(0,0,0,0.07); position: relative; }

      /* Double-rule inset border */
      .page::before { content: ''; position: absolute; inset: var(--page-inset); border: 1px solid var(--border-rule); pointer-events: none; z-index: 1; }
      .page::after { content: ''; position: absolute; inset: calc(var(--page-inset) + 4px); border: 0.5px solid var(--border-rule-inner); pointer-events: none; z-index: 1; }

      /* Paper grain */
      .page-grain { position: absolute; inset: 0; opacity: 0.02; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; z-index: 0; }

      /* Tiled watermark — passport-style diagonal text */
      .page-watermark { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
      .page-watermark-inner { position: absolute; inset: -50%; width: 200%; height: 200%; transform: rotate(-45deg); display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 32px; opacity: 0.028; }
      .wm-row { display: flex; gap: 40px; white-space: nowrap; font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink); line-height: 1; }
      .wm-row.offset { margin-left: 80px; }

      .page-content { position: relative; z-index: 2; }

      /* ── Scarlet accent band ── */
      .accent-band { height: 5px; background: var(--scarlet); position: relative; overflow: hidden; }
      .accent-band::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(255,255,255,0.15) 3px, rgba(255,255,255,0.15) 6px); }

      /* ── Header ── */
      .cert-header { display: flex; align-items: center; justify-content: space-between; padding: 24px var(--content-pad); border-bottom: 1px solid var(--slate-200); }
      .cert-header img { height: 28px; width: auto; }
      .nav-links { display: flex; gap: 24px; font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-700); }
      .nav-links a { text-decoration: none; color: inherit; }
      .nav-links a:hover { color: var(--scarlet); }

      /* ── Breadcrumb ── */
      .breadcrumb { padding: 20px var(--content-pad) 0; font-family: var(--mono-family); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); }
      .breadcrumb a { text-decoration: none; color: inherit; }
      .breadcrumb .sep { padding: 0 8px; color: var(--slate-200); }

      /* ── Hero ── */
      .hero-cert { padding: 32px var(--content-pad) 40px; display: grid; grid-template-columns: 1fr 280px; gap: 40px; align-items: start; }
      @media (max-width: 760px) { :root { --content-pad: 36px; } .hero-cert { grid-template-columns: 1fr; gap: 24px; } }
      .cert-heading { max-width: 520px; }
      .cert-eyebrow { font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); margin: 0 0 16px 0; }
      h1.device-name { font-family: var(--display-family); font-size: 40px; line-height: 1.1; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 16px 0; color: var(--ink); text-wrap: balance; }
      .manufacturer { font-family: var(--body-family); font-size: 17px; font-weight: 400; color: var(--slate-700); margin: 0 0 24px 0; }

      .status-pill { display: inline-flex; align-items: center; gap: 10px; font-family: var(--mono-family); font-size: 12px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; padding: 7px 13px; border-radius: 2px; margin-bottom: 24px; }
      .status-pill.certified { background: var(--approved-50); color: var(--approved); border: 1px solid var(--approved); }
      .status-pill.surveillance { background: var(--caution-50); color: var(--caution); border: 1px solid var(--caution); }
      .status-pill.suspended { background: var(--restricted-50); color: var(--restricted); border: 1px solid var(--restricted); }
      .status-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

      /* ── Cert card with stamp ── */
      .cert-card { background: var(--card); border: 1px solid var(--slate-200); padding: 24px 20px 20px; position: relative; }
      .cert-card dl { margin: 0; }
      .cert-card dt { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); margin-bottom: 3px; }
      .cert-card dd { font-family: var(--body-family); font-size: 15px; margin: 0 0 14px 0; color: var(--ink); font-variant-numeric: tabular-nums; }
      .cert-card dd:last-child { margin-bottom: 0; }
      .cert-card dd.mono { font-family: var(--mono-family); font-size: 14px; }

      /* Certification stamp */
      .stamp { width: 72px; height: 72px; margin: 0 auto 20px; opacity: 0.55; }

      /* ── Sections ── */
      section.block { border-top: 1px solid var(--slate-200); }
      .block-inner { padding: 32px var(--content-pad); }
      section.block h2 { font-family: var(--display-family); font-size: 24px; line-height: 1.2; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 16px 0; color: var(--ink); }
      section.block h2 .num { display: inline-block; font-family: var(--mono-family); font-size: 13px; font-weight: 500; color: var(--slate-500); margin-right: 10px; letter-spacing: 0.04em; vertical-align: middle; }
      section.block p { font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; color: var(--slate-700); max-width: 64ch; }

      .scope-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      @media (max-width: 640px) { .scope-grid { grid-template-columns: 1fr; } }
      .scope-panel { padding: 20px; }
      .scope-panel.in { background: var(--approved-50); border: 1px solid var(--approved); }
      .scope-panel.out { background: var(--restricted-50); border: 1px solid var(--restricted); }
      .scope-panel h3 { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 10px 0; }
      .scope-panel.in h3 { color: var(--approved); }
      .scope-panel.out h3 { color: var(--restricted); }
      .scope-panel ul { padding-left: 18px; margin: 0; font-size: 14px; line-height: 1.65; color: var(--ink); }
      .scope-panel li { margin-bottom: 6px; }
      .scope-panel li:last-child { margin-bottom: 0; }

      .table-wrap { overflow-x: auto; }
      table.evidence { width: 100%; border-collapse: collapse; margin: 8px 0 0 0; font-variant-numeric: tabular-nums; }
      table.evidence th { text-align: left; font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); padding: 12px 16px 12px 0; border-bottom: 1px solid var(--slate-200); }
      table.evidence th:last-child, table.evidence td:last-child { padding-right: 0; text-align: right; }
      table.evidence td { padding: 14px 16px 14px 0; border-bottom: 1px solid var(--slate-200); font-size: 14px; color: var(--ink); vertical-align: top; }
      table.evidence td.mono { font-family: var(--mono-family); color: var(--slate-700); }
      table.evidence tr:last-child td { border-bottom: none; }
      table.evidence .status-cell { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
      table.evidence .status-cell.closed { color: var(--approved); }
      table.evidence .status-cell.open { color: var(--caution); }
      table.evidence .status-cell.hard { color: var(--restricted); }

      table.standards { width: 100%; border-collapse: collapse; margin: 8px 0 0 0; }
      table.standards th, table.standards td { text-align: left; padding: 14px 16px 14px 0; border-bottom: 1px solid var(--slate-200); }
      table.standards th { font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--slate-500); }
      table.standards td { font-size: 14px; vertical-align: top; }
      table.standards td.mono { font-family: var(--mono-family); color: var(--slate-700); white-space: nowrap; padding-right: 32px; }
      table.standards tr:last-child td { border-bottom: none; }

      /* ── Reviewer with signature line ── */
      .reviewer { display: grid; grid-template-columns: 80px 1fr; gap: 24px; align-items: start; padding: 28px; background: var(--card); border: 1px solid var(--slate-200); }
      @media (max-width: 640px) { .reviewer { grid-template-columns: 1fr; } }
      .reviewer img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: var(--slate-200); }
      .reviewer .quote { font-family: var(--display-family); font-size: 18px; line-height: 1.5; font-weight: 500; font-style: italic; color: var(--ink); margin: 0 0 16px 0; }
      .signature-line { width: 180px; border-top: 1px solid var(--ink); padding-top: 6px; margin-top: 4px; }
      .signature-line .name { font-family: var(--mono-family); font-size: 10px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink); }
      .signature-line .role { font-family: var(--mono-family); font-size: 10px; color: var(--slate-500); margin-top: 2px; }

      /* ── Footer ── */
      .cert-footer { background: var(--ink-alt); color: #C9C4C0; padding: 32px var(--content-pad); }
      .cert-footer img { height: 24px; width: auto; margin-bottom: 16px; }
      .footer-links { display: flex; gap: 20px; flex-wrap: wrap; font-family: var(--mono-family); font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; }
      .footer-links a { color: #C9C4C0; text-decoration: none; }
      .cert-footer .copy { font-size: 12px; color: #767070; margin-top: 16px; }
      .cert-footer .disclaimer { font-size: 12px; color: #767070; margin-top: 12px; max-width: 64ch; line-height: 1.6; }

      .reveal-up {
        opacity: 0;
        transform: translateY(14px);
        transition: opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1), transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      .reveal-up.in-view { opacity: 1; transform: translateY(0); }
      @media (prefers-reduced-motion: reduce) { .reveal-up { transition: none; transform: none; opacity: 1; } }
    </style>
  </head>
  <body>

    <div class="page">
      <div class="page-grain"></div>
      <div class="page-watermark">
        <div class="page-watermark-inner" aria-hidden="true">
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
          <div class="wm-row offset">{{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}} {{brandName}}</div>
        </div>
      </div>
      <div class="page-content">

        <!-- Accent band -->
        <div class="accent-band"></div>

        <!-- Header -->
        <header class="cert-header">
          <img src="{{logoUrlLight}}" alt="{{brandName}}">
          <div class="nav-links">{{navLinks}}</div>
        </header>

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <a href="{{registerUrl}}">Register</a><span class="sep">/</span>
          <a href="{{manufacturerUrl}}">{{manufacturerName}}</a><span class="sep">/</span>
          <span style="color:var(--slate-700)">{{deviceName}}</span>
        </div>

        <!-- Hero -->
        <section class="hero-cert">
          <div class="cert-heading">
            <p class="cert-eyebrow">{{deviceClassEyebrow}}</p>
            <h1 class="device-name">{{deviceName}}</h1>
            <p class="manufacturer">{{manufacturerName}}</p>
            {{statusPillBlock}}
            <p style="max-width:56ch;font-size:16px;line-height:1.7;color:var(--slate-700);margin:0;">{{intendedUse}}</p>
          </div>

          <aside class="cert-card">
            <!-- Certification stamp -->
            <div class="stamp">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" fill="none" width="72" height="72">
                <circle cx="36" cy="36" r="34" stroke="var(--approved)" stroke-width="1.5"/>
                <circle cx="36" cy="36" r="31" stroke="var(--approved)" stroke-width="0.5"/>
                <g stroke="var(--approved)" stroke-width="0.75">
                  <line x1="36" y1="0" x2="36" y2="4"/>
                  <line x1="36" y1="68" x2="36" y2="72"/>
                  <line x1="0" y1="36" x2="4" y2="36"/>
                  <line x1="68" y1="36" x2="72" y2="36"/>
                </g>
                <circle cx="36" cy="36" r="22" fill="var(--approved)" opacity="0.06"/>
                <circle cx="36" cy="36" r="22" stroke="var(--approved)" stroke-width="1"/>
                <path d="M25 36 L32 43 L47 28" stroke="var(--approved)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <defs>
                  <path id="topArc" d="M 12,36 a 24,24 0 0,1 48,0"/>
                  <path id="bottomArc" d="M 60,36 a 24,24 0 0,1 -48,0"/>
                </defs>
                <text font-family="'JetBrains Mono', monospace" font-size="6" font-weight="500" letter-spacing="0.12em" fill="var(--approved)">
                  <textPath href="#topArc" startOffset="50%" text-anchor="middle">{{brandNameUpper}}</textPath>
                </text>
                <text font-family="'JetBrains Mono', monospace" font-size="5.5" font-weight="500" letter-spacing="0.1em" fill="var(--approved)">
                  <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">CERTIFIED</textPath>
                </text>
              </svg>
            </div>
            <dl style="margin:0;">
              <dt>Certification ID</dt>
              <dd class="mono">{{certificationId}}</dd>

              <dt>Issued</dt>
              <dd>{{issuedDate}}</dd>

              <dt>Valid until</dt>
              <dd>{{validUntil}}</dd>

              <dt>Next surveillance audit</dt>
              <dd>{{nextSurveillanceDate}}</dd>

              <dt>Route</dt>
              <dd class="mono">{{conformityRoute}}</dd>

              <dt>Signed by</dt>
              <dd>{{signedByName}}</dd>
            </dl>
          </aside>
        </section>

        <!-- Scope -->
        <section class="block">
          <div class="block-inner">
            <h2><span class="num">01</span>Scope of certification</h2>
            <p>This certification covers the following, and no more. Any use outside the stated scope is outside the certification.</p>
            <div class="scope-grid">
              <div class="scope-panel in">
                <h3>What this certification covers</h3>
                <ul>
                  {{scopeInList}}
                </ul>
              </div>
              <div class="scope-panel out">
                <h3>What this certification does NOT cover</h3>
                <ul>
                  {{scopeOutList}}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Standards -->
        <section class="block">
          <div class="block-inner">
            <h2><span class="num">02</span>Standards assessed</h2>
            <p>The technical documentation was assessed against the clauses below. Each row is a specific object in the file — not a generic reference.</p>
            <div class="table-wrap">
              <table class="standards">
                <thead>
                  <tr>
                    <th>Standard</th>
                    <th>Clause</th>
                    <th>Applied to</th>
                  </tr>
                </thead>
                <tbody>
                  {{standardsRows}}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Audit history -->
        <section class="block">
          <div class="block-inner">
            <h2><span class="num">03</span>Audit history</h2>
            <p>Every finding raised across the certification lifecycle, by ID, with its current status. Closed findings are retained on the public record.</p>
            <div class="table-wrap">
              <table class="evidence">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Finding</th>
                    <th>Clause</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {{auditRows}}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Reviewer statement -->
        <section class="block">
          <div class="block-inner">
            <h2><span class="num">04</span>Reviewer statement</h2>
            <div class="reviewer">
              <img src="{{reviewerImageUrl}}" alt="{{reviewerName}}">
              <div>
                <p class="quote">{{reviewerStatement}}</p>
                <div class="signature-line">
                  <div class="name">{{reviewerName}}</div>
                  <div class="role">{{reviewerRole}} · Signed {{signedDate}}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="cert-footer">
          <img src="{{logoUrlDark}}" alt="{{brandName}}">
          <div class="footer-links">{{footerLinks}}</div>
          <p class="copy">{{copyright}}</p>
          <p class="disclaimer">{{legalDisclaimer}}</p>
        </footer>

      </div>
    </div>

    <script>
      (function () {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
        var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;
        var selectors = ['.hero-cert > *', 'section.block > *', '.cert-footer > *'].join(', ');
        var els = document.querySelectorAll(selectors);
        for (var i = 0; i < els.length; i++) els[i].classList.add('reveal-up');
        var io = new IntersectionObserver(function (entries) {
          for (var i = 0; i < entries.length; i++) {
            var e = entries[i];
            if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
          }
        }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
        for (var j = 0; j < els.length; j++) io.observe(els[j]);
      })();
    </script>
  </body>
  </html>
sections:
  - name: Header
    guidance: |-
      The page renders inside a `.page` container that simulates a physical certificate document sitting on a warm-grey ground. The page has:
      • A double-rule inset border (1px outer at 20px inset, 0.5px inner at 24px)
      • A subtle paper-grain texture overlay at 2% opacity
      • A passport-style tiled watermark repeating the brand name at -45° and 2.8% opacity
      • A 5px Scarlet accent band with fine-line security hatching at the very top

      The header bar sits below the accent band inside `.page-content`.
      • Logo: logo/primary asset variant=wordmark-on-light. Use asset.url verbatim as `<img>` src.
      • Nav in JetBrains Mono 11px UPPERCASE 0.06em, color Slate-700.
      • Full dark-theme support via CSS custom properties — all palette tokens are redefined under `prefers-color-scheme: dark` and `[data-theme="dark"]`.
    tone: utilitarian
    lengthHint: layout only
    required: true
    slots: [navMenu]

  - name: Breadcrumb
    guidance: |-
      Three-level trail: Register → Manufacturer → Device.
      • Style: JetBrains Mono 12px UPPERCASE 0.06em color Slate-500.
      • Only the current page (device name) is not a link.
      • Manufacturer link goes to `/register/manufacturer/[slug]`.
    tone: utilitarian
    lengthHint: one line
    required: true
    slots: [registerUrl, manufacturerUrl, manufacturerName, deviceName]

  - name: Hero — device name, manufacturer, status, intended use
    guidance: |-
      The identity of the certification.
      • Eyebrow uses caption step (JetBrains Mono 12px UPPERCASE 0.06em Slate-500). Names the device class — e.g. `CLASS IIa · SaMD · EU MDR ANNEX IX`.
      • Device name uses display step (Aeonik Pro 48px 500 -0.02em) in Ink.
      • Manufacturer name uses body-lg (Aeonik Pro 18px 400 Slate-700).
      • Status pill: render the correct pill class based on status:
        - "CERTIFIED" — .status-pill.certified (Approved green)
        - "SURVEILLANCE PENDING" — .status-pill.surveillance (Caution amber)
        - "SUSPENDED" — .status-pill.suspended (Restricted red)
        Each pill contains a small dot span (`<span class="dot"></span>`) and the label. This is the ONE per-page use of a status colour at a large size.
      • Intended-use paragraph: body-lg (17px Inter 400 / 1.7 Slate-700). One sentence, verbatim from the review file. This is NOT marketing copy — it must match the "intended use" statement in the certificate.
      • Apply guardrail/no-safety-claims-without-scope. Intended use is bounded by population and indication — do NOT say "safe" or "trusted" here.
    tone: identity
    lengthHint: intended-use ≤ 40 words
    required: true
    slots: [deviceClassEyebrow, deviceName, manufacturerName, status, intendedUse]

  - name: Certification card
    guidance: |-
      Right-column card in the hero (stacks below on mobile).
      • Opens with a certification stamp SVG (72×72, 55% opacity) — a circular seal with dual rings, compass ticks, a checkmark, and arc text reading the brand name (top) and "CERTIFIED" (bottom) using `<textPath>` on circular arcs. The stamp uses the Approved colour token.
      • Every field is a definition list <dl> pair — dt in JetBrains Mono 11px UPPERCASE Slate-500, dd in Inter 15px Ink (or JetBrains Mono 14px for the ID and route with dd.mono class).
      • Six fields, in this order:
        1. Certification ID — mono, e.g. `SCR-2026-0117`.
        2. Issued — long-form date, "15 September 2026".
        3. Valid until — long-form date. If certification is suspended, use "—".
        4. Next surveillance audit — long-form date.
        5. Route — mono, the specific MDR annex, e.g. `EU MDR Annex IX §4`.
        6. Signed by — the reviewer's full name (from facet/person). Default: Dr Eleanor Vance.
      • font-variant-numeric: tabular-nums is set on dd so numerics align.
    tone: bibliographic
    lengthHint: 6 pairs
    required: true
    slots: [certificationId, issuedDate, validUntil, nextSurveillanceDate, conformityRoute, signedByName]

  - name: Scope of certification (in vs out)
    guidance: |-
      Two side-by-side panels making explicit what the certification covers and does not cover.
      • Left (in-scope): green .scope-panel.in with header "WHAT THIS CERTIFICATION COVERS". Bulleted list of specific covered items — the population (e.g. "Adults ≥18 years"), the indication (e.g. "Chest X-ray triage for suspected consolidation"), the software version(s) certified (e.g. `v3.4.x` specific), the intended clinical setting.
      • Right (out-of-scope): red .scope-panel.out with header "WHAT THIS CERTIFICATION DOES NOT COVER". Bulleted list of specific excluded items — the populations NOT covered (e.g. "Paediatric use (<18 years) is out of scope"), features NOT assessed (e.g. "The natural-language reporting module was not part of this assessment"), and the boundary with adjacent regulation (e.g. "FDA 510(k) clearance is not covered by this certification").
      • Every bullet is a concrete statement, not a vague qualifier. If the manufacturer would like to expand scope, they say "out of scope" explicitly here — this is the record they cannot argue with later.
      • Apply value/rigor-over-reassurance. If the "does not cover" panel is empty, the reviewer has failed to name the boundary.
    tone: precise, boundaried
    lengthHint: 3–6 bullets per panel
    required: true
    slots: [scopeInList, scopeOutList]

  - name: Standards assessed
    guidance: |-
      Table of every standard clause the review touched.
      • Three columns: Standard, Clause, Applied to.
      • Standard column: full document identifier (e.g. `IEC 62304`, `ISO 14971`, `EU MDR (2017/745)`).
      • Clause column: mono-styled cell (td.mono) with the specific clause (e.g. `§5.7.2`, `Annex II §3`, `Annex IX §4`). Every clause is addressable — no bare "the software section".
      • Applied to column: plain-English description of what part of the device or file this clause was assessed against (e.g. "Model retraining process for weekly updates").
      • Minimum three rows for any Class IIa+ certification.
      • Source ONLY from knowledge/regulatory-landscape. If a claim would need a standard not in the knowledge item, add it there first.
    tone: bibliographic
    lengthHint: 3–10 rows
    required: true
    slots: [standardsRows]

  - name: Audit history
    guidance: |-
      Table of every audit finding raised across the certification lifecycle.
      • Four columns: Date, Finding, Clause, Status.
      • Every finding has a Scarlet-issued ID (e.g. `NC-2026-0117-001` for non-conformity 001 on certification 0117) and appears in the Finding column as `<code>NC-...</code>` followed by a one-sentence description.
      • Clause column: mono-styled cell with the specific clause the finding was raised against.
      • Status column uses the status-cell class:
        - "CLOSED" — .status-cell.closed (Approved green)
        - "OPEN" — .status-cell.open (Caution amber)
        - "MAJOR — OPEN" — .status-cell.hard (Restricted red)
      • Findings are listed newest first. Closed findings are retained — the history is the story.
      • Applies value/rigor-over-reassurance and value/evidence-before-endorsement — the audit trail is the evidence.
    tone: chronological, factual
    lengthHint: 3–12 rows
    required: true
    slots: [auditRows]

  - name: Reviewer statement
    guidance: |-
      Named quote from the reviewer who signed the certification.
      • Pull from facet/person by id (slot: reviewerPersonId). Default: `person/dr-eleanor-vance`. Use person.name, person.role, person.imageUrl, and person.quote VERBATIM — never rewrite the quote.
      • If the certification is CERTIFIED and unremarkable, the person's default quote applies.
      • If the certification is SURVEILLANCE PENDING or SUSPENDED, the reviewer must have supplied a specific statement in the review file — use that verbatim. Do NOT invent a reviewer statement for a problematic certification.
      • Signed date is the date the reviewer put their name on the certificate — long-form ("15 September 2026").
      • The reviewer's name and role render in a formal signature block: a 180px rule line with the name in JetBrains Mono 10px UPPERCASE above the role in Slate-500.
    tone: personal, named
    lengthHint: 1–2 sentences
    required: true
    slots: [reviewerPersonId, reviewerStatement, signedDate]

  - name: Footer
    guidance: |-
      Footer sits inside the physical page container (`.cert-footer` inside `.page-content`).
      • Background: palette token "Ink-alt" (#1E1E1F).
      • Logo: logo/primary asset variant=wordmark-on-dark. Use asset.url verbatim as `<img>` src.
      • Link row: JetBrains Mono 11px UPPERCASE 0.06em color #C9C4C0. Three links: Standards register, Services, Contact.
      • Legal disclaimer VERBATIM: "Scarlet is a Notified Body under Regulation (EU) 2017/745. This page is the public record of a certification issued by Scarlet on the date shown. The scope of certification is bounded by the fields on this page. Use of the certified device outside the stated scope is outside the certification."
    tone: utilitarian, compliant
    lengthHint: 3 lines + disclaimer
    required: true
    slots: [legalDisclaimer]
---

# Certification page template — usage rules

## Output contract (READ FIRST — non-negotiable)

When invoked, you MUST return a single, complete, previewable HTML5 document. Nothing else.

1. **Respond with EXACTLY one fenced ```html block.** No prose before, after, or between. No summary. The fence opens, the doc renders, the fence closes.
2. **The block opens with `<!doctype html>`** as the first non-whitespace character inside the fence.
3. **Self-contained.** All CSS lives in a single `<style>` in `<head>`. Only external CSS permitted is the typography `cssImport`.
4. **Every field is verified.** Certification ID, issued date, valid-until date, next surveillance date, standards clauses, and audit finding IDs are pulled from the review file — not invented. If the user has not supplied verified inputs, ask for them; do not fill in plausible-looking values.
5. **No `{{...}}` placeholders in output.** Every slot is filled with real content or the section is omitted with the section removed from the scaffold entirely.
6. **Status colours are semantic.** The status pill and every status cell in the audit-history table use the palette's status colours (Approved / Caution / Restricted) matched exactly to the actual certification state.
7. **Asset URLs are absolute.** Any logo or reviewer-photo URL you emit must be the ABSOLUTE Scarlet Signal URL (`https://…/api/files/…`), never a root-relative `/api/files/…` — the artifact preview resolves relative URLs against the sandbox origin and they will 404.
8. **Announce the preview limit.** After returning the fenced ```html block, add exactly one plain-text line telling the reader that the inline preview may not load the images (logo, reviewer photo) and offering to open the HTML in a real browser tab (Safari, Chrome). This line goes AFTER the closing fence, not inside it.

## Why HTML

This template renders the canonical public record of a Scarlet certification. It is designed to look identical whether rendered as a Claude.ai artifact, printed as a PDF, or published to the manufacturer's marketing site. Fragmentary HTML or a rendered summary defeats the "public record" purpose. The preview is a sandbox — some clients block third-party image loads, which is why rule 8 always offers a real browser tab.

## Resolution order for AI agents

Before rendering, resolve every reference via MCP:

1. `brain_get_brand_kit` — voice, palette, typography, logo, primary reviewer (Dr Vance), guardrails.
2. `brain_get_item` for any referenced item (`person/dr-eleanor-vance` for the reviewer, `knowledge/regulatory-landscape` for the standards, `guardrail/no-safety-claims-without-scope` for the intended-use guardrail).
3. Inject typography's `cssImport` verbatim into `<head>`.
4. Every hex code in the output is drawn from `palette.colors[].hex`.
5. The logo `<img src>` is `logo.assets[].url` verbatim — never constructed.

## Hard rules

- **Intended use is verbatim from the review file.** Not marketing copy, not paraphrase. The intended-use statement in the hero must match the "intended use" in the certificate exactly. Deviating from it changes the scope of certification.
- **Scope panels are both required.** "What this covers" cannot be issued without "what this does not cover" — an unbounded certification is a certification failure. If the "does not cover" list is empty, the review is not ready to publish.
- **Every finding stays on the record.** Closed findings are not deleted. The history is what makes the certification credible.
- **No safety claims.** Bare "safe" or "trusted" or "approved" language is a `guardrail/no-safety-claims-without-scope` violation. The certification IS the scope; do not translate it into consumer reassurance.
- **Reviewer name is real.** The signed-by field references a `person` item — default `person/dr-eleanor-vance`. Anonymous signing is not offered by Scarlet.
- **Standards references in `<code>`.** Every clause reference on the page renders in JetBrains Mono. Bare "IEC 62304" in prose reads as paraphrase; `<code>IEC 62304 §5.7.2</code>` reads as citation.

## Variants

- **Active certification** — Status = CERTIFIED. All sections required. Audit history shows at least the initial review and any surveillance findings (closed or open).
- **Surveillance pending** — Status = SURVEILLANCE PENDING. All sections required. Audit history includes at least one open OPEN or MAJOR-OPEN finding. Reviewer statement is the specific statement from the review file, not the default quote.
- **Suspended** — Status = SUSPENDED. Valid-until renders as "—". Reviewer statement includes the reason for suspension and the remediation path. Manufacturer must be notified before this page publishes.
