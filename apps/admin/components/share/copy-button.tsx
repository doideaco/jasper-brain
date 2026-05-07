'use client';

import { useState } from 'react';

export function CopyButton({
  value,
  label = 'Copy',
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium px-2 py-1 rounded border border-current/20 hover:bg-current/5 transition-colors"
      style={{ color: 'var(--brand-fg, currentColor)' }}
    >
      {copied ? 'Copied!' : label}
    </button>
  );
}
