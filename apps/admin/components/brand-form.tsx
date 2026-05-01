'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Brand } from '@jasper-brain/core';
import { saveBrand, type BrandActionState } from '@/app/actions/brand';
import { toYaml } from '@/lib/form-helpers';
import { TagsField, TextArea, TextField, YamlField } from './fields';

const initial: BrandActionState = { error: null };

export function BrandForm({ brand }: { brand: Brand }) {
  const [state, action, isPending] = useActionState(saveBrand, initial);

  return (
    <form action={action} className="space-y-8 max-w-2xl">
      <input type="hidden" name="id" value={brand.id} />

      <Section title="Identity">
        <TextField
          name="name"
          label="Name"
          required
          defaultValue={brand.name}
        />
        <TextField
          name="tagline"
          label="Tagline"
          hint="One short line. Goes on the front door."
          defaultValue={brand.tagline}
        />
        <TextArea
          name="description"
          label="Description"
          rows={3}
          hint="One paragraph. What you do, who for, what changes for them."
          defaultValue={brand.description}
        />
        <TagsField name="tags" label="Tags" defaultValue={brand.tags} />
      </Section>

      <Section title="Web presence">
        <TextField
          name="primaryUrl"
          label="Primary URL"
          placeholder="https://yourbrand.com"
          defaultValue={brand.primaryUrl}
        />
        <YamlField
          name="urls"
          label="Other URLs (YAML)"
          rows={6}
          defaultValue={toYaml(brand.urls)}
          hint="Object: { product: '…', docs: '…', blog: '…', press: '…' }"
        />
      </Section>

      <Section title="Mission & vision">
        <TextArea
          name="mission"
          label="Mission"
          rows={3}
          hint="What you exist to do, today."
          defaultValue={brand.mission}
        />
        <TextArea
          name="vision"
          label="Vision"
          rows={3}
          hint="The world you're trying to create."
          defaultValue={brand.vision}
        />
      </Section>

      <Section title="Company">
        <TextField
          name="founded"
          label="Founded"
          placeholder="2021"
          hint="Year only."
          defaultValue={brand.founded?.toString()}
        />
        <YamlField
          name="hq"
          label="Headquarters (YAML)"
          rows={4}
          defaultValue={toYaml(brand.hq)}
          hint="Object: { city, region, country }"
        />
        <YamlField
          name="contact"
          label="Contact (YAML)"
          rows={6}
          defaultValue={toYaml(brand.contact)}
          hint="Object: { email, twitter, linkedin, github, other: { … } }"
        />
      </Section>

      <Section title="Defaults">
        <TextField
          name="primaryVoiceId"
          label="Primary voice ID"
          hint='ID of the default voice to use when none is specified.'
          defaultValue={brand.primaryVoiceId}
        />
      </Section>

      {state.error && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
        <Link
          href={`/brands/${brand.id}`}
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          Cancel
        </Link>
      </div>
    </form>
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
    <section className="space-y-4">
      <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold border-b border-stone-200 pb-1.5">
        {title}
      </h3>
      {children}
    </section>
  );
}
