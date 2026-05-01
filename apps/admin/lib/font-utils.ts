const WEIGHT_NAMES: Record<string, number> = {
  thin: 100,
  hairline: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  regular: 400,
  normal: 400,
  book: 400,
  roman: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  heavy: 900,
  black: 900,
};

const FONT_FORMATS = ['woff2', 'woff', 'ttf', 'otf'] as const;

export interface ParsedFontFile {
  family?: string;
  weight?: number;
  style?: 'normal' | 'italic';
  format?: 'woff' | 'woff2' | 'ttf' | 'otf';
}

/**
 * Parse a font filename into family / weight / style / format.
 * Handles common patterns:
 *   Inter-Regular.woff2 → Inter / 400 / normal / woff2
 *   Inter-Bold.woff2     → Inter / 700 / normal / woff2
 *   Inter-BoldItalic.woff2 → Inter / 700 / italic / woff2
 *   TiemposHeadline-Regular.woff2 → Tiempos Headline / 400 / normal / woff2
 *   inter_medium.ttf     → Inter / 500 / normal / ttf
 */
export function parseFontFilename(filename: string): ParsedFontFile {
  const justName = filename.split('/').pop() ?? filename;
  const dot = justName.lastIndexOf('.');
  const stem = dot > 0 ? justName.slice(0, dot) : justName;
  const ext = dot > 0 ? justName.slice(dot + 1).toLowerCase() : '';
  const format = (FONT_FORMATS as readonly string[]).includes(ext)
    ? (ext as ParsedFontFile['format'])
    : undefined;

  // Strip square-bracketed variable-font axes (e.g. "Inter[opsz,wght]")
  const cleaned = stem.replace(/\[[^\]]*\]/g, '');

  // Split on -, _, space and walk tokens from the end pulling style/weight off
  const tokens = cleaned.split(/[-_\s]+/).filter(Boolean);

  let weight: number | undefined;
  let style: 'normal' | 'italic' | undefined;

  while (tokens.length > 0) {
    const last = tokens[tokens.length - 1].toLowerCase();
    // Tokens may be combined like "BoldItalic"
    const match = last.match(
      /^(thin|hairline|extralight|ultralight|light|regular|normal|book|roman|medium|semibold|demibold|bold|extrabold|ultrabold|heavy|black)?(italic|oblique)?$/,
    );
    if (!match || (!match[1] && !match[2])) break;
    if (match[1] && weight === undefined) weight = WEIGHT_NAMES[match[1]];
    if (match[2] && style === undefined) style = 'italic';
    tokens.pop();
  }

  if (style === undefined) style = 'normal';

  // Family is the remaining tokens, but we also need to split CamelCase
  // inside any single token (e.g. "TiemposHeadline" → "Tiempos Headline").
  const familyTokens = tokens.flatMap((t) =>
    t.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/).filter(Boolean),
  );
  const family = familyTokens
    .map((part) =>
      // Capitalize first letter of each part if not already mixed-case
      /[A-Z].*[a-z]/.test(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(' ');

  return {
    family: family || undefined,
    weight,
    style,
    format,
  };
}

/** Suggest a fallback CSS stack for a family + role. */
export function suggestStack(family: string, role: string): string {
  if (!family.trim()) return '';
  const quoted = /\s/.test(family) ? `'${family}'` : family;
  const r = role.toLowerCase();
  if (r.includes('mono') || r.includes('code')) {
    return `${quoted}, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  }
  if (
    r.includes('display') ||
    r.includes('serif') ||
    /tiempos|playfair|georgia|caslon|garamond|baskerville/i.test(family)
  ) {
    return `${quoted}, Georgia, 'Times New Roman', serif`;
  }
  return `${quoted}, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
}

export interface FontFaceInput {
  url: string;
  weight: number;
  style: 'normal' | 'italic';
  format?: string;
}

/** Generate a CSS @font-face block from a family + list of file inputs. */
export function generateFontFace(
  family: string,
  files: FontFaceInput[],
): string {
  if (!family.trim()) return '';
  const valid = files.filter((f) => f.url);
  if (valid.length === 0) return '';
  return valid
    .map((f) => {
      const fmt = f.format || guessFormat(f.url);
      const fmtClause = fmt ? ` format('${fmt}')` : '';
      return `@font-face {
  font-family: '${family}';
  src: url('${f.url}')${fmtClause};
  font-weight: ${f.weight};
  font-style: ${f.style};
  font-display: swap;
}`;
    })
    .join('\n\n');
}

function guessFormat(url: string): string | undefined {
  const lower = url.toLowerCase();
  for (const fmt of FONT_FORMATS) {
    if (lower.includes(`.${fmt}`)) return fmt;
  }
  return undefined;
}
