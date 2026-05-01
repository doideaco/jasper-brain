import type { BrandKit } from '@jasper-brain/core';

export function BrandKitView({ kit }: { kit: BrandKit }) {
  return (
    <div className="space-y-10">
      <BrandSection brand={kit.brand} />

      {kit.voice && (
        <KitSection title="Primary voice" hint={kit.voice.id}>
          <div className="rounded-lg border border-stone-200 bg-white p-5 space-y-3">
            <div>
              <div className="font-semibold">{kit.voice.name}</div>
              {kit.voice.description && (
                <div className="text-sm text-stone-600 mt-0.5">
                  {kit.voice.description}
                </div>
              )}
            </div>
            {kit.voice.tone.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-stone-500 mb-1.5">
                  Tone
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {kit.voice.tone.map((t) => (
                    <span
                      key={t}
                      className="text-sm bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {kit.voice.body && (
              <p className="text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
                {kit.voice.body}
              </p>
            )}
          </div>
        </KitSection>
      )}

      {kit.values.length > 0 && (
        <KitSection title="Values" hint={`${kit.values.length} items`}>
          <div className="grid sm:grid-cols-2 gap-3">
            {kit.values.map((v) => (
              <div
                key={v.id}
                className="rounded-lg border border-stone-200 bg-white p-4"
              >
                <div className="font-medium">{v.name}</div>
                {v.description && (
                  <div className="text-sm text-stone-600 mt-1">
                    {v.description}
                  </div>
                )}
                {v.example && (
                  <div className="mt-2 text-sm text-stone-700 italic border-l-2 border-stone-300 pl-3">
                    {v.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </KitSection>
      )}

      {(kit.visual.typography ||
        kit.visual.palette ||
        kit.visual.logo) && (
        <KitSection title="Visual identity">
          <div className="space-y-5">
            {kit.visual.typography && (
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                  Typography — {kit.visual.typography.name}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {kit.visual.typography.typefaces.map((tf) => (
                    <div
                      key={tf.family + tf.role}
                      className="rounded border border-stone-200 p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="font-semibold">{tf.family}</div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-500">
                          {tf.role}
                        </span>
                      </div>
                      {tf.weights.length > 0 && (
                        <div className="text-xs text-stone-500 mt-1">
                          {tf.weights.join(', ')}
                        </div>
                      )}
                      {tf.source?.provider && (
                        <div className="text-[11px] text-stone-500 mt-1.5">
                          {tf.source.provider}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {kit.visual.typography.scale.length > 0 && (
                  <div className="mt-4 text-xs text-stone-500">
                    {kit.visual.typography.scale.length} scale steps
                  </div>
                )}
              </div>
            )}
            {kit.visual.palette && (
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                  Palette — {kit.visual.palette.name}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                  {kit.visual.palette.colors.map((c) => (
                    <div
                      key={c.name + c.hex}
                      className="rounded border border-stone-200 overflow-hidden"
                    >
                      <div
                        className="h-12 w-full"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div className="px-2 py-1.5">
                        <div className="text-[11px] font-medium truncate">
                          {c.name}
                        </div>
                        <div className="text-[10px] font-mono text-stone-500">
                          {c.hex}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {kit.visual.logo && (
              <div className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                  Logo — {kit.visual.logo.name}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {kit.visual.logo.assets.map((a) => (
                    <div
                      key={a.variant + a.format}
                      className="rounded border border-stone-200 p-3 text-sm"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium">{a.variant}</span>
                        <span className="text-xs uppercase tracking-wide text-stone-500">
                          {a.format}
                        </span>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-stone-600 underline hover:text-stone-900 break-all mt-1 inline-block"
                      >
                        ↗ {a.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </KitSection>
      )}

      {kit.guardrails.length > 0 && (
        <KitSection title="Guardrails" hint={`${kit.guardrails.length} active`}>
          <ul className="rounded-lg border border-stone-200 bg-white divide-y divide-stone-100">
            {kit.guardrails.map((g) => (
              <li key={g.id} className="px-5 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-medium">{g.name}</div>
                  <span
                    className={
                      g.severity === 'block'
                        ? 'text-[10px] uppercase tracking-wide bg-red-50 text-red-800 px-1.5 py-0.5 rounded'
                        : 'text-[10px] uppercase tracking-wide bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded'
                    }
                  >
                    {g.severity}
                  </span>
                </div>
                {g.description && (
                  <div className="text-sm text-stone-600 mt-0.5">
                    {g.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </KitSection>
      )}

      {kit.people.length > 0 && (
        <KitSection title="People" hint={`${kit.people.length} items`}>
          <div className="grid sm:grid-cols-2 gap-3">
            {kit.people.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-stone-200 bg-white p-4 flex gap-3"
              >
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-stone-500">{p.role}</div>
                  {p.quote && (
                    <div className="text-sm text-stone-700 italic mt-1.5 border-l-2 border-stone-300 pl-2">
                      &ldquo;{p.quote}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </KitSection>
      )}

      <KitSection title="Available context (load on demand)">
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <AvailableList
            label="Skills"
            items={kit.available.skills.map((s) => ({
              id: s.id,
              name: s.name,
              meta: s.whenToUse,
            }))}
          />
          <AvailableList
            label="Templates"
            items={kit.available.templates.map((t) => ({
              id: t.id,
              name: t.name,
              meta: t.format,
            }))}
          />
          <AvailableList
            label="Knowledge"
            items={kit.available.knowledge.map((k) => ({
              id: k.id,
              name: k.name,
              meta: k.description,
            }))}
          />
          <AvailableList
            label="Products"
            items={kit.available.products.map((p) => ({
              id: p.id,
              name: p.name,
              meta: p.description,
            }))}
          />
        </div>
      </KitSection>
    </div>
  );
}

function BrandSection({ brand }: { brand: BrandKit['brand'] }) {
  return (
    <KitSection title="Brand profile">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="font-semibold text-lg">{brand.name}</div>
        {brand.tagline && (
          <div className="text-stone-700 italic mt-0.5">{brand.tagline}</div>
        )}
        {brand.description && (
          <div className="text-stone-600 text-sm mt-2">{brand.description}</div>
        )}
        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-5 gap-y-1 text-sm">
          {brand.primaryUrl && (
            <Field label="Web">
              <a
                href={brand.primaryUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-stone-900"
              >
                {brand.primaryUrl}
              </a>
            </Field>
          )}
          {brand.mission && <Field label="Mission">{brand.mission}</Field>}
          {brand.vision && <Field label="Vision">{brand.vision}</Field>}
          {brand.founded && <Field label="Founded">{brand.founded}</Field>}
          {brand.hq && (
            <Field label="HQ">
              {[brand.hq.city, brand.hq.region, brand.hq.country]
                .filter(Boolean)
                .join(', ')}
            </Field>
          )}
        </dl>
      </div>
    </KitSection>
  );
}

function KitSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </h2>
        {hint && (
          <span className="text-xs text-stone-400 font-mono">{hint}</span>
        )}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-stone-800 min-w-0">{children}</dd>
    </>
  );
}

function AvailableList({
  label,
  items,
}: {
  label: string;
  items: Array<{ id: string; name: string; meta?: string }>;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-stone-500 mb-2">
        {label}{' '}
        <span className="font-mono ml-1 text-stone-400">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-stone-400">None.</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((i) => (
            <li key={i.id}>
              <div className="font-medium text-sm">{i.name}</div>
              {i.meta && (
                <div className="text-xs text-stone-500 line-clamp-1">
                  {i.meta}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
