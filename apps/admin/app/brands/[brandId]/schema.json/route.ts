import { NextResponse } from 'next/server';
import type { Faq, Logo, Person, Product } from '@jasper-brain/core';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Schema.org JSON-LD endpoint for the brand. Drop the contents into the
 * <head> of any page, or link to it via:
 *   <script type="application/ld+json" src="/brands/jasper/schema.json" />
 *
 * Public — no auth — so AI crawlers and Google Rich Results can fetch it.
 */
export async function GET(
  _req: Request,
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
  const people = items.filter((i): i is Person => i.type === 'person');
  const products = items.filter((i): i is Product => i.type === 'product');
  const faqs = items.filter((i): i is Faq => i.type === 'faq');
  const logos = items.filter((i): i is Logo => i.type === 'logo');

  const orgId = `${brand.primaryUrl ?? ''}#org`.replace(/^#/, '/#');
  const primaryLogo = logos[0]?.assets.find(
    (a) => a.background !== 'dark',
  )?.url;

  const sameAs = collectSameAs(brand);

  const graph: Record<string, unknown>[] = [];

  graph.push({
    '@type': 'Organization',
    '@id': orgId,
    name: brand.name,
    ...(brand.tagline && { slogan: brand.tagline }),
    ...(brand.description && { description: brand.description }),
    ...(brand.primaryUrl && { url: brand.primaryUrl }),
    ...(primaryLogo && { logo: primaryLogo }),
    ...(brand.founded && { foundingDate: String(brand.founded) }),
    ...(brand.hq && {
      address: {
        '@type': 'PostalAddress',
        ...(brand.hq.city && { addressLocality: brand.hq.city }),
        ...(brand.hq.region && { addressRegion: brand.hq.region }),
        ...(brand.hq.country && { addressCountry: brand.hq.country }),
      },
    }),
    ...(brand.contact?.email && {
      contactPoint: {
        '@type': 'ContactPoint',
        email: brand.contact.email,
        contactType: 'customer support',
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(brand.mission && {
      knowsAbout: brand.mission,
    }),
  });

  for (const person of people) {
    graph.push({
      '@type': 'Person',
      '@id': `${orgId}-person-${person.id}`,
      name: person.name,
      ...(person.role && { jobTitle: person.role }),
      ...(person.bio && { description: person.bio }),
      ...(person.imageUrl && { image: person.imageUrl }),
      worksFor: { '@id': orgId },
      ...(person.email && { email: person.email }),
      ...(personSameAs(person).length > 0 && { sameAs: personSameAs(person) }),
    });
  }

  for (const product of products) {
    graph.push({
      '@type': 'Product',
      '@id': `${orgId}-product-${product.id}`,
      name: product.name,
      ...(product.description && { description: product.description }),
      ...(product.sku && { sku: product.sku }),
      brand: { '@id': orgId },
      ...(product.audience && {
        audience: {
          '@type': 'Audience',
          audienceType: product.audience,
        },
      }),
      ...(product.valueProps.length > 0 && {
        keywords: product.valueProps.join(', '),
      }),
      ...(product.features.length > 0 && {
        additionalProperty: product.features.map((f) => ({
          '@type': 'PropertyValue',
          name: f.name,
          value: f.description,
        })),
      }),
      ...(product.links?.product && { url: product.links.product }),
    });
  }

  if (faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${orgId}-faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
          ...(faq.sources.length > 0 && {
            citation: faq.sources.map((s) => ({
              '@type': 'CreativeWork',
              name: s.title,
              ...(s.url && { url: s.url }),
            })),
          }),
        },
      })),
    });
  }

  return NextResponse.json(
    {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
    {
      headers: {
        'content-type': 'application/ld+json',
        'cache-control': 'public, max-age=300, s-maxage=300',
        'access-control-allow-origin': '*',
      },
    },
  );
}

function collectSameAs(brand: {
  contact?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    other?: Record<string, string>;
  };
  urls: Record<string, string>;
}): string[] {
  const out: string[] = [];
  const c = brand.contact;
  if (c?.twitter) {
    const handle = c.twitter.replace(/^@/, '');
    out.push(`https://twitter.com/${handle}`);
  }
  if (c?.linkedin) {
    const path = c.linkedin.startsWith('http')
      ? c.linkedin
      : `https://linkedin.com/${c.linkedin.replace(/^\//, '')}`;
    out.push(path);
  }
  if (c?.github) {
    const path = c.github.startsWith('http')
      ? c.github
      : `https://github.com/${c.github}`;
    out.push(path);
  }
  if (c?.other) {
    for (const v of Object.values(c.other)) out.push(v);
  }
  for (const v of Object.values(brand.urls ?? {})) out.push(v);
  return Array.from(new Set(out));
}

function personSameAs(person: Person): string[] {
  const out: string[] = [];
  if (person.social?.twitter) {
    const handle = person.social.twitter.replace(/^@/, '');
    out.push(`https://twitter.com/${handle}`);
  }
  if (person.social?.linkedin) {
    const path = person.social.linkedin.startsWith('http')
      ? person.social.linkedin
      : `https://linkedin.com/${person.social.linkedin.replace(/^\//, '')}`;
    out.push(path);
  }
  if (person.social?.github) {
    const path = person.social.github.startsWith('http')
      ? person.social.github
      : `https://github.com/${person.social.github}`;
    out.push(path);
  }
  if (person.social?.bluesky) out.push(`https://bsky.app/profile/${person.social.bluesky}`);
  if (person.social?.other) {
    for (const v of Object.values(person.social.other)) out.push(v);
  }
  return Array.from(new Set(out));
}
