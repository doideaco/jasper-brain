'use client';

import { useId } from 'react';

interface CommonProps {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
}

const labelClass = 'text-sm font-medium text-stone-800';
const hintClass = 'text-xs text-stone-500 mt-0.5';
const inputClass =
  'mt-1 block w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-700';

export function TextField({
  name,
  label,
  hint,
  required,
  defaultValue,
  disabled,
  placeholder,
}: CommonProps & {
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue ?? ''}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`${inputClass} ${disabled ? 'bg-stone-50 text-stone-500' : ''}`}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function TextArea({
  name,
  label,
  hint,
  required,
  defaultValue,
  rows = 6,
  monospace,
  placeholder,
}: CommonProps & {
  defaultValue?: string;
  rows?: number;
  monospace?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClass} ${monospace ? 'font-mono text-xs leading-relaxed' : ''}`}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function LinesField({
  name,
  label,
  hint,
  defaultValue,
  rows = 4,
  placeholder,
}: CommonProps & {
  defaultValue?: string[];
  rows?: number;
  placeholder?: string;
}) {
  return (
    <TextArea
      name={name}
      label={label}
      hint={hint ?? 'One per line.'}
      defaultValue={defaultValue?.join('\n')}
      rows={rows}
      placeholder={placeholder}
    />
  );
}

export function TagsField({
  name,
  label,
  hint,
  defaultValue,
}: CommonProps & { defaultValue?: string[] }) {
  return (
    <TextField
      name={name}
      label={label}
      hint={hint ?? 'Comma-separated.'}
      defaultValue={defaultValue?.join(', ')}
    />
  );
}

export function YamlField({
  name,
  label,
  hint,
  defaultValue,
  rows = 8,
}: CommonProps & { defaultValue?: string; rows?: number }) {
  return (
    <TextArea
      name={name}
      label={label}
      hint={hint ?? 'YAML format. Will be validated on save.'}
      defaultValue={defaultValue}
      rows={rows}
      monospace
    />
  );
}

export function SelectField({
  name,
  label,
  hint,
  options,
  defaultValue,
}: CommonProps & { options: Array<{ value: string; label: string }>; defaultValue?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}
