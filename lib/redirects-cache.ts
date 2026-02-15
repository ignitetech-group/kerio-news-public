import { query } from './db';

interface Redirect {
  id: number;
  source_path: string;
  destination_url: string;
  redirect_type: number;
  is_active: boolean;
}

// In-memory cache of redirects
let redirectsCache = new Map<string, Redirect>();
let lastRefresh = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load redirects from database into memory cache
 */
export async function loadRedirects(): Promise<void> {
  try {
    const redirects = await query<Redirect[]>(
      'SELECT * FROM redirects WHERE is_active = TRUE'
    );

    // Clear old cache
    redirectsCache.clear();

    // Build new cache
    for (const redirect of redirects) {
      redirectsCache.set(redirect.source_path, redirect);
    }

    lastRefresh = Date.now();
    console.log(`✅ Loaded ${redirects.length} redirects into cache`);
  } catch (error) {
    console.error('❌ Failed to load redirects:', error);
    // Keep using old cache if reload fails
  }
}

/**
 * Get redirect for a given path (from cache)
 * Automatically refreshes cache if expired
 */
export async function getRedirect(path: string): Promise<Redirect | null> {
  // Refresh cache if expired
  const now = Date.now();
  if (now - lastRefresh > CACHE_TTL) {
    await loadRedirects();
  }

  return redirectsCache.get(path) || null;
}

/**
 * Force reload redirects (call this after updating redirects via API)
 */
export async function reloadRedirects(): Promise<void> {
  await loadRedirects();
}

/**
 * Get all cached redirects
 */
export function getAllCachedRedirects(): Redirect[] {
  return Array.from(redirectsCache.values());
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: redirectsCache.size,
    lastRefresh: new Date(lastRefresh),
    ttl: CACHE_TTL,
    nextRefresh: new Date(lastRefresh + CACHE_TTL),
  };
}
