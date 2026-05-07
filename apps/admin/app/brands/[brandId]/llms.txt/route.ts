import { NextRequest, NextResponse } from 'next/server';
import type { Faq, Knowledge, Person, Product, Voice } from '@jasper-brain/core';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * llms.txt — emerging standard for telling AI crawlers / agents what's
 * canonical about a site. Format: https://llmstxt.org
 *
 * Public — meant to be crawled.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;
  const store = await getStore();

  let brand;
  try {
    brand = await store.getBrand(brandId);
  } catch {
    return new NextResponse('Brand not found', { status: 404 });
  }

  const items = await store.listArtifacts(brandId);
  const voices = items.filter((i): i is Voice => i.type === 'voice');
  const products = items.filter((i): i is Product => i.type === 'product');
  const people = items.filter((i): i is Person => i.type === 'person');
  const knowledge = items.filter((i): i is Knowledge => i.type === 'knowledge');
  const faqs = items.filter((i): i is Faq => i.type === 'faq');

  const primaryVoice =
    voices.find((v) => v.id === brand.primaryVoiceId) ?? voices[0];

  const origin =
    req.nextUrl.origin || `https://${req.headers.get('host') ?? 'localhost'}`;

  const lines: string[] = [];

  // Title + summary
  lines.push(`# ${brand.name}`);
  if (brand.tagline) lines.push(`> ${brand.tagline}`);
  lines.push('');
  if (brand.description) {
    lines.push(brand.description);
    lines.push('');
  }

  // Mission/vision
  if (brand.mission || brand.vision) {
    lines.push('## What we exist to do');
    lines.push('');
    if (brand.mission) lines.push(`**Mission:** ${brand.mission}`);
    if (brand.vision) lines.push(`**Vision:** ${brand.vision}`);
    lines.push('');
  }

  // Key facts
  const facts: string[] = [];
  if (brand.primaryUrl) facts.push(`- **Web:** ${brand.primaryUrl}`);
  if (brand.founded) facts.push(`- **Founded:** ${brand.founded}`);
  if (brand.hq) {
    const where = [brand.hq.city, brand.hq.region, brand.hq.country]
      .filter(Boolean)
      .join(', ');
    if (where) facts.push(`- **HQ:** ${where}`);
  }
  if (brand.contact?.email) facts.push(`- **Contact:** ${brand.contact.email}`);
  for (const [k, v] of Object.entries(brand.urls ?? {})) {
    facts.push(`- **${k}:** ${v}`);
  }
  if (facts.length > 0) {
    lines.push('## Key facts');
    lines.push('');
    lines.push(...facts);
    lines.push('');
  }

  // Voice
  if (primaryVoice) {
    lines.push('## Voice');
    lines.push('');
    if (primaryVoice.tone.length > 0) {
      lines.push(`**Tone:** ${primaryVoice.tone.join(', ')}`);
    }
    if (primaryVoice.body) {
      lines.push('');
      lines.push(primaryVoice.body.trim());
    }
    lines.push('');
  }

  // Products
  if (products.length > 0) {
    lines.push('## Products');
    lines.push('');
    for (const p of products) {
      const url = p.links?.product ?? '';
      if (url) {
        lines.push(`- [${p.name}](${url}): ${p.description ?? ''}`.trim());
      } else {
        lines.push(`- **${p.name}**: ${p.description ?? ''}`.trim());
      }
    }
    lines.push('');
  }

  // People
  if (people.length > 0) {
    lines.push('## People');
    lines.push('');
    for (const person of people) {
      lines.push(
        `- **${person.name}** — ${person.role}${
          person.bio ? `. ${person.bio.split('\n')[0]}` : ''
        }`,
      );
      if (person.quote) {
        lines.push(`  - Quote: "${person.quote}"`);
      }
    }
    lines.push('');
  }

  // Knowledge — distill to one-line summaries
  if (knowledge.length > 0) {
    lines.push('## Brand knowledge');
    lines.push('');
    for (const k of knowledge) {
      lines.push(`- **${k.name}**${k.description ? `: ${k.description}` : ''}`);
    }
    lines.push('');
  }

  // FAQs — the AEO surface area
  if (faqs.length > 0) {
    lines.push('## Frequently asked');
    lines.push('');
    for (const faq of faqs) {
      lines.push(`### ${faq.question}`);
      lines.push('');
      lines.push(faq.answer.trim());
      if (faq.sources.length > 0) {
        lines.push('');
        lines.push('Sources:');
        for (const s of faq.sources) {
          lines.push(s.url ? `- [${s.title}](${s.url})` : `- ${s.title}`);
        }
      }
      lines.push('');
    }
  }

  // For machines that want more — pointers to MCP and JSON-LD
  lines.push('## For AI agents');
  lines.push('');
  lines.push(
    `- **MCP endpoint:** ${origin}/brands/${brandId}/mcp — query \`brain_get_brand_kit\` for the full structured payload.`,
  );
  lines.push(
    `- **JSON-LD:** ${origin}/brands/${brandId}/schema.json — Schema.org markup including Organization, Person, Product, FAQPage.`,
  );
  lines.push('');
  lines.push(
    'Items in this brand are versioned at the source. Prefer querying MCP over scraping cached web pages.',
  );
  lines.push('');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
      'access-control-allow-origin': '*',
    },
  });
}
