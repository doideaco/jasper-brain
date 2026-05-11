'use client';

import { useActionState, useState } from 'react';
import {
  generateOutput,
  type PlaygroundResult,
} from '@/app/actions/playground';

const initial: PlaygroundResult | null = null;

const SUGGESTIONS = [
  'Write a launch announcement email for our new Texture facet — CSS-driven brand surface treatments. Output as plain text with a Subject and Preview line, following the email-blast template hard rules.',
  'Generate the hero + lead paragraph + closing for a blog post about why brand context belongs in MCP. Use the blog-post template. Render as HTML with inline styles using the actual palette and typography tokens.',
  'Audit this draft against our voice and guardrails and return a list of violations with suggested rewrites:\n\n"We\'re excited to announce our revolutionary new AI platform that 50,000+ marketing teams use to leverage cutting-edge generative AI..."',
  'Write three LinkedIn posts about Signal — one as Alex Morris (founder), one as a marketing manager who just switched to Jasper, and one announcing a new Brand Voice feature. Vary the openers but keep voice consistent.',
];

export function PlaygroundForm({ brandId }: { brandId: string }) {
  const [state, action, isPending] = useActionState(generateOutput, initial);
  const [prompt, setPrompt] = useState('');

  return (
    <div className="grid lg:grid-cols-[1fr_22rem] gap-8">
      <div className="space-y-5 min-w-0">
        <form action={action} className="space-y-3">
          <input type="hidden" name="brandId" value={brandId} />
          <textarea
            name="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            required
            placeholder="What should the AI do? (e.g. Write a launch email about our new feature…)"
            className="w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending || !prompt.trim()}
              className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {isPending ? 'Generating…' : 'Generate with brand context'}
            </button>
            {state?.modelUsed && state.ok && (
              <span className="text-xs text-stone-500 font-mono">
                {state.modelUsed} · {state.durationMs}ms
              </span>
            )}
          </div>
        </form>

        {state?.error && (
          <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.error}
          </div>
        )}

        {state?.ok && state.output && (
          <section className="rounded-lg border border-stone-200 bg-white">
            <header className="px-5 py-3 border-b border-stone-100 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
                Output
              </span>
              <CopyButton value={state.output} />
            </header>
            <div className="px-5 py-4">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-800">
                {state.output}
              </pre>
            </div>
          </section>
        )}

        {!state && (
          <section>
            <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-2">
              Try one of these
            </div>
            <div className="grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.slice(0, 40)}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="text-left text-sm text-stone-700 rounded border border-stone-200 bg-white px-4 py-3 hover:border-stone-400 transition-colors"
                >
                  {s.split('\n')[0]}
                  {s.includes('\n') && (
                    <span className="text-stone-400">…</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-stone-500 font-semibold">
          Brand context the AI sees
        </div>
        {state?.kitJson ? (
          <details className="rounded-lg border border-stone-200 bg-white">
            <summary className="cursor-pointer list-none px-4 py-2.5 flex items-center justify-between text-sm">
              <span className="font-medium">brain_get_brand_kit JSON</span>
              <span className="text-[10px] uppercase tracking-wider bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                {Math.round(state.kitJson.length / 1024)} KB
              </span>
            </summary>
            <div className="border-t border-stone-100 p-3">
              <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto max-h-[60vh] text-stone-700">
                {state.kitJson}
              </pre>
            </div>
          </details>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-300 p-4 text-xs text-stone-500">
            Generate something to see the exact MCP payload that grounded the
            response.
          </div>
        )}
        <div className="text-xs text-stone-500 leading-relaxed">
          Every generation pulls{' '}
          <code className="bg-stone-100 px-1 py-0.5 rounded text-[10px]">
            brain_get_brand_kit
          </code>{' '}
          first, then sends voice + values + visual identity + guardrails +
          per-facet instructions to the model. Output is grounded in the kit —
          no fabricated facts.
        </div>
      </aside>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs font-medium text-stone-700 hover:text-stone-900"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
