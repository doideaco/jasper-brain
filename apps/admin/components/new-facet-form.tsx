'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import {
  createCustomFacet,
  type FacetActionState,
} from '@/app/actions/facets';
import { slugify } from '@/lib/form-helpers';
import { SelectField, TextArea, TextField } from './fields';

const initial: FacetActionState = { error: null };

export interface GroupOption {
  id: string;
  label: string;
}

interface Preset {
  id: string;
  label: string;
  pluralLabel: string;
  blurb: string;
  aiInstructions: string;
  group: string;
}

const PRESETS: Preset[] = [
  {
    id: 'compliance',
    label: 'Compliance disclaimer',
    pluralLabel: 'Compliance disclaimers',
    blurb:
      'Required regulatory text for specific contexts — financial, medical, legal.',
    aiInstructions:
      "When the user's draft makes a claim falling under any disclaimer's scope (read each item's name and description), append the matching disclaimer item VERBATIM at the END of the output, set apart visually (e.g., a smaller font block or a horizontal rule above). NEVER paraphrase, abridge, or rewrite a compliance disclaimer — the wording is legally fixed. Apply ALL matching disclaimers, not just the closest one.",
    group: 'rules',
  },
  {
    id: 'proof-point',
    label: 'Proof point',
    pluralLabel: 'Proof points',
    blurb:
      'Concrete evidence — case studies, customer quotes, sourced statistics — pre-approved for use in copy.',
    aiInstructions:
      "When making a claim about traction, customer outcomes, or market position in marketing copy, sales materials, or press, source the supporting evidence from this facet ONLY. Quote items verbatim with their attribution exactly as stored. NEVER invent statistics, customer names, or success metrics. If a claim needs a number and no proof point supports it, REWRITE the claim to remove the number.",
    group: 'knowledge',
  },
  {
    id: 'objection',
    label: 'Objection response',
    pluralLabel: 'Objection responses',
    blurb:
      'Pre-written replies to common buyer objections, ready for sales, support, and outbound.',
    aiInstructions:
      "When the user asks you to handle a buyer's concern (sales copy, FAQ entry, outbound reply, support response), match the concern against each item's name/description and use the closest item's body VERBATIM as your reply. Don't paraphrase, soften, or rewrite — these are tested responses. Replace any [bracketed placeholders] with the user's specifics. If no item matches the concern with reasonable similarity, list the available items by name and ask the user which is closest — NEVER invent a response that isn't in this facet.",
    group: 'plays',
  },
  {
    id: 'press-quote',
    label: 'Press quote',
    pluralLabel: 'Press quotes',
    blurb: 'Pre-approved quotes from leadership, ready to embed in press releases.',
    aiInstructions:
      "When drafting press releases, official announcements, or third-party briefings, embed quotes from this facet VERBATIM — don't paraphrase, don't shorten, don't combine. Always include the speaker's full name and role from the item's metadata. NEVER attribute a quote to a person whose actual quote isn't here, and NEVER fabricate quotes.",
    group: 'knowledge',
  },
];

const FACET_ID_RE = /^[a-z][a-z0-9-]*$/;

