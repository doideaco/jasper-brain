import {
  BUILT_IN_FACETS,
  GROUPS,
  type FacetDefinition,
  type GroupId,
} from '@jasper-brain/core';

export { GROUPS, BUILT_IN_FACETS };
export type { FacetDefinition, GroupId };

export function facetLabel(facet: FacetDefinition): string {
  return facet.label;
}

export function facetPlural(facet: FacetDefinition): string {
  return facet.pluralLabel;
}
