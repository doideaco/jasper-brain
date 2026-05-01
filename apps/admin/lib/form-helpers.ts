import { parse as parseYaml } from 'yaml';

export function splitLines(value: FormDataEntryValue | null | undefined): string[] {
  if (typeof value !== 'string' || !value) return [];
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export function splitTags(value: FormDataEntryValue | null | undefined): string[] {
  if (typeof value !== 'string' || !value) return [];
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function getString(
  fd: FormData,
  key: string,
  fallback?: string,
): string | undefined {
  const value = fd.get(key);
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
}

export function requireString(fd: FormData, key: string): string {
  const value = getString(fd, key);
  if (!value) throw new Error(`Missing required field: ${key}`);
  return value;
}

export function getYaml<T = unknown>(fd: FormData, key: string): T | undefined {
  const raw = getString(fd, key);
  if (!raw) return undefined;
  try {
    return parseYaml(raw) as T;
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'invalid YAML';
    throw new Error(`${key}: ${reason}`);
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

import { stringify as stringifyYaml } from 'yaml';

export function toYaml(value: unknown): string {
  if (value === undefined || value === null) return '';
  return stringifyYaml(value).trimEnd();
}
