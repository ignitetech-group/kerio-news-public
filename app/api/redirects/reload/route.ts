import { NextResponse } from 'next/server';
import { reloadRedirects, getCacheStats } from '@/lib/redirects-cache';

/**
 * Force reload redirects cache
 * Call this after updating redirects via API
 */
export async function POST() {
  try {
    await reloadRedirects();
    const stats = getCacheStats();

    return NextResponse.json({
      success: true,
      message: 'Redirects cache reloaded',
      stats,
    });
  } catch (error: any) {
    console.error('Failed to reload redirects:', error);
    return NextResponse.json(
      { error: 'Failed to reload cache', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get cache statistics
 */
export async function GET() {
  const stats = getCacheStats();
  return NextResponse.json({ stats });
}
