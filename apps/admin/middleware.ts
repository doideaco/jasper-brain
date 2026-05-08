import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublic = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/files/(.*)',
  // Public so Vercel Blob's onUploadCompleted webhook can reach the
  // route. The route enforces its own auth via requireUser() inside
  // onBeforeGenerateToken, and handleUpload validates webhook payload
  // signatures, so it's safe to skip Clerk here.
  '/api/blob-upload-token',
  '/brands/(.*)/mcp',
  '/brands/(.*)/schema.json',
  '/brands/(.*)/llms.txt',
  '/share/(.*)',
]);

const isMcp = createRouteMatcher(['/brands/(.*)/mcp']);

export default clerkMiddleware(async (auth, req) => {
  // Short-circuit CORS preflights on the MCP endpoint with a fully
  // formed response. Without this, Clerk + Next.js produce a 204 with
  // an `allow:` header but no `access-control-*` headers, which fails
  // browser-based MCP clients (Claude.ai custom connectors).
  if (isMcp(req) && req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, POST, OPTIONS',
        'access-control-allow-headers':
          'Content-Type, Authorization, mcp-session-id',
        'access-control-max-age': '86400',
      },
    });
  }

  if (!isPublic(req)) {
    await auth.protect();
  }

  // For non-preflight MCP requests, attach CORS headers so the actual
  // POST / GET responses are also accessible from browser-based clients.
  if (isMcp(req)) {
    const res = NextResponse.next();
    res.headers.set('access-control-allow-origin', '*');
    res.headers.set('access-control-expose-headers', 'mcp-session-id');
    return res;
  }
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
