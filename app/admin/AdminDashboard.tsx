'use client';

import { useState, useEffect } from 'react';

interface Redirect {
  id: number;
  source_path: string;
  destination_url: string;
  redirect_type: number;
  is_active: boolean;
  notes: string;
}

interface Page {
  id: number;
  slug: string;
  title: string;
  html_content?: string;
  updated_at: string;
  updated_by: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<'redirects' | 'pages'>('redirects');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 4 }}>Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>Manage redirects and news feed content</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setTab('redirects')}
          style={{
            padding: '10px 24px', cursor: 'pointer', border: 'none',
            borderBottom: tab === 'redirects' ? '2px solid #337ab7' : '2px solid transparent',
            background: 'none', fontWeight: tab === 'redirects' ? 'bold' : 'normal',
            color: tab === 'redirects' ? '#337ab7' : '#666', fontSize: 15,
          }}
        >
          Redirects
        </button>
        <button
          onClick={() => setTab('pages')}
          style={{
            padding: '10px 24px', cursor: 'pointer', border: 'none',
            borderBottom: tab === 'pages' ? '2px solid #337ab7' : '2px solid transparent',
            background: 'none', fontWeight: tab === 'pages' ? 'bold' : 'normal',
            color: tab === 'pages' ? '#337ab7' : '#666', fontSize: 15,
          }}
        >
          News Feed Pages
        </button>
      </div>

      {tab === 'redirects' ? <RedirectsTab /> : <PagesTab />}
    </div>
  );
}

function RedirectsTab() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ source_path: '', destination_url: '', redirect_type: 301, notes: '' });
  const [msg, setMsg] = useState('');

  async function loadRedirects() {
    setLoading(true);
    const res = await fetch('/api/redirects');
    const data = await res.json();
    setRedirects(data.redirects || []);
    setLoading(false);
  }

  useEffect(() => { loadRedirects(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (editId) {
      await fetch('/api/redirects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form }),
      });
      setMsg('Redirect updated!');
    } else {
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setMsg(data.error); return; }
      setMsg('Redirect created!');
    }
    setForm({ source_path: '', destination_url: '', redirect_type: 301, notes: '' });
    setEditId(null);
    setShowForm(false);
    loadRedirects();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this redirect?')) return;
    await fetch(`/api/redirects?id=${id}`, { method: 'DELETE' });
    loadRedirects();
  }

  function startEdit(r: Redirect) {
    setEditId(r.id);
    setForm({ source_path: r.source_path, destination_url: r.destination_url, redirect_type: r.redirect_type, notes: r.notes || '' });
    setShowForm(true);
  }

  if (loading) return <p>Loading redirects...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#666' }}>{redirects.length} redirects</span>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ source_path: '', destination_url: '', redirect_type: 301, notes: '' }); }}
          style={{ padding: '8px 16px', background: '#337ab7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Redirect'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 16, borderRadius: 4, marginBottom: 16, border: '1px solid #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Source Path</label>
              <input value={form.source_path} onChange={e => setForm({ ...form, source_path: e.target.value })}
                placeholder="/old-path" required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Destination URL</label>
              <input value={form.destination_url} onChange={e => setForm({ ...form, destination_url: e.target.value })}
                placeholder="https://gfi.ai/new-page" required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Type</label>
              <select value={form.redirect_type} onChange={e => setForm({ ...form, redirect_type: Number(e.target.value) })}
                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
                <option value={301}>301</option>
                <option value={302}>302</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional note" style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
          </div>
          <button type="submit" style={{ padding: '8px 20px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {editId ? 'Update' : 'Create'}
          </button>
          {msg && <span style={{ marginLeft: 12, color: msg.includes('!') ? 'green' : 'red' }}>{msg}</span>}
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '8px 4px' }}>Source</th>
            <th style={{ padding: '8px 4px' }}>Destination</th>
            <th style={{ padding: '8px 4px', width: 50 }}>Type</th>
            <th style={{ padding: '8px 4px', width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 4px', fontFamily: 'monospace', fontSize: 13 }}>{r.source_path}</td>
              <td style={{ padding: '6px 4px', fontSize: 12, color: '#666', wordBreak: 'break-all' }}>{r.destination_url}</td>
              <td style={{ padding: '6px 4px', textAlign: 'center' }}>{r.redirect_type}</td>
              <td style={{ padding: '6px 4px' }}>
                <button onClick={() => startEdit(r)} style={{ marginRight: 8, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                <button onClick={() => handleDelete(r.id)} style={{ padding: '2px 8px', cursor: 'pointer', fontSize: 12, color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PagesTab() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/pages').then(r => r.json()).then(d => {
      setPages(d.pages || []);
      setLoading(false);
    });
  }, []);

  async function loadPage(slug: string) {
    setSelectedSlug(slug);
    setMsg('');
    const res = await fetch(`/api/pages?slug=${slug}`);
    const data = await res.json();
    setHtmlContent(data.page?.html_content || '');
  }

  async function savePage() {
    setSaving(true);
    setMsg('');
    await fetch('/api/pages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: selectedSlug, html_content: htmlContent, updated_by: 'admin' }),
    });
    setMsg('Saved!');
    setSaving(false);
    // Refresh page list for updated timestamp
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data.pages || []);
  }

  if (loading) return <p>Loading pages...</p>;

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 16 }}>Select a news feed page to edit its HTML content. Changes are live immediately after saving.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {pages.map(p => (
          <button key={p.slug} onClick={() => loadPage(p.slug)}
            style={{
              padding: '8px 16px', cursor: 'pointer', borderRadius: 4,
              border: selectedSlug === p.slug ? '2px solid #337ab7' : '1px solid #ccc',
              background: selectedSlug === p.slug ? '#e8f0fe' : '#fff',
              fontWeight: selectedSlug === p.slug ? 'bold' : 'normal',
            }}>
            {p.title}
          </button>
        ))}
      </div>

      {selectedSlug && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#999' }}>
              Last updated: {pages.find(p => p.slug === selectedSlug)?.updated_at?.slice(0, 19).replace('T', ' ')} by {pages.find(p => p.slug === selectedSlug)?.updated_by}
            </span>
            <button onClick={savePage} disabled={saving}
              style={{ padding: '8px 24px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          {msg && <p style={{ color: 'green', marginBottom: 8 }}>{msg}</p>}
          <textarea
            value={htmlContent}
            onChange={e => setHtmlContent(e.target.value)}
            style={{
              width: '100%', height: 500, fontFamily: 'monospace', fontSize: 13,
              padding: 12, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box',
              lineHeight: 1.5,
            }}
          />
        </>
      )}
    </div>
  );
}
