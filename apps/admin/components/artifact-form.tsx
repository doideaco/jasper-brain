'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { Artifact, FacetDefinition } from '@jasper-brain/core';
import { saveArtifact, type ActionState } from '@/app/actions/artifacts';
import { toYaml } from '@/lib/form-helpers';
import {
  LinesField,
  SelectField,
  TagsField,
  TextArea,
  TextField,
  YamlField,
} from './fields';

const initial: ActionState = { error: null };

interface Props {
  brandId: string;
  facet: FacetDefinition;
  artifact?: Artifact;
}

export function ArtifactForm({ brandId, facet, artifact }: Props) {
  const [state, action, isPending] = useActionState(saveArtifact, initial);
  const isEdit = !!artifact;

  return (
    <form action={action} className="space-y-5 max-w-2xl">
      <input type="hidden" name="brandId" value={brandId} />
      <input type="hidden" name="facetId" value={facet.id} />

      <TextField
        name="id"
        label="ID"
        required
        hint={
          isEdit
            ? 'IDs are immutable. Delete and recreate to rename.'
            : 'Lowercase, hyphenated. e.g. "lead-with-outcome".'
        }
        defaultValue={artifact?.id}
        disabled={isEdit}
        placeholder={isEdit ? undefined : 'e.g. lead-with-outcome'}
      />
      <TextField
        name="name"
        label="Name"
        required
        defaultValue={artifact?.name}
        placeholder={`e.g. ${facet.label} title`}
      />
      <TextField
        name="description"
        label="Description"
        hint="One-line summary, shown in lists."
        defaultValue={artifact?.description}
      />
      <TagsField name="tags" label="Tags" defaultValue={artifact?.tags} />

      <TypeSpecificFields facet={facet} artifact={artifact} />

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
          {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </button>
        <Link
          href={
            isEdit
              ? `/brands/${brandId}/${facet.id}/${artifact.id}`
              : `/brands/${brandId}`
          }
          className="text-sm text-stone-600 hover:text-stone-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function TypeSpecificFields({
  facet,
  artifact,
}: {
  facet: FacetDefinition;
  artifact?: Artifact;
}) {
  const type = facet.builtIn ? facet.id : 'custom';

  if (type === 'guideline') {
    const a = artifact?.type === 'guideline' ? artifact : undefined;
    return (
      <>
        <TextField name="scope" label="Scope" hint="When this applies." defaultValue={a?.scope} />
        <TextArea name="body" label="Body" required rows={8} defaultValue={a?.body} />
        <LinesField
          name="examples.do"
          label="Examples — Do"
          defaultValue={a?.examples?.do}
        />
        <LinesField
          name="examples.dont"
          label="Examples — Don't"
          defaultValue={a?.examples?.dont}
        />
      </>
    );
  }

  if (type === 'voice') {
    const a = artifact?.type === 'voice' ? artifact : undefined;
    return (
      <>
        <LinesField
          name="tone"
          label="Tone"
          hint="One descriptor per line. e.g. confident, plain."
          defaultValue={a?.tone}
        />
        <LinesField
          name="vocabulary.prefer"
          label="Vocabulary — Prefer"
          defaultValue={a?.vocabulary?.prefer}
        />
        <LinesField
          name="vocabulary.avoid"
          label="Vocabulary — Avoid"
          defaultValue={a?.vocabulary?.avoid}
        />
        <TextArea name="body" label="Body" required rows={10} defaultValue={a?.body} />
      </>
    );
  }

  if (type === 'skill') {
    const a = artifact?.type === 'skill' ? artifact : undefined;
    return (
      <>
        <TextArea
          name="whenToUse"
          label="When to use"
          required
          rows={3}
          hint="The trigger for this skill."
          defaultValue={a?.whenToUse}
        />
        <TextArea
          name="body"
          label="Body (markdown)"
          required
          rows={14}
          monospace
          defaultValue={a?.body}
        />
      </>
    );
  }

  if (type === 'template') {
    const a = artifact?.type === 'template' ? artifact : undefined;
    return (
      <>
        <TextField
          name="format"
          label="Format"
          required
          hint='e.g. "email", "landing-page"'
          defaultValue={a?.format}
        />
        <YamlField
          name="sections"
          label="Sections (YAML)"
          rows={16}
          defaultValue={toYaml(a?.sections)}
          hint="Array of objects with name, guidance, tone, lengthHint, required, slots."
        />
        <TextArea
          name="body"
          label="Notes"
          rows={4}
          defaultValue={a?.body}
        />
      </>
    );
  }

  if (type === 'knowledge') {
    const a = artifact?.type === 'knowledge' ? artifact : undefined;
    return (
      <>
        <TextArea name="body" label="Body (markdown)" required rows={14} defaultValue={a?.body} />
        <YamlField
          name="sources"
          label="Sources (YAML)"
          rows={6}
          defaultValue={toYaml(a?.sources)}
          hint="Array of {title, url}."
        />
      </>
    );
  }

  if (type === 'guardrail') {
    const a = artifact?.type === 'guardrail' ? artifact : undefined;
    return (
      <>
        <SelectField
          name="severity"
          label="Severity"
          defaultValue={a?.severity ?? 'warn'}
          options={[
            { value: 'warn', label: 'Warn — flag but allow' },
            { value: 'block', label: 'Block — hard stop' },
          ]}
        />
        <TextField name="scope" label="Scope" hint="When this applies." defaultValue={a?.scope} />
        <TextArea name="body" label="Body" required rows={6} defaultValue={a?.body} />
        <LinesField
          name="violations"
          label="Violations (examples to avoid)"
          defaultValue={a?.violations}
        />
        <LinesField
          name="compliant"
          label="Compliant alternatives"
          defaultValue={a?.compliant}
        />
      </>
    );
  }

  if (type === 'product') {
    const a = artifact?.type === 'product' ? artifact : undefined;
    return (
      <>
        <TextField name="sku" label="SKU" defaultValue={a?.sku} />
        <TextField name="audience" label="Audience" defaultValue={a?.audience} />
        <LinesField
          name="valueProps"
          label="Value props"
          defaultValue={a?.valueProps}
        />
        <YamlField
          name="features"
          label="Features (YAML)"
          rows={10}
          defaultValue={toYaml(a?.features)}
          hint="Array of {name, description}."
        />
        <TextField name="pricing" label="Pricing" defaultValue={a?.pricing} />
        <YamlField
          name="links"
          label="Links (YAML)"
          rows={4}
          defaultValue={toYaml(a?.links)}
          hint="Object: { product: 'https://…', docs: '…' }"
        />
        <TextArea name="body" label="Notes" rows={4} defaultValue={a?.body} />
      </>
    );
  }

  if (type === 'value') {
    const a = artifact?.type === 'value' ? artifact : undefined;
    return (
      <>
        <TextArea
          name="body"
          label="What this value means"
          required
          rows={6}
          defaultValue={a?.body}
        />
        <TextArea
          name="example"
          label="Example"
          rows={3}
          hint="A concrete example of this value in practice."
          defaultValue={a?.example}
        />
      </>
    );
  }

  if (type === 'person') {
    const a = artifact?.type === 'person' ? artifact : undefined;
    return (
      <>
        <TextField
          name="role"
          label="Role"
          required
          placeholder="e.g. Co-founder & CEO"
          defaultValue={a?.role}
        />
        <TextArea
          name="bio"
          label="Bio"
          required
          rows={5}
          defaultValue={a?.bio}
        />
        <TextArea
          name="quote"
          label="Signature quote"
          rows={3}
          hint="Optional. A line that captures how this person talks."
          defaultValue={a?.quote}
        />
        <TextField name="email" label="Email" defaultValue={a?.email} />
        <TextField
          name="imageUrl"
          label="Image URL"
          hint="Headshot — public URL."
          defaultValue={a?.imageUrl}
        />
        <YamlField
          name="social"
          label="Social links (YAML)"
          rows={5}
          defaultValue={toYaml(a?.social)}
          hint="Object: { twitter: '@handle', linkedin: 'url', github: 'handle' }"
        />
        <TextArea name="body" label="Notes" rows={3} defaultValue={a?.body} />
      </>
    );
  }

  if (type === 'typography') {
    const a = artifact?.type === 'typography' ? artifact : undefined;
    return (
      <>
        <YamlField
          name="typefaces"
          label="Typefaces (YAML)"
          rows={14}
          defaultValue={toYaml(a?.typefaces)}
          hint='Array of typefaces. Each: { family, role: "primary"|"display"|"mono", stack, weights, source: { provider, url, cssImport, files: [{ weight, style, url, format }] } }'
        />
        <YamlField
          name="scale"
          label="Type scale (YAML)"
          rows={12}
          defaultValue={toYaml(a?.scale)}
          hint='Array of steps. Each: { name, fontSize, lineHeight, fontWeight, letterSpacing, use }'
        />
        <TextArea
          name="body"
          label="Usage rules"
          rows={5}
          defaultValue={a?.body}
        />
      </>
    );
  }

  if (type === 'palette') {
    const a = artifact?.type === 'palette' ? artifact : undefined;
    return (
      <>
        <YamlField
          name="colors"
          label="Color tokens (YAML)"
          rows={14}
          defaultValue={toYaml(a?.colors)}
          hint='Array of color tokens. Each: { name, hex, role, use, contrast: { onLight, onDark } }'
        />
        <TextArea
          name="body"
          label="Usage rules"
          rows={5}
          defaultValue={a?.body}
        />
      </>
    );
  }

  if (type === 'logo') {
    const a = artifact?.type === 'logo' ? artifact : undefined;
    return (
      <>
        <YamlField
          name="assets"
          label="Assets (YAML)"
          rows={10}
          defaultValue={toYaml(a?.assets)}
          hint='Array of assets. Each: { variant, format: "svg"|"png"|..., url, use, background: "light"|"dark"|"either" }'
        />
        <TextField
          name="clearSpace"
          label="Clear space"
          placeholder="e.g. Maintain 1× cap-height of clear space on all sides"
          defaultValue={a?.clearSpace}
        />
        <TextField
          name="minSize"
          label="Minimum size"
          placeholder="e.g. 24px tall"
          defaultValue={a?.minSize}
        />
        <TextArea
          name="body"
          label="Do's and don'ts"
          rows={5}
          defaultValue={a?.body}
        />
      </>
    );
  }

  if (type === 'custom') {
    const a = artifact?.type === 'custom' ? artifact : undefined;
    return (
      <>
        <TextArea
          name="body"
          label="Body (markdown)"
          required
          rows={12}
          defaultValue={a?.body}
          hint="The main content for this item. Markdown supported."
        />
        <YamlField
          name="data"
          label="Extra fields (YAML)"
          rows={6}
          defaultValue={toYaml(a?.data)}
          hint="Optional. Arbitrary structured data — saved into the item's frontmatter."
        />
      </>
    );
  }

  return null;
}
