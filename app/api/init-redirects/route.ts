import { NextResponse } from 'next/server';
import { loadRedirects, getCacheStats } from '@/lib/redirects-cache';

/**
 * Initialize redirects cache on app startup
 * Call this endpoint after deployment to warm up the cache
 */
export async function GET() {
  try {
    await loadRedirects();
    const stats = getCacheStats();

    return NextResponse.json({
      success: true,
      message: 'Redirects cache initialized',
      stats,
    });
  } catch (error: any) {
    console.error('Failed to initialize redirects:', error);
    return NextResponse.json(
      { error: 'Failed to initialize cache', details: error.message },
      { status: 500 }
    );
  }
}
