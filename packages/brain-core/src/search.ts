import type { Artifact } from './types.js';

export function scoreArtifact(artifact: Artifact, needle: string): number {
  let score = 0;
  if (artifact.id.toLowerCase().includes(needle)) score += 5;
  if (artifact.name.toLowerCase().includes(needle)) score += 4;
  if (artifact.description?.toLowerCase().includes(needle)) score += 3;
  if (artifact.tags.some((tag) => tag.toLowerCase().includes(needle))) score += 3;
  if ('body' in artifact && typeof artifact.body === 'string') {
    const occurrences = countOccurrences(artifact.body.toLowerCase(), needle);
    score += Math.min(occurrences, 5);
  }
  return score;
}

export function rankArtifacts(
  artifacts: Artifact[],
  query: string,
  limit = 20,
): Artifact[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return artifacts
    .map((artifact) => ({ artifact, score: scoreArtifact(artifact, needle) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.artifact);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count += 1;
    index += needle.length;
  }
  return count;
}
