/**
 * Next.js boot hook. Dispatches to a Node-runtime-only module that
 * does the actual work (seed-sync + data-migrations).
 *
 * This file MUST stay free of any imports that touch Node-only
 * modules like postgres / fs / net / tls — Next.js's webpack
 * traces this file for both the Node and Edge runtime bundles, and
 * Edge can't resolve those imports. The dynamic import below is
 * gated by NEXT_RUNTIME so the Node-only chain only loads on Node.
 */

let registered = false;

export async function register() {
  if (registered) return;
  registered = true;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node-runtime-only sub-module. Next.js's bundler treats this
    // dynamic import as Node-only because of the runtime gate above.
    await import('./instrumentation-node');
  }
}
