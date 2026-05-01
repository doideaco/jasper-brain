'use client';

import { useState } from 'react';
import { stringify as stringifyYaml } from 'yaml';
import type { Typeface, TypeScaleStep } from '@jasper-brain/core';
import type { UploadedAsset } from '@/lib/blob';
import { TypefacesEditor, typefacesToYaml } from './typefaces-editor';
import { TypeScaleEditor, scaleToYaml } from './type-scale-editor';

export function TypographyEditor({
  defaultTypefaces,
  defaultScale,
  uploadedAssets,
}: {
  defaultTypefaces?: Typeface[];
  defaultScale?: TypeScaleStep[];
  uploadedAssets: UploadedAsset[];
}) {
  const [typefaces, setTypefaces] = useState<Typeface[]>(
    defaultTypefaces ?? [],
  );
  const [scale, setScale] = useState<TypeScaleStep[]>(defaultScale ?? []);

  return (
    <div className="space-y-8">
      <TypefacesEditor
        defaultValue={defaultTypefaces}
        uploadedAssets={uploadedAssets}
        onChange={setTypefaces}
      />
      <TypeScaleEditor
        defaultValue={defaultScale}
        typefaces={typefaces}
        onChange={setScale}
      />

      {/* Form-submission fields. Live state from the editors above
          gets serialized to YAML so the existing Zod-based parser on the
          server side keeps working without changes. */}
      <input type="hidden" name="typefaces" value={typefacesToYaml(typefaces)} />
      <input type="hidden" name="scale" value={scaleToYaml(scale)} />
    </div>
  );
}
