import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get IP address from various possible headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  // Priority: x-forwarded-for > cf-connecting-ip > x-real-ip
  let ip = forwarded?.split(',')[0].trim()
    || cfConnectingIp
    || realIp
    || '127.0.0.1'; // Fallback for local development

  return new NextResponse(ip, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache, must-revalidate',
      'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
    },
  });
}