export function NewFacetForm({
  brandId,
  groups,
  existingFacetIds = [],
}: {
  brandId: string;
  groups: GroupOption[];
  existingFacetIds?: string[];
}) {
  const [state, action, isPending] = useActionState(createCustomFacet, initial);

  const [label, setLabel] = useState('');
  const [pluralLabel, setPluralLabel] = useState('');
  const [id, setId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [blurb, setBlurb] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [group, setGroup] = useState('custom');

  // Keep the id in sync with the label until the user manually edits it.
  const onLabelChange = (v: string) => {
    setLabel(v);
    if (!idTouched) setId(slugify(v));
    if (!pluralLabel || pluralLabel === defaultPlural(label)) {
      setPluralLabel(defaultPlural(v));
    }
  };

  const applyPreset = (p: Preset) => {
    setLabel(p.label);
    setPluralLabel(p.pluralLabel);
    setId(p.id);
    setIdTouched(false);
    setBlurb(p.blurb);
    setAiInstructions(p.aiInstructions);
    setGroup(p.group);
  };

  const idIssue = id ? validateId(id, existingFacetIds) : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <PresetGrid presets={PRESETS} onPick={applyPreset} />

      <form action={action} className="space-y-5">
        <input type="hidden" name="brandId" value={brandId} />

        <TextField
          name="label"
          label="Label (singular)"
          required
          placeholder="e.g. Compliance disclaimer"
          hint="What this facet is called in the UI."
          defaultValue={label}
          key={`label-${label}`}
        />
        <TextField
          name="pluralLabel"
          label="Label (plural)"
          placeholder="e.g. Compliance disclaimers"
          hint="Shown in the sidebar. Defaults to singular if omitted."
          defaultValue={pluralLabel}
          key={`plural-${pluralLabel}`}
        />

        <div>
          <label className="text-sm font-medium text-stone-800">
            Facet ID
            <span className="text-red-600 ml-0.5">*</span>
          </label>
          <input
            type="text"
            name="id"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setIdTouched(true);
            }}
            onFocus={() => setIdTouched(true)}
            placeholder="auto-generated from label"
            required
            className="mt-1 block w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm font-mono shadow-xs focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
          />
          <p
            className={`text-xs mt-0.5 ${
              idIssue ? 'text-red-700' : 'text-stone-500'
            }`}
          >
            {idIssue ?? 'Lowercase letters, digits, and hyphens only. Permanent — choose carefully.'}
          </p>
        </div>

        <TextArea
          name="blurb"
          label="Description"
          rows={2}
          placeholder="One-line description of what this facet holds."
          hint="Shown in the UI and to AI tools as a one-liner."
          defaultValue={blurb}
          key={`blurb-${blurb}`}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">
            Instructions for AI tools
          </label>
          <textarea
            name="aiInstructions"
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            rows={6}
            placeholder="e.g. When the user asks you to handle a buyer concern, match it to an item and use the body VERBATIM as your reply. Replace [placeholders] with specifics. If no item matches reasonably, list the items and ask which is closest — NEVER invent a response."
            className="block w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
          />
          <details className="rounded border border-stone-200 bg-stone-50 px-3 py-2">
            <summary className="cursor-pointer text-xs text-stone-600 font-medium">
              What makes effective AI instructions?
            </summary>
            <ul className="text-xs text-stone-600 mt-2 space-y-1 leading-relaxed">
              <li>
                <strong>Trigger:</strong> name the exact situation that should
                make the AI reach for this facet ("when writing X", "when the
                user asks for Y").
              </li>
              <li>
                <strong>Action:</strong> use imperative verbs — "use", "apply",
                "append", "embed", "rewrite". Specify <em>verbatim</em> when the
                AI should not paraphrase.
              </li>
              <li>
                <strong>Constraints:</strong> spell out hard limits with NEVER
                or MUST. Vague instructions get vague behaviour.
              </li>
              <li>
                <strong>Fallback:</strong> tell the AI what to do when no item
                matches — "ask the user", "say you don't know", "skip the
                claim". Otherwise it'll improvise.
              </li>
              <li>
                <strong>Verify:</strong> end with what to check before
                returning — "scan for forbidden phrases", "confirm all
                placeholders are filled".
              </li>
            </ul>
          </details>
          <p className="text-xs text-stone-500">
            This text travels through every MCP response. Weak language gets
            weak AI behaviour — be directive.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-800">Group</label>
          <select
            name="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="block w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500">{groupHint(group)}</p>
        </div>

        {state.error && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="font-medium">{state.error}</div>
            {state.error.includes('lowercase') && (
              <div className="text-xs text-red-700 mt-1">
                Try editing the Facet ID field above — it must start with a
                lowercase letter and contain only letters, digits, and hyphens.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending || !!idIssue || !label}
            className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Creating…' : 'Create facet'}
          </button>
          <Link
            href={`/brands/${brandId}`}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function PresetGrid({
  presets,
  onPick,
}: {
  presets: Preset[];
  onPick: (p: Preset) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
        Start from a preset
      </div>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPick(p)}
            className="text-left rounded border border-stone-200 bg-white p-3 hover:border-stone-500 transition-colors"
          >
            <div className="font-medium text-sm">{p.label}</div>
            <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">
              {p.blurb}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400 mt-1.5 font-mono">
              {p.group}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-stone-500">
        Or build one from scratch below — presets just pre-fill the fields.
      </p>
    </section>
  );
}

function defaultPlural(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return '';
  // Naive English pluralisation; user can override.
  if (/(s|x|z|ch|sh)$/i.test(trimmed)) return `${trimmed}es`;
  if (/[^aeiou]y$/i.test(trimmed))
    return `${trimmed.slice(0, -1)}ies`;
  return `${trimmed}s`;
}

function validateId(id: string, existing: string[]): string | null {
  if (!FACET_ID_RE.test(id)) {
    return 'Must start with a lowercase letter and contain only lowercase letters, digits, and hyphens.';
  }
  const reserved = new Set([
    'voice',
    'value',
    'guideline',
    'guardrail',
    'skill',
    'template',
    'knowledge',
    'product',
    'person',
    'typography',
    'palette',
    'logo',
    'custom',
    'new',
    'edit',
    'assets',
    'kit',
    'search',
    'facets',
  ]);
  if (reserved.has(id)) {
    return `"${id}" is reserved (built-in facet or admin route). Pick a different id.`;
  }
  if (existing.includes(id)) {
    return `"${id}" already exists in this brand. Pick a different id.`;
  }
  return null;
}

function groupHint(group: string): string {
  switch (group) {
    case 'voice':
      return 'Identity-level — surfaces near voice and values.';
    case 'visual':
      return 'Visual identity — surfaces near typography, palette, logos.';
    case 'knowledge':
      return 'Factual content — surfaces near knowledge, products, people.';
    case 'rules':
      return 'Constraints — surfaces near guidelines and guardrails.';
    case 'plays':
      return 'Procedures — surfaces near skills and templates.';
    case 'custom':
      return 'Bottom of the sidebar — for facets that don\'t fit anywhere else.';
    default:
      return '';
  }
}
