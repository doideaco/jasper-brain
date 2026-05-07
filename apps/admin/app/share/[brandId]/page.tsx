import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type {
  ColorToken,
  Faq,
  Logo,
  Palette,
  Person,
  Product,
  Texture,
  TypeScaleStep,
  Typography,
  Value,
  Voice,
} from '@jasper-brain/core';
import { CopyButton } from '@/components/share/copy-button';
import { generateFontFace } from '@/lib/font-utils';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';

type Params = { brandId: string };

export default async function PublicBrandPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { brandId } = await params;
  const store = await getStore();

  let brand;
  try {
    brand = await store.getBrand(brandId);
  } catch {
    notFound();
  }

  const items = await store.listArtifacts(brandId);
  const voices = items.filter((i): i is Voice => i.type === 'voice');
  const values = items.filter((i): i is Value => i.type === 'value');
  const typographies = items.filter(
    (i): i is Typography => i.type === 'typography',
  );
  const palettes = items.filter((i): i is Palette => i.type === 'palette');
  const logos = items.filter((i): i is Logo => i.type === 'logo');
  const textures = items.filter((i): i is Texture => i.type === 'texture');
  const people = items.filter((i): i is Person => i.type === 'person');
  const products = items.filter((i): i is Product => i.type === 'product');
  const faqs = items.filter((i): i is Faq => i.type === 'faq');

  const voice = pickPrimary(voices, brand.primaryVoiceId);
  const typography = pickPrimary(typographies);
  const palette = pickPrimary(palettes);
  const logo = pickPrimary(logos);

  const tokens = paletteTokens(palette);
  const typeCss = typographyCss(typography);
  const displayStep = scaleStep(typography, ['display', 'hero']);
  const h1Step = scaleStep(typography, ['h1']);
  const h2Step = scaleStep(typography, ['h2']);
  const h3Step = scaleStep(typography, ['h3']);
  const heroStep = displayStep ?? h1Step;

  const headerList = await headers();
  const host =
    headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost';
  const protocol = headerList.get('x-forwarded-proto') ?? 'https';
  const origin = `${protocol}://${host}`;

  const mcpUrl = `${origin}/brands/${brandId}/mcp`;
  const schemaUrl = `${origin}/brands/${brandId}/schema.json`;
  const llmsUrl = `${origin}/brands/${brandId}/llms.txt`;

  return (
    <div className="brand-page">
      <style
        dangerouslySetInnerHTML={{
          __html: `
${typeCss}

.brand-page {
  --brand-bg: ${tokens.background};
  --brand-fg: ${tokens.foreground};
  --brand-fg-muted: ${tokens.foregroundMuted};
  --brand-border: ${tokens.border};
  --brand-card: ${tokens.card};
  --brand-primary: ${tokens.primary};
  --brand-primary-tint: ${tokens.primaryTint};
  --brand-display-family: ${typography?.typefaces.find((t) => t.role === 'display')?.stack ?? typography?.typefaces.find((t) => t.role === 'primary')?.stack ?? 'ui-serif, Georgia, serif'};
  --brand-body-family: ${typography?.typefaces.find((t) => t.role === 'primary')?.stack ?? 'ui-sans-serif, system-ui, sans-serif'};
  --brand-mono-family: ${typography?.typefaces.find((t) => t.role === 'mono')?.stack ?? 'ui-monospace, Menlo, monospace'};

  background: var(--brand-bg);
  color: var(--brand-fg);
  font-family: var(--brand-body-family);
  min-height: 100vh;
}
.brand-page .display { font-family: var(--brand-display-family); }
.brand-page .mono { font-family: var(--brand-mono-family); }
.brand-page a { color: inherit; }
.brand-page .accent { color: var(--brand-primary); }
.brand-page .card {
  background: var(--brand-card);
  border: 1px solid var(--brand-border);
}
`,
        }}
      />

      {/* Hero */}
      <section className="border-b" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="mx-auto max-w-5xl px-8 pt-20 pb-24">
          {logo && <Wordmark logo={logo} />}
          <h1
            className="display mt-12"
            style={{
              fontSize: heroStep?.fontSize ?? 'clamp(48px, 7vw, 96px)',
              lineHeight: heroStep?.lineHeight ?? '1.02',
              fontWeight: heroStep?.fontWeight ?? 600,
              letterSpacing: heroStep?.letterSpacing ?? '-0.025em',
            }}
          >
            {brand.tagline ?? brand.name}
          </h1>
          {brand.description && (
            <p
              className="mt-6 max-w-2xl"
              style={{
                fontSize: '20px',
                lineHeight: '1.55',
                color: 'var(--brand-fg-muted)',
              }}
            >
              {brand.description}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            {brand.primaryUrl && (
              <a
                href={brand.primaryUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--brand-primary)',
                  color: 'var(--brand-bg)',
                }}
              >
                Visit {brand.name} →
              </a>
            )}
            <a
              href="#endpoints"
              className="px-4 py-2 rounded-full border transition-colors"
              style={{
                borderColor: 'var(--brand-border)',
                color: 'var(--brand-fg)',
              }}
            >
              For developers & AI agents
            </a>
          </div>
        </div>
      </section>

      {/* Identity / Mission */}
      {(brand.mission || brand.vision) && (
        <Section title="Identity">
          <div className="grid md:grid-cols-2 gap-8">
            {brand.mission && (
              <Statement label="Mission" body={brand.mission} step={h2Step} />
            )}
            {brand.vision && (
              <Statement label="Vision" body={brand.vision} step={h2Step} />
            )}
          </div>
        </Section>
      )}

      {/* Voice */}
      {voice && (
        <Section title="Voice">
          <div className="grid md:grid-cols-[18rem_1fr] gap-10">
            <div className="space-y-5">
              {voice.tone.length > 0 && (
                <div>
                  <Label>Tone</Label>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {voice.tone.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 rounded-full text-sm"
                        style={{
                          background: 'var(--brand-primary-tint)',
                          color: 'var(--brand-primary)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {voice.vocabulary && (
                <div className="space-y-3">
                  {voice.vocabulary.prefer.length > 0 && (
                    <div>
                      <Label>Prefer</Label>
                      <ul className="mt-2 space-y-1 text-sm">
                        {voice.vocabulary.prefer.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {voice.vocabulary.avoid.length > 0 && (
                    <div>
                      <Label>Avoid</Label>
                      <ul
                        className="mt-2 space-y-1 text-sm line-through opacity-70"
                        style={{ color: 'var(--brand-fg-muted)' }}
                      >
                        {voice.vocabulary.avoid.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            {voice.body && (
              <div>
                <Label>How we sound</Label>
                <p
                  className="mt-2 whitespace-pre-wrap"
                  style={{
                    fontSize: '18px',
                    lineHeight: '1.65',
                  }}
                >
                  {voice.body}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Typography */}
      {typography && (
        <Section title="Typography">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {typography.typefaces.map((tf) => {
              const heaviest =
                tf.weights.length > 0 ? Math.max(...tf.weights) : 400;
              return (
              <div
                key={tf.family + tf.role}
                className="card rounded-lg p-6"
                style={{
                  fontFamily: tf.stack ?? 'inherit',
                }}
              >
                <div className="flex items-baseline justify-between mb-2 mono text-xs uppercase tracking-wider opacity-60">
                  <span>{tf.role}</span>
                  <span>{tf.weights.join(' · ')}</span>
                </div>
                <div
                  style={{ fontSize: '64px', lineHeight: '1.05', fontWeight: heaviest }}
                >
                  {tf.family}
                </div>
                <div className="mt-3 opacity-70" style={{ fontSize: '15px' }}>
                  The quick brown fox jumps over the lazy dog
                </div>
                {tf.use && (
                  <div
                    className="mt-3 text-sm"
                    style={{ color: 'var(--brand-fg-muted)' }}
                  >
                    {tf.use}
                  </div>
                )}
              </div>
              );
            })}
          </div>
          {typography.scale.length > 0 && (
            <div className="card rounded-lg overflow-hidden">
              <div className="mono text-xs uppercase tracking-wider opacity-60 px-6 py-3 border-b" style={{ borderColor: 'var(--brand-border)' }}>
                Type scale
              </div>
              <ul>
                {typography.scale.map((step, i) => {
                  const role = step.name.match(/display|h1|h2|h3|hero/i)
                    ? 'display'
                    : step.name.match(/mono|code/i)
                    ? 'mono'
                    : 'primary';
                  const tf = typography.typefaces.find((t) => t.role === role)
                    ?? typography.typefaces.find((t) => t.role === 'primary');
                  const family = tf?.stack ?? 'inherit';
                  return (
                    <li
                      key={`${step.name}-${i}`}
                      className="px-6 py-4 border-t"
                      style={{ borderColor: 'var(--brand-border)' }}
                    >
                      <div className="mono text-xs uppercase tracking-wider opacity-50 mb-1.5">
                        <span className="inline-block w-20">{step.name}</span>
                        <span>
                          {step.fontSize}
                          {step.lineHeight && ` · ${step.lineHeight}`}
                          {step.fontWeight && ` · ${step.fontWeight}`}
                          {step.letterSpacing && ` · ${step.letterSpacing}`}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: family,
                          fontSize: step.fontSize,
                          lineHeight: step.lineHeight ?? undefined,
                          fontWeight: step.fontWeight ?? undefined,
                          letterSpacing: step.letterSpacing ?? undefined,
                        }}
                      >
                        {sampleFor(step.name)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Palette */}
      {palette && palette.colors.length > 0 && (
        <Section title="Color">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {palette.colors.map((c) => (
              <div
                key={c.name + c.hex}
                className="card rounded-lg overflow-hidden"
              >
                <div className="h-28" style={{ backgroundColor: c.hex }} />
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <div className="font-medium">{c.name}</div>
                    {c.role && (
                      <span className="mono text-[10px] uppercase tracking-wider opacity-50">
                        {c.role}
                      </span>
                    )}
                  </div>
                  <div className="mono text-xs opacity-70 mt-0.5">{c.hex}</div>
                  {c.use && (
                    <div
                      className="text-xs mt-2 line-clamp-2"
                      style={{ color: 'var(--brand-fg-muted)' }}
                    >
                      {c.use}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Logos */}
      {logo && logo.assets.length > 0 && (
        <Section title="Logo">
          <div className="grid md:grid-cols-2 gap-4">
            {logo.assets.map((asset) => (
              <div
                key={asset.variant + asset.format}
                className="rounded-lg p-10 flex flex-col items-center justify-center min-h-[180px]"
                style={{
                  background:
                    asset.background === 'dark'
                      ? '#0c0a09'
                      : 'var(--brand-card)',
                  border: '1px solid var(--brand-border)',
                }}
              >
                {(asset.format === 'svg' || asset.format === 'png') ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={asset.url}
                    alt={asset.variant}
                    className="max-h-24 max-w-[80%] object-contain"
                  />
                ) : (
                  <div className="mono text-sm opacity-60">{asset.format}</div>
                )}
                <div
                  className="mono text-xs uppercase tracking-wider mt-6"
                  style={{
                    color:
                      asset.background === 'dark'
                        ? '#a8a29e'
                        : 'var(--brand-fg-muted)',
                  }}
                >
                  {asset.variant}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Textures */}
      {textures.length > 0 && (
        <Section title="Surface">
          <style
            dangerouslySetInnerHTML={{
              __html: textures
                .map((t, i) => `.texture-${i} { ${t.css} }`)
                .join('\n'),
            }}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {textures.map((t, i) => (
              <div key={t.id} className="card rounded-lg overflow-hidden">
                <div className={`texture-${i} h-32`} />
                <div className="p-4">
                  <div className="font-medium">{t.name}</div>
                  {t.use && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: 'var(--brand-fg-muted)' }}
                    >
                      {t.use}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Values */}
      {values.length > 0 && (
        <Section title="What we believe">
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.id} className="card rounded-lg p-6">
                <div
                  className="display mb-2"
                  style={{
                    fontSize: h3Step?.fontSize ?? '24px',
                    lineHeight: h3Step?.lineHeight ?? undefined,
                    fontWeight: h3Step?.fontWeight ?? 600,
                    letterSpacing: h3Step?.letterSpacing ?? undefined,
                  }}
                >
                  {v.name}
                </div>
                {v.description && (
                  <p style={{ color: 'var(--brand-fg-muted)' }}>
                    {v.description}
                  </p>
                )}
                {v.example && (
                  <p
                    className="mt-3 italic border-l-2 pl-3"
                    style={{ borderColor: 'var(--brand-primary)' }}
                  >
                    {v.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* People */}
      {people.length > 0 && (
        <Section title="People">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {people.map((p) => (
              <div key={p.id} className="card rounded-lg p-5">
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: 'var(--brand-primary-tint)',
                        color: 'var(--brand-primary)',
                      }}
                    >
                      <span className="font-medium">
                        {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div
                      className="text-sm"
                      style={{ color: 'var(--brand-fg-muted)' }}
                    >
                      {p.role}
                    </div>
                  </div>
                </div>
                {p.quote && (
                  <p
                    className="mt-4 italic text-sm border-l-2 pl-3"
                    style={{ borderColor: 'var(--brand-border)' }}
                  >
                    &ldquo;{p.quote}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <Section title="Products">
          <div className="grid md:grid-cols-2 gap-5">
            {products.map((p) => (
              <div key={p.id} className="card rounded-lg p-6">
                <div
                  className="display mb-2"
                  style={{
                    fontSize: h3Step?.fontSize ?? '28px',
                    lineHeight: h3Step?.lineHeight ?? undefined,
                    fontWeight: h3Step?.fontWeight ?? 600,
                    letterSpacing: h3Step?.letterSpacing ?? undefined,
                  }}
                >
                  {p.name}
                </div>
                {p.description && (
                  <p style={{ color: 'var(--brand-fg-muted)' }}>
                    {p.description}
                  </p>
                )}
                {p.valueProps.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {p.valueProps.map((vp) => (
                      <li key={vp} className="flex gap-2 text-sm">
                        <span style={{ color: 'var(--brand-primary)' }}>→</span>
                        {vp}
                      </li>
                    ))}
                  </ul>
                )}
                {p.links?.product && (
                  <a
                    href={p.links.product}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 text-sm font-medium"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <Section title="Frequently asked">
          <div className="space-y-3 max-w-3xl">
            {faqs.map((f) => (
              <details
                key={f.id}
                className="card rounded-lg overflow-hidden group"
              >
                <summary
                  className="px-5 py-4 cursor-pointer list-none flex items-baseline justify-between gap-4 font-medium"
                  style={{ color: 'var(--brand-fg)' }}
                >
                  <span>{f.question}</span>
                  <span
                    className="mono text-xs opacity-50 group-open:rotate-45 transition-transform"
                    style={{ display: 'inline-block' }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-5 pb-4 leading-relaxed border-t"
                  style={{
                    borderColor: 'var(--brand-border)',
                    color: 'var(--brand-fg-muted)',
                  }}
                >
                  <p className="pt-3 whitespace-pre-wrap">{f.answer}</p>
                  {f.sources.length > 0 && (
                    <ul className="mt-3 space-y-0.5 text-xs">
                      {f.sources.map((s) => (
                        <li key={s.title}>
                          {s.url ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                            >
                              {s.title} ↗
                            </a>
                          ) : (
                            s.title
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}

      {/* Endpoints — for developers and AI agents */}
      <section
        id="endpoints"
        className="border-t"
        style={{
          borderColor: 'var(--brand-border)',
          background: 'var(--brand-card)',
        }}
      >
        <div className="mx-auto max-w-5xl px-8 py-20">
          <div className="mono text-xs uppercase tracking-wider opacity-60">
            For developers and AI agents
          </div>
          <h2
            className="display mt-2 mb-2"
            style={{
              fontSize: h2Step?.fontSize ?? '40px',
              lineHeight: h2Step?.lineHeight ?? '1.1',
              fontWeight: h2Step?.fontWeight ?? 600,
              letterSpacing: h2Step?.letterSpacing ?? undefined,
            }}
          >
            One source. Many surfaces.
          </h2>
          <p
            className="max-w-2xl mb-10"
            style={{ color: 'var(--brand-fg-muted)' }}
          >
            Brand truth is queryable. Drop these endpoints into your site, your AI
            tools, and your training pipeline — they all read from the same store.
          </p>

          <div className="space-y-4">
            <Endpoint
              name="MCP"
              tagline="Live brand context for any AI tool. Returns voice, palette, logos, guidelines, guardrails, and instructions on every request."
              url={mcpUrl}
              snippet={`{
  "mcpServers": {
    "${brandId}-brain": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${mcpUrl}"]
    }
  }
}`}
              snippetLabel="claude_desktop_config.json"
            />

            <Endpoint
              name="JSON-LD"
              tagline="Schema.org structured data. Drop into your website's <head> for AI Overviews, Google Rich Results, and Schema-aware crawlers."
              url={schemaUrl}
              snippet={`<script type="application/ld+json" src="${schemaUrl}"></script>`}
              snippetLabel="HTML"
            />

            <Endpoint
              name="llms.txt"
              tagline="The emerging standard for telling AI crawlers what's authoritative. Serve at your site root."
              url={llmsUrl}
              snippet={`Add /llms.txt to your domain root, or proxy:\n\n${llmsUrl}`}
              snippetLabel="Setup"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-10"
        style={{
          borderColor: 'var(--brand-border)',
        }}
      >
        <div className="mx-auto max-w-5xl px-8 flex flex-wrap items-baseline justify-between gap-4 text-sm">
          <div style={{ color: 'var(--brand-fg-muted)' }}>
            This page is generated from {brand.name}'s{' '}
            <span className="font-medium" style={{ color: 'var(--brand-fg)' }}>
              Brain
            </span>
            . Updates here propagate to every connected surface in real time.
          </div>
          <div
            className="mono text-xs uppercase tracking-wider opacity-50"
          >
            Brain · by Jasper
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--brand-border)' }}
    >
      <div className="mx-auto max-w-5xl px-8 py-16">
        <div className="mono text-xs uppercase tracking-wider opacity-60 mb-6">
          {title}
        </div>
        {children}
      </div>
    </section>
  );
}

function Statement({
  label,
  body,
  step,
}: {
  label: string;
  body: string;
  step?: TypeScaleStep;
}) {
  return (
    <div>
      <div className="mono text-[10px] uppercase tracking-wider opacity-50 mb-2">
        {label}
      </div>
      <p
        className="display"
        style={{
          fontSize: step?.fontSize ?? '28px',
          lineHeight: step?.lineHeight ?? '1.3',
          fontWeight: step?.fontWeight ?? 600,
          letterSpacing: step?.letterSpacing ?? undefined,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[10px] uppercase tracking-wider opacity-60">
      {children}
    </div>
  );
}

function Wordmark({ logo }: { logo: Logo }) {
  // Prefer light-bg variant (since the page background is the brand's surface)
  const asset =
    logo.assets.find((a) => a.background === 'light' && (a.format === 'svg' || a.format === 'png')) ??
    logo.assets.find((a) => a.format === 'svg' || a.format === 'png') ??
    logo.assets[0];
  if (!asset || (asset.format !== 'svg' && asset.format !== 'png')) {
    return null;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={asset.url}
      alt={logo.name}
      className="h-10 w-auto"
    />
  );
}

function Endpoint({
  name,
  tagline,
  url,
  snippet,
  snippetLabel,
}: {
  name: string;
  tagline: string;
  url: string;
  snippet: string;
  snippetLabel: string;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{
        background: 'var(--brand-bg)',
        border: '1px solid var(--brand-border)',
      }}
    >
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
        <div className="flex items-baseline gap-3">
          <span
            className="mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: 'var(--brand-primary-tint)',
              color: 'var(--brand-primary)',
            }}
          >
            {name}
          </span>
          <code
            className="mono text-xs break-all"
            style={{ color: 'var(--brand-fg-muted)' }}
          >
            {url}
          </code>
        </div>
        <CopyButton value={url} label="Copy URL" />
      </div>
      <p className="text-sm mb-3" style={{ color: 'var(--brand-fg-muted)' }}>
        {tagline}
      </p>
      <div className="rounded p-3" style={{ background: 'var(--brand-card)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="mono text-[10px] uppercase tracking-wider opacity-60">
            {snippetLabel}
          </span>
          <CopyButton value={snippet} label="Copy" />
        </div>
        <pre
          className="mono text-[11px] leading-relaxed whitespace-pre-wrap"
          style={{ color: 'var(--brand-fg)' }}
        >
          {snippet}
        </pre>
      </div>
    </div>
  );
}

interface PaletteTokens {
  background: string;
  foreground: string;
  foregroundMuted: string;
  border: string;
  card: string;
  primary: string;
  primaryTint: string;
}

function paletteTokens(palette?: Palette): PaletteTokens {
  const find = (predicate: (c: ColorToken) => boolean) =>
    palette?.colors.find(predicate);
  const byRole = (role: string) =>
    find((c) => (c.role ?? '').toLowerCase().includes(role));
  const byNamePart = (part: string) =>
    find((c) => c.name.toLowerCase().includes(part));

  const background =
    byRole('background')?.hex ??
    byNamePart('surface')?.hex ??
    '#fafaf9';
  const card =
    byRole('background-elevated')?.hex ??
    byNamePart('card')?.hex ??
    '#ffffff';
  const foreground =
    byRole('foreground')?.hex ??
    byNamePart('ink')?.hex ??
    '#0c0a09';
  const foregroundMuted =
    byRole('foreground-secondary')?.hex ??
    byRole('foreground-muted')?.hex ??
    byNamePart('stone-700')?.hex ??
    '#44403c';
  const border =
    byRole('border')?.hex ??
    byNamePart('stone-200')?.hex ??
    '#e7e5e4';
  const primary =
    byRole('primary')?.hex ??
    byNamePart('brand')?.hex ??
    '#7c3aed';
  const primaryTint =
    byRole('primary-tint')?.hex ??
    byNamePart('brand-50')?.hex ??
    '#f5f3ff';

  return {
    background,
    foreground,
    foregroundMuted,
    border,
    card,
    primary,
    primaryTint,
  };
}

function typographyCss(typography?: Typography): string {
  if (!typography) return '';
  const blocks: string[] = [];
  for (const tf of typography.typefaces) {
    // 1. Self-hosted @font-face declarations (uploaded woff/woff2/ttf/otf)
    const files = tf.source?.files ?? [];
    if (files.length > 0) {
      const face = generateFontFace(
        tf.family,
        files.map((f) => ({
          url: f.url,
          weight: f.weight,
          style: f.style,
          format: f.format,
        })),
      );
      if (face) blocks.push(face);
    }

    // 2. Google Fonts / external @import (only if no self-hosted files)
    if (files.length === 0) {
      const css = tf.source?.cssImport ?? '';
      if (css) {
        const linkMatch = css.match(/<link[^>]+href=['"]([^'"]+)['"]/i);
        blocks.push(linkMatch ? `@import url('${linkMatch[1]}');` : css);
      }
    }
  }
  return blocks.join('\n\n');
}

function scaleStep(
  typography: Typography | undefined,
  names: string[],
): TypeScaleStep | undefined {
  if (!typography) return undefined;
  for (const name of names) {
    const step = typography.scale.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    if (step) return step;
  }
  return undefined;
}

function stepStyle(step: TypeScaleStep | undefined): React.CSSProperties {
  if (!step) return {};
  return {
    fontSize: step.fontSize,
    lineHeight: step.lineHeight ?? undefined,
    fontWeight: step.fontWeight ?? undefined,
    letterSpacing: step.letterSpacing ?? undefined,
  };
}

function pickPrimary<T extends { id: string; tags: string[] }>(
  items: T[],
  preferredId?: string,
): T | undefined {
  if (items.length === 0) return undefined;
  if (preferredId) {
    const m = items.find((i) => i.id === preferredId);
    if (m) return m;
  }
  return (
    items.find((i) => i.tags.includes('primary')) ??
    items.find((i) => i.id === 'default') ??
    items[0]
  );
}

function sampleFor(stepName: string): string {
  const n = stepName.toLowerCase();
  if (n === 'display' || n.includes('hero')) return 'A brand for the AI era.';
  if (['h1', 'h2', 'h3'].includes(n)) return 'Content that ships.';
  if (n.includes('caption') || n.includes('eyebrow') || n.includes('label'))
    return 'EYEBROW · METADATA';
  if (n.includes('mono') || n.includes('code')) return 'const brand = new Brain()';
  return 'The quick brown fox jumps over the lazy dog.';
}
