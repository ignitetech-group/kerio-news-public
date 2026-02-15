/**
 * Import Redirects from TSV for PostgreSQL
 *
 * Usage:
 * 1. Save Google Sheets data as redirects.tsv (tab-separated)
 * 2. Run: node scripts/import-redirects-postgres.js redirects.tsv
 */

const fs = require('fs');
const { Pool } = require('pg');

async function importRedirects(tsvFilePath) {
  // Read TSV file
  const tsvContent = fs.readFileSync(tsvFilePath, 'utf-8');
  const lines = tsvContent.split('\n');

  const redirects = [];

  // Skip header row, process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by tab
    const cols = line.split('\t');
    const url = cols[0]?.trim();
    const count = cols[1]?.trim();
    const httpCode = cols[2]?.trim();
    const type = cols[3]?.trim();
    const keep = cols[4]?.trim();
    const redirect = cols[5]?.trim();

    // Only import if Keep = "Yes" and Redirect URL is filled
    if (keep === 'Yes' && redirect && redirect !== '') {
      // Skip our critical pages (they should not redirect)
      if (url === '/scripts/PublicIpHelper.php' ||
          url === '/newstile/interface/kerioconnect/all.html' ||
          url === '/newstile/interface/kerioconnect/linux.html' ||
          url === '/newstile/interface/keriocontrol/linux.html') {
        console.log(`⏭️  Skipping critical page: ${url}`);
        continue;
      }

      redirects.push({
        source_path: url,
        destination_url: redirect,
        redirect_type: 301,
        notes: `Imported from Google Sheets. Original HTTP code: ${httpCode}, Access count: ${count}`
      });
    }
  }

  console.log(`\n📊 Found ${redirects.length} redirects to import\n`);

  // Connect to PostgreSQL
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'kerio_user',
    password: process.env.DB_PASSWORD || 'kerio_password',
    database: process.env.DB_NAME || 'kerio_news',
  });

  console.log('✅ Connected to PostgreSQL database\n');

  // Import redirects
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const redirect of redirects) {
    try {
      const result = await pool.query(
        `INSERT INTO redirects (source_path, destination_url, redirect_type, notes)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (source_path) DO UPDATE SET
           destination_url = EXCLUDED.destination_url,
           redirect_type = EXCLUDED.redirect_type,
           notes = EXCLUDED.notes,
           updated_at = CURRENT_TIMESTAMP
         RETURNING (xmax = 0) AS inserted`,
        [redirect.source_path, redirect.destination_url, redirect.redirect_type, redirect.notes]
      );

      if (result.rows[0].inserted) {
        imported++;
        console.log(`✅ Imported: ${redirect.source_path} → ${redirect.destination_url}`);
      } else {
        updated++;
        console.log(`🔄 Updated: ${redirect.source_path} → ${redirect.destination_url}`);
      }
    } catch (error) {
      console.error(`❌ Failed: ${redirect.source_path}`, error.message);
      skipped++;
    }
  }

  await pool.end();

  console.log('\n=== Import Summary ===');
  console.log(`Total redirects in file: ${redirects.length}`);
  console.log(`✅ Imported (new): ${imported}`);
  console.log(`🔄 Updated (existing): ${updated}`);
  console.log(`❌ Skipped (errors): ${skipped}`);
  console.log('\n✨ Import completed!\n');
}

// Main execution
const tsvPath = process.argv[2];

if (!tsvPath) {
  console.error('❌ Usage: node import-redirects-postgres.js <path-to-tsv-file>');
  console.error('\nExample:');
  console.error('  node scripts/import-redirects-postgres.js redirects.tsv');
  process.exit(1);
}

if (!fs.existsSync(tsvPath)) {
  console.error(`❌ File not found: ${tsvPath}`);
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

importRedirects(tsvPath)
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
