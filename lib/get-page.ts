import { readFile } from 'fs/promises';
import path from 'path';
import { query } from './db';
import { buildFeedPage } from './build-feed';

/**
 * Get page HTML content.
 * Priority: news_items table (dynamic) -> pages table (blob) -> static file
 */
export async function getPageContent(slug: string, fallbackFile: string): Promise<string> {
  // Try dynamic news items first
  const dynamic = await buildFeedPage(slug);
  if (dynamic) return dynamic;

  // Fall back to pages table
  try {
    const pages = await query<{ html_content: string }[]>(
      'SELECT html_content FROM pages WHERE slug = $1',
      [slug]
    );
    if (pages.length > 0) {
      return pages[0].html_content;
    }
  } catch {
    // DB not available, use file fallback
  }

  const htmlPath = path.join(process.cwd(), fallbackFile);
  return readFile(htmlPath, 'utf-8');
}
