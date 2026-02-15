import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Redirect {
  id: number;
  source_path: string;
  destination_url: string;
  redirect_type: number;
  is_active: boolean;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path parameter required' }, { status: 400 });
  }

  try {
    const redirects = await query<Redirect[]>(
      'SELECT * FROM redirects WHERE source_path = $1 AND is_active = TRUE LIMIT 1',
      [path]
    );

    if (redirects.length > 0) {
      return NextResponse.json({ redirect: redirects[0] });
    }

    return NextResponse.json({ redirect: null });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error', redirect: null }, { status: 500 });
  }
}
