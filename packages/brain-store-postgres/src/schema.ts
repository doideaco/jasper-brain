import { jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';

export const brands = pgTable('brands', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const artifacts = pgTable(
  'artifacts',
  {
    brandId: text('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    facetId: text('facet_id').notNull(),
    itemId: text('item_id').notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.brandId, t.facetId, t.itemId] }),
  }),
);

export const customFacets = pgTable(
  'custom_facets',
  {
    brandId: text('brand_id')
      .notNull()
      .references(() => brands.id, { onDelete: 'cascade' }),
    facetId: text('facet_id').notNull(),
    data: jsonb('data').notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.brandId, t.facetId] }),
  }),
);
