import { NextRequest, NextResponse } from 'next/server';

/**
 * IPS Test - returns threat signature headers for Kerio Control IPS testing
 * The X-IPS-Signature header triggers IPS detection in Kerio Control
 */
export async function GET(request: NextRequest) {
  const sig = request.nextUrl.searchParams.get('sig');

  const signatures: Record<string, string> = {
    low: 'KERIO IPS TEST SIGNATURE - LOW SEVERITY',
    medium: 'KERIO IPS TEST SIGNATURE - MEDIUM SEVERITY',
    high: 'KERIO IPS TEST SIGNATURE - HIGH SEVERITY',
  };

  const signature = sig ? signatures[sig] : null;

  if (!signature) {
    return new NextResponse('', { status: 400 });
  }

  return new NextResponse('', {
    status: 200,
    headers: {
      'X-IPS-Signature': signature,
      'Content-Type': 'text/plain',
      'Expires': 'Mon, 26 Jul 1997 05:00:00 GMT',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
