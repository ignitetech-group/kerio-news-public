import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const entries = await query(
      'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200'
    );
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
