import { NextRequest, NextResponse } from 'next/server';
import { resolve } from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(resolve);

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
  }

  // Sanitize domain
  const cleanDomain = domain.replace(/[^a-zA-Z0-9.-]/g, '');

  try {
    const records: { type: string; value: string }[] = [];
    let spf: string | null = null;

    // Look up TXT records (SPF/CallerID)
    try {
      const txtRecords = await new Promise<string[][]>((resolve, reject) => {
        require('dns').resolveTxt(cleanDomain, (err: Error | null, records: string[][]) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      for (const record of txtRecords) {
        const value = record.join('');
        records.push({ type: 'TXT', value });
        if (value.startsWith('v=spf1')) {
          spf = value;
        }
      }
    } catch {
      // No TXT records
    }

    // Look up MX records
    try {
      const mxRecords = await new Promise<{ exchange: string; priority: number }[]>((resolve, reject) => {
        require('dns').resolveMx(cleanDomain, (err: Error | null, records: { exchange: string; priority: number }[]) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      for (const mx of mxRecords) {
        records.push({ type: 'MX', value: `${mx.priority} ${mx.exchange}` });
      }
    } catch {
      // No MX records
    }

    // Look up A records
    try {
      const aRecords = await new Promise<string[]>((resolve, reject) => {
        require('dns').resolve4(cleanDomain, (err: Error | null, records: string[]) => {
          if (err) reject(err);
          else resolve(records);
        });
      });

      for (const a of aRecords) {
        records.push({ type: 'A', value: a });
      }
    } catch {
      // No A records
    }

    return NextResponse.json({ domain: cleanDomain, records, spf });
  } catch (error) {
    return NextResponse.json({ domain: cleanDomain, records: [], spf: null, error: 'DNS lookup failed' });
  }
}
