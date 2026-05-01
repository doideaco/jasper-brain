import path from 'node:path';
import { FilesystemStore, type WritableBrainStore } from '@jasper-brain/core';

let cachedStore: WritableBrainStore | null = null;
let cachedBackend: 'postgres' | 'filesystem' | null = null;

async function createStore(): Promise<{
  store: WritableBrainStore;
  backend: 'postgres' | 'filesystem';
}> {
  if (process.env.DATABASE_URL) {
    const { PostgresStore } = await import('@jasper-brain/store-postgres');
    return {
      store: new PostgresStore(process.env.DATABASE_URL),
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
