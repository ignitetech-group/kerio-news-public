import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for redirects (works in Edge Runtime)
let redirectsMap: Map<string, { destination_url: string; redirect_type: number }> | null = null;
let lastFetch = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for Next.js internals, API routes, and static files
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  try {
    const now = Date.now();

    // Refresh cache if expired or not loaded
    if (!redirectsMap || now - lastFetch > CACHE_TTL) {
      const apiUrl = new URL('/api/redirects', request.url);
      const res = await fetch(apiUrl.toString(), {
        headers: { 'x-internal': '1' },
      });

      if (res.ok) {
        const data = await res.json();
        redirectsMap = new Map();
        for (const r of data.redirects || []) {
          redirectsMap.set(r.source_path, {
            destination_url: r.destination_url,
            redirect_type: r.redirect_type,
          });
        }
        lastFetch = now;
      }
    }

    // Check cache for redirect
    if (redirectsMap) {
      const redirect = redirectsMap.get(path);
      if (redirect) {
        return NextResponse.redirect(redirect.destination_url, redirect.redirect_type);
      }
    }
  } catch (error) {
    // Silently fail - don't break the site if database is down
    console.error('Redirect check failed:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
