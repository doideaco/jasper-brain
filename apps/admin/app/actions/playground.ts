'use server';

import { generateText } from 'ai';
import { getBrandKit } from '@jasper-brain/core';
import { requireUser } from '@/lib/auth';
import { getStore } from '@/lib/store';
import { requireString } from '@/lib/form-helpers';

export interface PlaygroundResult {
  ok: boolean;
  prompt?: string;
  output?: string;
  kitJson?: string;
  modelUsed?: string;
  durationMs?: number;
  error?: string;
}

const SYSTEM_PROMPT = `You are an AI authoring assistant grounded in a brand's Brain context.

The user has provided you with the full structured brand kit below — voice, values, visual identity (typography, palette, logos, textures), guardrails, people, products, and behavioural instructions per facet.

When generating output:
- READ each facet's aiInstructions carefully and follow them as hard rules.
- Match the brand's primary voice — tone descriptors, prefer/avoid vocabulary, sentence rhythm — exactly.
- Apply every guardrail. Block-severity guardrails are non-negotiable; rewrite until violations are zero.
- Use named palette tokens (with their hex values), typography family + scale steps, and logo asset URLs verbatim where applicable.
- Never fabricate facts about the brand that aren't in the kit. If you'd otherwise need to invent something, ask the user instead.
- Cite items by their facet/id when relevant ("see voice/default", "applying guardrail/no-unverified-stats").

Be direct and useful — voice rules apply to your responses too.`;

export async function generateOutput(
  _prev: PlaygroundResult | null,
  formData: FormData,
): Promise<PlaygroundResult> {
  const start = Date.now();

  try {
    await requireUser();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unauthorized.',
    };
  }

  let brandId: string;
  let prompt: string;
  try {
    brandId = requireString(formData, 'brandId');
    prompt = requireString(formData, 'prompt');
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Missing fields.',
    };
  }

  let kit;
  try {
    const store = await getStore();
    kit = await getBrandKit(store, brandId);
  } catch (err) {
    return {
      ok: false,
      error: `Could not load brand kit: ${
        err instanceof Error ? err.message : 'unknown'
      }`,
    };
  }

  const kitJson = JSON.stringify(kit, null, 2);

  const model = process.env.PLAYGROUND_MODEL ?? 'anthropic/claude-sonnet-4.5';

  let text: string;
  try {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      prompt: `Brand kit (JSON):\n\n\`\`\`json\n${kitJson}\n\`\`\`\n\n---\n\nUser request:\n\n${prompt}`,
      temperature: 0.4,
    });
    text = result.text;
  } catch (err) {
    return {
      ok: false,
      error: `Generation failed: ${
        err instanceof Error ? err.message : 'unknown'
      }. (If this is a key/auth issue: set AI_GATEWAY_API_KEY in Vercel env vars or enable the AI Gateway integration in your Vercel project.)`,
      kitJson,
    };
  }

  return {
    ok: true,
    prompt,
    output: text,
    kitJson,
    modelUsed: model,
    durationMs: Date.now() - start,
  };
}
