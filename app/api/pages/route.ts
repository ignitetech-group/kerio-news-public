import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

// GET all pages or single page by slug
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');

  try {
    if (slug) {
      const pages = await query('SELECT * FROM pages WHERE slug = $1', [slug]);
      if (pages.length === 0) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
      return NextResponse.json({ page: pages[0] });
    }

    const pages = await query('SELECT id, slug, title, updated_at, updated_by FROM pages ORDER BY title');
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT update page content
export async function PUT(request: NextRequest) {
  try {
    const { slug, html_content, updated_by } = await request.json();

    if (!slug || !html_content) {
      return NextResponse.json({ error: 'slug and html_content required' }, { status: 400 });
    }

    await query(
      'UPDATE pages SET html_content = $1, updated_by = $2 WHERE slug = $3',
      [html_content, updated_by || 'admin', slug]
    );

    await logAudit(updated_by || 'admin', 'UPDATE', 'page', slug, `Updated page content for ${slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
