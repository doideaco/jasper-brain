import path from 'node:path';
import { FilesystemStore, type WritableBrainStore } from '@jasper-brain/core';
import { cachedStore as wrapWithCache } from './cached-store';

let cachedStore: WritableBrainStore | null = null;
let cachedBackend: 'postgres' | 'filesystem' | null = null;

async function createStore(): Promise<{
  store: WritableBrainStore;
  backend: 'postgres' | 'filesystem';
}> {
  if (process.env.DATABASE_URL) {
    const { PostgresStore } = await import('@jasper-brain/store-postgres');
    // Wrap postgres in the in-process cache: warm-container reads
    // become memory lookups. Cache invalidates on every write through
    // this same wrapper, so admin edits still land within one call.
    // Only postgres gets the wrapper — filesystem is used in dev and
    // we want file-on-disk edits to reflect immediately.
    const raw = new PostgresStore(process.env.DATABASE_URL);
    return {
      store: wrapWithCache(raw),
      backend: 'postgres',
    };
  }
  const root = process.env.BRAIN_ROOT
    ? path.resolve(process.env.BRAIN_ROOT)
    : path.resolve(process.cwd(), '..', '..', 'brands');
  return { store: new FilesystemStore(root), backend: 'filesystem' };
}

let initPromise: Promise<WritableBrainStore> | null = null;

export function getStore(): Promise<WritableBrainStore> {
  if (cachedStore) return Promise.resolve(cachedStore);
  if (!initPromise) {
    initPromise = createStore().then(({ store, backend }) => {
      cachedStore = store;
      cachedBackend = backend;
      return store;
    });
  }
  return initPromise;
}

export function getStoreBackend(): 'postgres' | 'filesystem' | null {
  return cachedBackend;
}
