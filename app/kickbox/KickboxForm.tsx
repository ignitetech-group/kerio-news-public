'use client';

import { useState } from 'react';

interface VerifyResult {
  result?: string;
  reason?: string;
  disposable?: boolean;
  accept_all?: boolean;
  free?: boolean;
  role?: boolean;
  error?: string;
}

export default function KickboxForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function verifyEmail(emailValue: string) {
    if (!emailValue || !emailValue.includes('@')) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/kickbox/verify?email=${encodeURIComponent(emailValue)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Verification failed' });
    }
    setLoading(false);
  }

  const statusColor = result?.result === 'deliverable' ? 'green' : result?.result === 'undeliverable' ? 'red' : 'orange';
  const isValid = result?.result === 'deliverable';

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={{ background: '#333', padding: '15px 20px', marginBottom: 20 }}>
        <strong style={{ color: '#fff', fontSize: 16 }}>Kickbox Verifier UI Demo</strong>
      </nav>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        <div style={{ background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4, padding: 20 }}>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Your email</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ background: '#eee', padding: '8px 12px', border: '1px solid #ccc', borderRight: 'none', borderRadius: '4px 0 0 4px' }}>@</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => verifyEmail(e.target.value)}
                placeholder="Email"
                style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: '0 4px 4px 0' }}
              />
            </div>
            {loading && <p style={{ color: '#999', fontSize: 12, marginTop: 4 }}>Verifying...</p>}
            {result && !result.error && (
              <p style={{ color: statusColor, fontSize: 12, marginTop: 4 }}>
                {result.result} - {result.reason}
              </p>
            )}
            {result?.error && (
              <p style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{result.error}</p>
            )}
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}
            />
          </div>

          <button
            disabled={!isValid}
            style={{
              padding: '10px 20px',
              background: isValid ? '#337ab7' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
