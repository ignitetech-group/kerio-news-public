'use client';

import { useState } from 'react';

interface DnsRecord {
  type: string;
  value: string;
}

interface CallerIdResult {
  domain: string;
  records: DnsRecord[];
  spf: string | null;
  error?: string;
}

export default function CallerIdLookup() {
  const [domain, setDomain] = useState('kerio.com');
  const [result, setResult] = useState<CallerIdResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/callerid?domain=${encodeURIComponent(domain)}&details=${showDetails}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ domain, records: [], spf: null, error: 'Lookup failed' });
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: 'verdana, sans-serif', fontSize: 12, minHeight: '100vh' }}>
      <table width="100%" style={{ maxWidth: 780, backgroundColor: '#003473' }} cellSpacing={0} cellPadding={0}>
        <tbody>
          <tr><td colSpan={2} style={{ backgroundColor: '#005db2', height: 10 }} /></tr>
          <tr><td colSpan={2} style={{ backgroundColor: '#003473', height: 10 }} /></tr>
          <tr>
            <td width={190} style={{ paddingLeft: 10 }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Kerio Technologies</span>
            </td>
            <td style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>Caller ID for e-mail</td>
          </tr>
          <tr><td colSpan={2} style={{ backgroundColor: '#003473', height: 10 }} /></tr>
        </tbody>
      </table>

      <div style={{ padding: '12px 16px', maxWidth: 780 }}>
        <p>
          &quot;Caller ID for E-Mail: The Next Step to Deterring Spam&quot; is the Microsoft draft specification
          to address the widespread problem of domain spoofing. Domain spoofing refers specifically to the
          use of someone else&apos;s domain name when sending a message.
        </p>
        <p>
          Caller ID for e-mail would verify that each e-mail message originates from the Internet domain
          it claims to come from. Eliminating domain spoofing will help legitimate senders protect their
          domain names and reputations, and help recipients more effectively identify and filter junk e-mail.
        </p>

        <hr />
        <p>Search this domain for Caller ID information:</p>

        <form onSubmit={handleSubmit}>
          <input
            name="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            style={{ padding: 4, marginRight: 4, border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '4px 12px', cursor: 'pointer' }}>
            {loading ? 'Looking up...' : 'Go'}
          </button>
          <br />
          <label style={{ fontSize: 10 }}>
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
            />
            Show details
          </label>
        </form>

        {result && (
          <div style={{ marginTop: 16 }}>
            {result.error ? (
              <p style={{ color: 'red' }}>{result.error}</p>
            ) : (
              <>
                <h3>Results for {result.domain}</h3>
                {result.spf && (
                  <div style={{ marginBottom: 12 }}>
                    <strong>SPF Record:</strong>
                    <pre style={{ backgroundColor: '#f0f0f0', padding: 8, fontSize: 11, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{result.spf}</pre>
                  </div>
                )}
                {result.records.length > 0 && (
                  <table style={{ borderCollapse: 'collapse', fontSize: 12, border: '1px solid #999', marginBottom: 12, width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ background: '#800', color: '#fff', padding: '6px 12px', textAlign: 'left' }}>Type</th>
                        <th style={{ background: '#800', color: '#fff', padding: '6px 12px', textAlign: 'left' }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.records.map((r, i) => (
                        <tr key={i}>
                          <td style={{ background: '#FCDEB4', color: '#820000', padding: '4px 12px', borderBottom: '1px solid #ddd', fontWeight: 500 }}>{r.type}</td>
                          <td style={{ background: '#f0f0f0', padding: '4px 12px', fontSize: 11, borderBottom: '1px solid #ddd', wordBreak: 'break-all' }}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {!result.spf && result.records.length === 0 && (
                  <p>No Caller ID / SPF records found for this domain.</p>
                )}
              </>
            )}
          </div>
        )}

        <p>
          <a href="https://gfi.ai/products-and-solutions/email-and-messaging-solutions/kerio-connect" style={{ color: '#0066cc' }}>
            <b>Kerio Connect</b>
          </a>{' '}
          is the first commercial mailserver with CallerID technology on the market.
        </p>
      </div>
    </div>
  );
}
