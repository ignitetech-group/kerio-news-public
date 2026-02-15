import { NextRequest, NextResponse } from 'next/server';

/**
 * Product trial registration router
 * Redirects to correct trial page based on product, language, and platform
 *
 * Products: kms (Connect), kwf (Control), kts (Operator)
 * Languages: cz, ru, default (en)
 * Platform: passed through as query param
 */
export async function GET(request: NextRequest) {
  const prod = request.nextUrl.searchParams.get('prod');
  const lang = request.nextUrl.searchParams.get('lang') || 'en';
  const plat = request.nextUrl.searchParams.get('plat') || '';

  if (!prod) {
    return NextResponse.redirect('https://www.kerio.com', 301);
  }

  const products: Record<string, string> = {
    kms: 'kerio-connect',
    kwf: 'kerio-control',
    kts: 'kerio-operator',
  };

  const domains: Record<string, string> = {
    cz: 'https://www.kerio.cz',
    ru: 'https://www.kerio.ru',
  };

  const productSlug = products[prod];
  if (!productSlug) {
    return NextResponse.redirect('https://www.kerio.com', 301);
  }

  const baseDomain = domains[lang] || 'https://www.kerio.com';
  const url = `${baseDomain}/trial-registration/${productSlug}${plat ? `?plat=${plat}` : ''}`;

  return NextResponse.redirect(url, 302);
}
