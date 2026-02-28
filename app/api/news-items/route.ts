import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { logAudit } from '@/lib/audit';

interface NewsItem {
  id: number;
  feed_slug: string;
  category: string;
  title: string;
  content: string;
  article_date: string;
  sort_order: number;
  is_active: boolean;
}

// GET news items — optionally filter by feed_slug
export async function GET(request: NextRequest) {
  const feedSlug = request.nextUrl.searchParams.get('feed_slug');

  try {
    if (feedSlug) {
      const items = await query<NewsItem[]>(
        'SELECT * FROM news_items WHERE feed_slug = $1 ORDER BY sort_order ASC, article_date DESC',
        [feedSlug]
      );
      return NextResponse.json({ items });
    }

    const items = await query<NewsItem[]>(
      'SELECT * FROM news_items ORDER BY feed_slug, sort_order ASC, article_date DESC'
    );
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST create news item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feed_slug, category, title, content = '', article_date, sort_order = 0, user_email = 'unknown' } = body;

    if (!feed_slug || !category || !title) {
      return NextResponse.json({ error: 'feed_slug, category, and title are required' }, { status: 400 });
    }

    const result = await query<{ id: number }[]>(
      'INSERT INTO news_items (feed_slug, category, title, content, article_date, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [feed_slug, category, title, content, article_date || new Date().toISOString().slice(0, 10), sort_order]
    );

    await logAudit(user_email, 'CREATE', 'news_item', result[0]?.id, `Created "${title}" in ${feed_slug}`);

    return NextResponse.json({ success: true, id: result[0]?.id });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT update news item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, feed_slug, category, title, content, article_date, sort_order, is_active, user_email = 'unknown' } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let p = 1;

    if (feed_slug !== undefined) { updates.push(`feed_slug = $${p++}`); values.push(feed_slug); }
    if (category !== undefined) { updates.push(`category = $${p++}`); values.push(category); }
    if (title !== undefined) { updates.push(`title = $${p++}`); values.push(title); }
    if (content !== undefined) { updates.push(`content = $${p++}`); values.push(content); }
    if (article_date !== undefined) { updates.push(`article_date = $${p++}`); values.push(article_date); }
    if (sort_order !== undefined) { updates.push(`sort_order = $${p++}`); values.push(sort_order); }
    if (is_active !== undefined) { updates.push(`is_active = $${p++}`); values.push(is_active); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    await query(`UPDATE news_items SET ${updates.join(', ')} WHERE id = $${p}`, values);

    await logAudit(user_email, 'UPDATE', 'news_item', id, `Updated "${title || 'item'}"`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE news item
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const userEmail = request.nextUrl.searchParams.get('user_email') || 'unknown';

    if (!id) {
      return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
    }

    await query('DELETE FROM news_items WHERE id = $1', [id]);

    await logAudit(userEmail, 'DELETE', 'news_item', id, `Deleted news item #${id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
