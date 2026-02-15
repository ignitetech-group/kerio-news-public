import { NextRequest, NextResponse } from 'next/server';

/**
 * Kickbox email verification proxy
 * API key is stored in environment variable (NOT hardcoded)
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  const apiKey = process.env.KICKBOX_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Kickbox API key not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.kickbox.com/v2/verify?email=${encodeURIComponent(email)}&apikey=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Verification service error' }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
