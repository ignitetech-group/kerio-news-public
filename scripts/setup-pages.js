/**
 * Create pages table and seed with current HTML content
 * Usage: node scripts/setup-pages.js <DATABASE_URL>
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATABASE_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Usage: node scripts/setup-pages.js <DATABASE_URL>');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const pages = [
  {
    slug: 'kerioconnect-all',
    title: 'Kerio Connect - All Platforms',
    file: 'app/newstile/interface/kerioconnect/all.html',
  },
  {
    slug: 'kerioconnect-linux',
    title: 'Kerio Connect - Linux',
    file: 'app/newstile/interface/kerioconnect/linux.html',
  },
  {
    slug: 'keriocontrol-linux',
    title: 'Kerio Control - Linux',
    file: 'app/newstile/interface/keriocontrol/linux.html',
  },
];

async function setup() {
  console.log('Creating pages table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(200) NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      html_content TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_by VARCHAR(200) DEFAULT 'system'
    )
  `);
  console.log('Table created!\n');

  for (const page of pages) {
    const filePath = path.join(__dirname, '..', page.file);
    const html = fs.readFileSync(filePath, 'utf-8');
    await pool.query(
      `INSERT INTO pages (slug, title, html_content) VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET html_content = EXCLUDED.html_content, updated_at = CURRENT_TIMESTAMP`,
      [page.slug, page.title, html]
    );
    console.log(`Seeded: ${page.slug} (${html.length} chars)`);
  }

  const count = await pool.query('SELECT count(*) FROM pages');
  console.log(`\nDone! ${count.rows[0].count} pages in DB.`);
  await pool.end();
}

setup().catch(e => { console.error('Failed:', e.message); process.exit(1); });
