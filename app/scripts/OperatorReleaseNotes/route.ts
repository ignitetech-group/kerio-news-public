import { NextRequest, NextResponse } from 'next/server';

/**
 * Operator Release Notes fetcher
 * Fetches release notes from download.kerio.com based on version string
 *
 * Accepts formats:
 *   "1.1.0 alpha 1 build 9000"
 *   "1.1.0 beta 1 build 9000"
 *   "1.1.0 RC1 build 9000"
 *   "1.1.0 patch 1 build 9000"
 *   "1.1.0 build 9000"
 */
export async function GET(request: NextRequest) {
  const versionString = request.nextUrl.searchParams.get('versionString')?.trim();

  if (!versionString) {
    return new NextResponse('Not Found', { status: 404 });
  }

  let version: string;
  let build: string;
  let buildType: string;
  let urlBeta = false;

  let match: RegExpMatchArray | null;

  if ((match = versionString.match(/([0-9.]+) alpha\s?([0-9]+) build ([0-9]+)/i))) {
    version = match[1];
    build = match[3];
    buildType = '-a' + match[2];
    urlBeta = true;
  } else if ((match = versionString.match(/([0-9.]+) beta\s?([0-9]+) build ([0-9]+)/i))) {
    version = match[1];
    build = match[3];
    buildType = '-b' + match[2];
    urlBeta = true;
  } else if ((match = versionString.match(/([0-9.]+) RC\s?([0-9]+) build ([0-9]+)/i))) {
    version = match[1];
    build = match[3];
    buildType = '-r' + match[2];
    urlBeta = true;
  } else if ((match = versionString.match(/([0-9.]+) patch\s?([0-9]+) build ([0-9]+)/i))) {
    version = match[1];
    build = match[3];
    buildType = '-p' + match[2];
  } else if ((match = versionString.match(/([0-9.]+) build ([0-9]+)/i))) {
    version = match[1];
    build = match[2];
    buildType = '';
  } else {
    return new NextResponse('Not Found', { status: 404 });
  }

  const dir = urlBeta ? 'beta-operator' : 'operator';
  const url = `http://download.kerio.com/dwn/${dir}/operator-${version}-${build}/kerio-operator-notes-en-${version}-${build}${buildType}.txt`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new NextResponse(`URL ${url} not available.`, { status: 404 });
    }
    const text = await res.text();
    return new NextResponse(text, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch {
    return new NextResponse(`URL ${url} not available.`, { status: 404 });
  }
}
