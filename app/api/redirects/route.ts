import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { reloadRedirects } from '@/lib/redirects-cache';
import { logAudit } from '@/lib/audit';

interface Redirect {
  id: number;
  source_path: string;
  destination_url: string;
  redirect_type: number;
  is_active: boolean;
  notes?: string;
}

// GET all redirects
export async function GET() {
  try {
    const redirects = await query<Redirect[]>(
      'SELECT * FROM redirects ORDER BY created_at DESC'
    );
    return NextResponse.json({ redirects });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST create new redirect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_path, destination_url, redirect_type = 301, notes = '', user_email = 'unknown' } = body;

    if (!source_path || !destination_url) {
      return NextResponse.json(
        { error: 'source_path and destination_url are required' },
        { status: 400 }
      );
    }

    const result = await query<{ id: number }[]>(
      'INSERT INTO redirects (source_path, destination_url, redirect_type, notes) VALUES ($1, $2, $3, $4) RETURNING id',
      [source_path, destination_url, redirect_type, notes]
    );

    await logAudit(user_email, 'CREATE', 'redirect', result[0]?.id, `${source_path} -> ${destination_url}`);

    // Reload cache immediately
    await reloadRedirects();

    return NextResponse.json({ success: true, message: 'Redirect created' });
  } catch (error: any) {
    console.error('Database error:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A redirect with this source path already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT update redirect
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, source_path, destination_url, redirect_type, is_active, notes, user_email = 'unknown' } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (source_path !== undefined) {
      updates.push(`source_path = $${paramCount++}`);
      values.push(source_path);
    }
    if (destination_url !== undefined) {
      updates.push(`destination_url = $${paramCount++}`);
      values.push(destination_url);
    }
    if (redirect_type !== undefined) {
      updates.push(`redirect_type = $${paramCount++}`);
      values.push(redirect_type);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);

    await query(
      `UPDATE redirects SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    await logAudit(user_email, 'UPDATE', 'redirect', id, `Updated: ${updates.map(u => u.split(' = ')[0]).join(', ')}`);

    // Reload cache immediately
    await reloadRedirects();

    return NextResponse.json({ success: true, message: 'Redirect updated' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE redirect
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userEmail = searchParams.get('user_email') || 'unknown';

    if (!id) {
      return NextResponse.json({ error: 'id parameter required' }, { status: 400 });
    }

    await query('DELETE FROM redirects WHERE id = $1', [id]);

    await logAudit(userEmail, 'DELETE', 'redirect', id, `Deleted redirect #${id}`);

    // Reload cache immediately
    await reloadRedirects();

    return NextResponse.json({ success: true, message: 'Redirect deleted' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
