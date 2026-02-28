'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

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

interface NewsItem {
  id: number;
  feed_slug: string;
  category: string;
  title: string;
  content: string;
  article_date: string;
  sort_order: number;
  is_active: boolean;
}

interface AuditEntry {
  id: number;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  created_at: string;
}

const FEEDS = [
  { slug: 'kerioconnect-all', label: 'KerioConnect (All)' },
  { slug: 'kerioconnect-linux', label: 'KerioConnect (Linux)' },
  { slug: 'keriocontrol-linux', label: 'KerioControl (Linux)' },
];

const CATEGORIES = ['Product Updates', 'Product Info', 'Known Bugs', 'Blog Posts'];

export default function AdminDashboard({ userEmail, userName }: { userEmail: string; userName: string }) {
  const [tab, setTab] = useState<'redirects' | 'news' | 'pages' | 'audit'>('redirects');

  const tabs = [
    { key: 'redirects' as const, label: 'Redirects' },
    { key: 'news' as const, label: 'News Items' },
    { key: 'pages' as const, label: 'Raw HTML Pages' },
    { key: 'audit' as const, label: 'Audit Log' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#666' }}>{userName || userEmail}</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" style={{ padding: '6px 12px', fontSize: 13, cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 4 }}>
              Sign out
            </button>
          </form>
        </div>
      </div>
      <p style={{ color: '#666', marginBottom: 20 }}>Manage redirects and news feed content</p>

      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #ddd' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 24px', cursor: 'pointer', border: 'none',
              borderBottom: tab === t.key ? '2px solid #337ab7' : '2px solid transparent',
              background: 'none', fontWeight: tab === t.key ? 'bold' : 'normal',
              color: tab === t.key ? '#337ab7' : '#666', fontSize: 15,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'redirects' && <RedirectsTab userEmail={userEmail} />}
      {tab === 'news' && <NewsItemsTab userEmail={userEmail} />}
      {tab === 'pages' && <PagesTab userEmail={userEmail} />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
}

// ─── News Items Tab (TinyMCE) ────────────────────────────────────────────────

function NewsItemsTab({ userEmail }: { userEmail: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedSlug, setFeedSlug] = useState(FEEDS[0].slug);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');

  const emptyForm: Omit<NewsItem, 'id' | 'is_active'> = {
    feed_slug: feedSlug,
    category: CATEGORIES[0],
    title: '',
    content: '',
    article_date: new Date().toISOString().slice(0, 10),
    sort_order: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const editorRef = useRef<any>(null);

  async function loadItems(slug?: string) {
    setLoading(true);
    const s = slug || feedSlug;
    const res = await fetch(`/api/news-items?feed_slug=${s}`);
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => { loadItems(); }, [feedSlug]);

  function handleFeedChange(slug: string) {
    setFeedSlug(slug);
    setShowForm(false);
    setEditItem(null);
    setMsg('');
  }

  function startAdd() {
    setEditItem(null);
    setForm({ ...emptyForm, feed_slug: feedSlug });
    setShowForm(true);
    setMsg('');
  }

  function startEdit(item: NewsItem) {
    setEditItem(item);
    setForm({
      feed_slug: item.feed_slug,
      category: item.category,
      title: item.title,
      content: item.content,
      article_date: item.article_date?.slice(0, 10) || '',
      sort_order: item.sort_order,
    });
    setShowForm(true);
    setMsg('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');

    const content = editorRef.current ? editorRef.current.getContent() : form.content;
    const payload = { ...form, content, user_email: userEmail };

    if (editItem) {
      await fetch('/api/news-items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editItem.id, ...payload }),
      });
      setMsg('Item updated!');
    } else {
      const res = await fetch('/api/news-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.error) { setMsg(data.error); return; }
      setMsg('Item created!');
    }

    setShowForm(false);
    setEditItem(null);
    loadItems();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this news item?')) return;
    await fetch(`/api/news-items?id=${id}&user_email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
    loadItems();
  }

  function cancelForm() {
    setShowForm(false);
    setEditItem(null);
    setMsg('');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13, fontWeight: 'bold' }}>Feed:</label>
          <select
            value={feedSlug}
            onChange={e => handleFeedChange(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13 }}
          >
            {FEEDS.map(f => <option key={f.slug} value={f.slug}>{f.label}</option>)}
          </select>
          <span style={{ color: '#666', fontSize: 13 }}>{items.length} items</span>
        </div>
        {!showForm && (
          <button onClick={startAdd}
            style={{ padding: '8px 16px', background: '#337ab7', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            + Add News Item
          </button>
        )}
      </div>

      {msg && <p style={{ color: msg.includes('!') ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: 16, borderRadius: 4, marginBottom: 16, border: '1px solid #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Article title" required
                style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Date</label>
                <input type="date" value={form.article_date} onChange={e => setForm({ ...form, article_date: e.target.value })}
                  required style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })}
                  style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, marginBottom: 4, fontWeight: 'bold' }}>Content</label>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
              onInit={(_evt, editor) => { editorRef.current = editor; }}
              initialValue={form.content}
              init={{
                height: 350,
                menubar: false,
                plugins: 'lists link image table code',
                toolbar: 'undo redo | bold italic underline strikethrough | bullist numlist | link image table | code | removeformat',
                content_style: 'body { font-family: Lato, Arial, sans-serif; font-size: 12px; }',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 20px', background: '#5cb85c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {editItem ? 'Update Item' : 'Create Item'}
            </button>
            <button type="button" onClick={cancelForm} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #ccc', borderRadius: 4, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? <p>Loading items...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px', width: 40 }}>Order</th>
              <th style={{ padding: '8px 4px' }}>Title</th>
              <th style={{ padding: '8px 4px', width: 130 }}>Category</th>
              <th style={{ padding: '8px 4px', width: 100 }}>Date</th>
              <th style={{ padding: '8px 4px', width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee', opacity: item.is_active ? 1 : 0.5 }}>
                <td style={{ padding: '6px 4px', textAlign: 'center', color: '#999' }}>{item.sort_order}</td>
                <td style={{ padding: '6px 4px' }}>{item.title}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 11, background: '#e5f1ff', color: '#121457' }}>
                    {item.category}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', fontSize: 12, color: '#666' }}>{item.article_date?.slice(0, 10)}</td>
                <td style={{ padding: '6px 4px' }}>
                  <button onClick={() => startEdit(item)} style={{ marginRight: 8, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '2px 8px', cursor: 'pointer', fontSize: 12, color: 'red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Redirects Tab ───────────────────────────────────────────────────────────

function RedirectsTab({ userEmail }: { userEmail: string }) {
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
        body: JSON.stringify({ id: editId, ...form, user_email: userEmail }),
      });
      setMsg('Redirect updated!');
    } else {
      const res = await fetch('/api/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, user_email: userEmail }),
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
    await fetch(`/api/redirects?id=${id}&user_email=${encodeURIComponent(userEmail)}`, { method: 'DELETE' });
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

// ─── Raw HTML Pages Tab ──────────────────────────────────────────────────────

function PagesTab({ userEmail }: { userEmail: string }) {
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
      body: JSON.stringify({ slug: selectedSlug, html_content: htmlContent, updated_by: userEmail }),
    });
    setMsg('Saved!');
    setSaving(false);
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data.pages || []);
  }

  if (loading) return <p>Loading pages...</p>;

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Edit raw HTML for news feed pages. Note: if a feed has items in the News Items tab, those will be used instead of this raw HTML.
      </p>

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

// ─── Audit Log Tab ───────────────────────────────────────────────────────────

function AuditTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(d => {
      setEntries(d.entries || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading audit log...</p>;

  return (
    <div>
      <p style={{ color: '#666', marginBottom: 16 }}>Recent admin actions</p>
      {entries.length === 0 ? (
        <p style={{ color: '#999' }}>No audit entries yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
              <th style={{ padding: '8px 4px' }}>Time</th>
              <th style={{ padding: '8px 4px' }}>User</th>
              <th style={{ padding: '8px 4px' }}>Action</th>
              <th style={{ padding: '8px 4px' }}>Entity</th>
              <th style={{ padding: '8px 4px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '6px 4px', whiteSpace: 'nowrap', fontSize: 12, color: '#666' }}>
                  {e.created_at?.slice(0, 19).replace('T', ' ')}
                </td>
                <td style={{ padding: '6px 4px', fontSize: 12 }}>{e.user_email}</td>
                <td style={{ padding: '6px 4px' }}>
                  <span style={{
                    padding: '2px 6px', borderRadius: 3, fontSize: 11, fontWeight: 'bold',
                    background: e.action === 'CREATE' ? '#d4edda' : e.action === 'DELETE' ? '#f8d7da' : '#cce5ff',
                    color: e.action === 'CREATE' ? '#155724' : e.action === 'DELETE' ? '#721c24' : '#004085',
                  }}>
                    {e.action}
                  </span>
                </td>
                <td style={{ padding: '6px 4px', fontSize: 12 }}>{e.entity_type} #{e.entity_id}</td>
                <td style={{ padding: '6px 4px', fontSize: 11, color: '#666', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
