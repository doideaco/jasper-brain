import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface UploadedAsset {
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  uploadedAt?: string;
}

const useVercelBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

function brandsRoot(): string {
  return process.env.BRAIN_ROOT
    ? path.resolve(process.env.BRAIN_ROOT)
    : path.resolve(process.cwd(), '..', '..', 'brands');
}

function uploadDir(brandId: string): string {
  return path.join(brandsRoot(), brandId, 'uploads');
}

function safeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export function detectMime(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'woff':
      return 'font/woff';
    case 'woff2':
      return 'font/woff2';
    case 'ttf':
      return 'font/ttf';
    case 'otf':
      return 'font/otf';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export async function uploadFile(
  brandId: string,
  fileName: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<UploadedAsset> {
  const safe = safeFileName(fileName);

  if (useVercelBlob) {
    const { put } = await import('@vercel/blob');
    const result = await put(
      `brands/${brandId}/uploads/${safe}`,
      Buffer.from(bytes),
      {
        access: 'public',
        contentType,
        addRandomSuffix: false,
      },
    );
    return {
      url: result.url,
      pathname: result.pathname,
      contentType,
      size: bytes.length,
      uploadedAt: new Date().toISOString(),
    };
  }

  const dir = uploadDir(brandId);
  await fs.mkdir(dir, { recursive: true });
  const target = path.join(dir, safe);
  await fs.writeFile(target, bytes);
  const stat = await fs.stat(target);
  return {
    url: `/api/files/${brandId}/${safe}`,
    pathname: `${brandId}/uploads/${safe}`,
    contentType,
    size: stat.size,
    uploadedAt: stat.mtime.toISOString(),
  };
}

export async function listFiles(brandId: string): Promise<UploadedAsset[]> {
  if (useVercelBlob) {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: `brands/${brandId}/uploads/` });
    return blobs.map((b) => ({
      url: b.url,
      pathname: b.pathname,
      contentType: detectMime(b.pathname),
      size: b.size,
      uploadedAt: b.uploadedAt instanceof Date ? b.uploadedAt.toISOString() : undefined,
    }));
  }

  const dir = uploadDir(brandId);
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: UploadedAsset[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const stat = await fs.stat(path.join(dir, entry.name));
      files.push({
        url: `/api/files/${brandId}/${entry.name}`,
        pathname: `${brandId}/uploads/${entry.name}`,
        contentType: detectMime(entry.name),
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      });
    }
    return files.sort(
      (a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export async function deleteUpload(
  brandId: string,
  pathnameOrName: string,
): Promise<void> {
  if (useVercelBlob) {
    const { del } = await import('@vercel/blob');
    await del(pathnameOrName);
    return;
  }
  const fileName = path.basename(pathnameOrName);
  const target = path.join(uploadDir(brandId), fileName);
  await fs.rm(target, { force: true });
}

export function blobBackend(): 'vercel' | 'local-fs' {
  return useVercelBlob ? 'vercel' : 'local-fs';
}
