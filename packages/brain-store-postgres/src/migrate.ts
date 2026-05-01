import type { Sql } from 'postgres';

export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifacts (
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  facet_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (brand_id, facet_id, item_id)
);

CREATE INDEX IF NOT EXISTS artifacts_brand_facet_idx
  ON artifacts (brand_id, facet_id);

CREATE TABLE IF NOT EXISTS custom_facets (
  brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  facet_id TEXT NOT NULL,
  data JSONB NOT NULL,
  PRIMARY KEY (brand_id, facet_id)
);
`;

export async function migrate(client: Sql): Promise<void> {
  await client.unsafe(INIT_SQL);
}
