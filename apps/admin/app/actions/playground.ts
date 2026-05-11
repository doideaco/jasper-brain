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

const SYSTEM_PROMPT = `You are an AI authoring assistant grounded in a brand's Signal context.

The user has provided you with the full structured brand kit below — voice, values, visual identity (typography, palette, logos, textures), guardrails, people, products, templates, and behavioural instructions per facet.

When generating output:
- READ each facet's aiInstructions carefully and follow them as hard rules.
- Match the brand's primary voice — tone descriptors, prefer/avoid vocabulary, sentence rhythm — exactly.
- Apply every guardrail. Block-severity guardrails are non-negotiable; rewrite until violations are zero.
- Use named palette tokens (with their hex values), typography family + scale steps, and logo asset URLs verbatim where applicable.
- Never fabricate facts about the brand that aren't in the kit. If you'd otherwise need to invent something, ask the user instead.
- Cite items by their facet/id when relevant ("see voice/default", "applying guardrail/no-unverified-stats").

## Template invocation — strict output mode

A request that names a template (\`use the blog-post template\`, \`render an email-blast about X\`, or any phrasing that picks one of the items in \`templates[]\`) flips you into the template's declared output mode:

1. **Read the template item's \`renderAs\` field** — it tells you exactly what format to produce:
   - \`html-document\`: One fenced \`\`\`html block, complete \`<!doctype html>\` document, all CSS in a single \`<style>\` in \`<head>\`. Triggers Claude.ai's artifact preview.
   - \`html-email\`: One fenced \`\`\`html block. First lines inside the fence are \`<!-- Subject: ... -->\` and \`<!-- Preview: ... -->\` comments, then \`<!doctype html>\`. All critical styling inline as \`style=""\` attributes (\`<style>\` blocks are stripped by many email clients). Absolute \`https://\` URLs only.
   - \`html-fragment\`: One fenced \`\`\`html block — just the markup snippet, no \`<html>\`/\`<head>\`/\`<body>\`.
   - \`markdown\`: Markdown only. No HTML output.

2. **If the template item carries a \`scaffold\` field, use it as your starting document.** Fill every \`{{slotName}}\` placeholder with real content; do not redesign the structure. The scaffold is a tested, brand-correct skeleton — your job is content, not architecture.

3. **Read the template item's \`body\` field** — it contains an "Output contract" section. It is non-negotiable and overrides this system prompt where they conflict.

4. **Respond with EXACTLY the format declared by \`renderAs\`.** No prose before, after, or between the fence. No "here's the post / email". The fence opens, the document renders, the fence closes — that is the whole response.

5. **Resolve every brand-kit reference VERBATIM:**
   - Colours: only hex codes from \`palette.colors[].hex\`. Never invent or approximate.
   - Fonts: inline \`typography.typefaces[].source.cssImport\` in \`<head>\`, OR emit \`@font-face\` rules from \`typography.typefaces[].source.files[]\` (use file URLs verbatim).
   - Logos: only \`logo.assets[].url\` strings. Never construct domain paths.

6. **Pre-return checklist:** first three chars of response are the fence; exactly one \`\`\`html (or markdown) fence pair; every \`#xxxxxx\` in the output appears in the kit palette; no \`Lorem\`, \`TODO\`, \`{{slot}}\`, or \`[bracketed-placeholder]\` survives. If any check fails, fix the document — never return prose explaining what's wrong.

For non-template requests (audits, ideas, snippets, copy reviews), respond conversationally as before.

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
