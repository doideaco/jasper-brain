import type { Artifact } from '@jasper-brain/core';

export function ArtifactView({ artifact }: { artifact: Artifact }) {
  return (
    <div className="space-y-6">
      {renderTypeSpecific(artifact)}
      {'body' in artifact && typeof artifact.body === 'string' && artifact.body.trim() && (
        <Section title="Body">
          <pre className="whitespace-pre-wrap font-sans text-stone-800 leading-relaxed">
            {artifact.body}
          </pre>
        </Section>
      )}
    </div>
  );
}

function renderTypeSpecific(artifact: Artifact) {
  switch (artifact.type) {
    case 'voice':
      return (
        <>
          {artifact.tone.length > 0 && (
            <Section title="Tone">
              <Pills items={artifact.tone} />
            </Section>
          )}
          {artifact.vocabulary && (
            <Section title="Vocabulary">
              <div className="grid sm:grid-cols-2 gap-4">
                <Subsection label="Prefer" items={artifact.vocabulary.prefer} positive />
                <Subsection label="Avoid" items={artifact.vocabulary.avoid} />
              </div>
            </Section>
          )}
        </>
      );
    case 'guideline':
      return (
        <>
          {artifact.scope && (
            <Section title="Scope">
              <p className="text-stone-700">{artifact.scope}</p>
            </Section>
          )}
          {artifact.examples && (
            <Section title="Examples">
              <div className="grid sm:grid-cols-2 gap-4">
                <Subsection label="Do" items={artifact.examples.do} positive />
                <Subsection label="Don't" items={artifact.examples.dont} />
              </div>
            </Section>
          )}
        </>
      );
    case 'skill':
      return (
        <>
          <Section title="When to use">
            <p className="text-stone-700">{artifact.whenToUse}</p>
          </Section>
          {artifact.files.length > 0 && (
            <Section title="Supporting files">
              <ul className="text-sm text-stone-600 list-disc list-inside">
                {artifact.files.map((f) => (
                  <li key={f}>
                    <code>{f}</code>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      );
    case 'template':
      return (
        <>
          <Section title="Format">
            <code className="bg-stone-100 px-2 py-1 rounded text-sm">
              {artifact.format}
            </code>
          </Section>
          <Section title="Sections">
            <ol className="space-y-3">
              {artifact.sections.map((s, i) => (
                <li
                  key={s.name}
                  className="border-l-2 border-stone-200 pl-4 py-1"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="font-medium">
                      <span className="text-stone-400 mr-2">{i + 1}.</span>
                      {s.name}
                    </div>
                    {!s.required && (
                      <span className="text-xs text-stone-400">optional</span>
                    )}
                  </div>
                  <div className="text-sm text-stone-600 mt-1">{s.guidance}</div>
                  {(s.tone || s.lengthHint) && (
                    <div className="text-xs text-stone-500 mt-2 space-x-3">
                      {s.tone && <span>tone: {s.tone}</span>}
                      {s.lengthHint && <span>length: {s.lengthHint}</span>}
                    </div>
                  )}
                  {s.slots.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {s.slots.map((slot) => (
                        <code
                          key={slot}
                          className="text-xs bg-stone-100 px-1.5 py-0.5 rounded"
                        >
                          {`{${slot}}`}
                        </code>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        </>
      );
    case 'guardrail':
      return (
        <>
          <Section title="Severity">
            <span
              className={
                artifact.severity === 'block'
                  ? 'text-xs uppercase font-semibold tracking-wide bg-red-50 text-red-800 px-2 py-1 rounded'
                  : 'text-xs uppercase font-semibold tracking-wide bg-amber-50 text-amber-800 px-2 py-1 rounded'
              }
            >
              {artifact.severity}
            </span>
          </Section>
          {artifact.scope && (
            <Section title="Scope">
              <p className="text-stone-700">{artifact.scope}</p>
            </Section>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <Subsection label="Violations" items={artifact.violations} />
            <Subsection label="Compliant" items={artifact.compliant} positive />
          </div>
        </>
      );
    case 'knowledge':
      return artifact.sources.length > 0 ? (
        <Section title="Sources">
          <ul className="text-sm space-y-1">
            {artifact.sources.map((s) => (
              <li key={s.title}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-700 underline hover:text-stone-900"
                  >
                    {s.title}
                  </a>
                ) : (
                  <span className="text-stone-700">{s.title}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ) : null;
    case 'value':
      return artifact.example ? (
        <Section title="Example">
          <p className="text-stone-700 italic">{artifact.example}</p>
        </Section>
      ) : null;
    case 'person':
      return (
        <>
          <Section title="Role">
            <p className="text-stone-700">{artifact.role}</p>
          </Section>
          {artifact.imageUrl && (
            <Section title="Headshot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artifact.imageUrl}
                alt={artifact.name}
                className="rounded-lg w-32 h-32 object-cover border border-stone-200"
              />
            </Section>
          )}
          <Section title="Bio">
            <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
              {artifact.bio}
            </p>
          </Section>
          {artifact.quote && (
            <Section title="Signature quote">
              <blockquote className="border-l-2 border-stone-300 pl-4 text-stone-700 italic">
                &ldquo;{artifact.quote}&rdquo;
              </blockquote>
            </Section>
          )}
          {(artifact.email || artifact.social) && (
            <Section title="Contact">
              <ul className="text-sm space-y-1 text-stone-700">
                {artifact.email && (
                  <li>
                    <span className="text-stone-500">email:</span>{' '}
                    <a
                      href={`mailto:${artifact.email}`}
                      className="underline hover:text-stone-900"
                    >
                      {artifact.email}
                    </a>
                  </li>
                )}
                {artifact.social &&
                  Object.entries(artifact.social)
                    .filter(([, v]) => typeof v === 'string' && v)
                    .map(([k, v]) => (
                      <li key={k}>
                        <span className="text-stone-500">{k}:</span>{' '}
                        <span>{String(v)}</span>
                      </li>
                    ))}
              </ul>
            </Section>
          )}
        </>
      );
    case 'typography':
      return (
        <>
          {artifact.typefaces.length > 0 && (
            <Section title="Typefaces">
              <div className="grid sm:grid-cols-2 gap-3">
                {artifact.typefaces.map((tf) => (
                  <div
                    key={tf.family + tf.role}
                    className="border border-stone-200 rounded p-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-semibold">{tf.family}</div>
                      <span className="text-xs uppercase tracking-wide text-stone-500">
                        {tf.role}
                      </span>
                    </div>
                    {tf.stack && (
                      <div className="mt-2 text-xs font-mono text-stone-500 break-all">
                        {tf.stack}
                      </div>
                    )}
                    {tf.weights.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tf.weights.map((w) => (
                          <span
                            key={w}
                            className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    )}
                    {tf.source && (
                      <div className="mt-3 text-xs text-stone-500 space-y-0.5">
                        {tf.source.provider && (
                          <div>
                            <span className="text-stone-400">provider:</span>{' '}
                            {tf.source.provider}
                          </div>
                        )}
                        {tf.source.url && (
                          <div>
                            <a
                              href={tf.source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="underline hover:text-stone-900 break-all"
                            >
                              ↗ {tf.source.url}
                            </a>
                          </div>
                        )}
                        {tf.source.cssImport && (
                          <div className="mt-1 font-mono break-all text-stone-600">
                            {tf.source.cssImport}
                          </div>
                        )}
                        {tf.source.files.length > 0 && (
                          <div className="mt-2">
                            <div className="text-stone-400 mb-1">files:</div>
                            <ul className="space-y-0.5">
                              {tf.source.files.map((f) => (
                                <li key={f.url}>
                                  <a
                                    href={f.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline hover:text-stone-900 font-mono text-[11px] break-all"
                                  >
                                    {f.weight} {f.style} ↗
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {tf.use && (
                      <div className="mt-3 text-sm text-stone-600">{tf.use}</div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
          {artifact.scale.length > 0 && (
            <Section title="Type scale">
              <div className="border border-stone-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">Name</th>
                      <th className="text-left px-4 py-2 font-medium">Size</th>
                      <th className="text-left px-4 py-2 font-medium">Line</th>
                      <th className="text-left px-4 py-2 font-medium">Weight</th>
                      <th className="text-left px-4 py-2 font-medium">Use</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {artifact.scale.map((step) => (
                      <tr key={step.name}>
                        <td className="px-4 py-2 font-medium">{step.name}</td>
                        <td className="px-4 py-2 font-mono text-stone-700">
                          {step.fontSize}
                        </td>
                        <td className="px-4 py-2 font-mono text-stone-500">
                          {step.lineHeight ?? '—'}
                        </td>
                        <td className="px-4 py-2 font-mono text-stone-500">
                          {step.fontWeight ?? '—'}
                        </td>
                        <td className="px-4 py-2 text-stone-600">
                          {step.use ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}
        </>
      );
    case 'palette':
      return artifact.colors.length > 0 ? (
        <Section title="Colors">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {artifact.colors.map((c) => (
              <div
                key={c.name + c.hex}
                className="border border-stone-200 rounded overflow-hidden"
              >
                <div
                  className="h-20 w-full"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="p-3">
                  <div className="flex items-baseline justify-between">
                    <div className="font-medium text-sm">{c.name}</div>
                    {c.role && (
                      <span className="text-[10px] uppercase tracking-wide text-stone-500">
                        {c.role}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-stone-600 mt-0.5">
                    {c.hex}
                  </div>
                  {c.use && (
                    <div className="text-xs text-stone-500 mt-1.5 line-clamp-2">
                      {c.use}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null;
    case 'logo':
      return (
        <>
          {artifact.assets.length > 0 && (
            <Section title="Assets">
              <div className="grid sm:grid-cols-2 gap-3">
                {artifact.assets.map((asset) => (
                  <div
                    key={asset.variant + asset.format}
                    className="border border-stone-200 rounded p-4"
                    style={{
                      backgroundColor:
                        asset.background === 'dark'
                          ? '#0c0a09'
                          : asset.background === 'light'
                          ? '#fafaf9'
                          : 'transparent',
                    }}
                  >
                    {(asset.format === 'svg' || asset.format === 'png') && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.url}
                        alt={asset.variant}
                        className="max-h-24 object-contain mb-3"
                      />
                    )}
                    <div
                      className={`flex items-baseline justify-between text-sm ${
                        asset.background === 'dark'
                          ? 'text-stone-200'
                          : 'text-stone-800'
                      }`}
                    >
                      <span className="font-medium">{asset.variant}</span>
                      <span className="text-xs uppercase tracking-wide opacity-70">
                        {asset.format}
                      </span>
                    </div>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-xs underline mt-1 inline-block ${
                        asset.background === 'dark'
                          ? 'text-stone-300 hover:text-white'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      ↗ Download
                    </a>
                    {asset.use && (
                      <div
                        className={`text-xs mt-1 ${
                          asset.background === 'dark'
                            ? 'text-stone-400'
                            : 'text-stone-500'
                        }`}
                      >
                        {asset.use}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
          {(artifact.clearSpace || artifact.minSize) && (
            <Section title="Rules">
              <ul className="text-sm space-y-1 text-stone-700">
                {artifact.clearSpace && (
                  <li>
                    <span className="text-stone-500">Clear space:</span>{' '}
                    {artifact.clearSpace}
                  </li>
                )}
                {artifact.minSize && (
                  <li>
                    <span className="text-stone-500">Minimum size:</span>{' '}
                    {artifact.minSize}
                  </li>
                )}
              </ul>
            </Section>
          )}
        </>
      );
    case 'custom':
      return Object.keys(artifact.data ?? {}).length > 0 ? (
        <Section title="Extra fields">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
            {Object.entries(artifact.data).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="font-mono text-xs text-stone-500 pt-0.5">{key}</dt>
                <dd className="text-stone-700 break-words">
                  {typeof value === 'object' ? (
                    <pre className="font-mono text-xs whitespace-pre-wrap">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    String(value)
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null;
    case 'product':
      return (
        <>
          {artifact.audience && (
            <Section title="Audience">
              <p className="text-stone-700">{artifact.audience}</p>
            </Section>
          )}
          {artifact.valueProps.length > 0 && (
            <Section title="Value props">
              <ul className="space-y-1.5">
                {artifact.valueProps.map((p) => (
                  <li key={p} className="text-stone-700 flex gap-2">
                    <span className="text-stone-400">→</span>
                    {p}
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {artifact.features.length > 0 && (
            <Section title="Features">
              <div className="grid sm:grid-cols-2 gap-3">
                {artifact.features.map((f) => (
                  <div
                    key={f.name}
                    className="border border-stone-200 rounded p-3"
                  >
                    <div className="font-medium text-sm">{f.name}</div>
                    <div className="text-sm text-stone-600 mt-1">
                      {f.description}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {artifact.pricing && (
            <Section title="Pricing">
              <p className="text-stone-700">{artifact.pricing}</p>
            </Section>
          )}
          {artifact.sku && (
            <Section title="SKU">
              <code className="bg-stone-100 px-2 py-1 rounded text-sm">
                {artifact.sku}
              </code>
            </Section>
          )}
        </>
      );
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-stone-500 font-semibold mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Subsection({
  label,
  items,
  positive = false,
}: {
  label: string;
  items: string[];
  positive?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-medium mb-2 text-stone-500">{label}</div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={
              positive
                ? 'text-sm text-stone-700 border-l-2 border-emerald-300 pl-3'
                : 'text-sm text-stone-700 border-l-2 border-stone-300 pl-3'
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="text-sm bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
