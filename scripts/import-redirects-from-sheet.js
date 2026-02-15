/**
 * Import Redirects from Google Sheets Data
 *
 * This script takes the tab-separated data from Google Sheets
 * and imports only the URLs that need redirects
 *
 * Usage:
 * 1. Copy the Google Sheets data
 * 2. Save it as redirects.tsv (tab-separated)
 * 3. Run: node scripts/import-redirects-from-sheet.js redirects.tsv
 */

const fs = require('fs');
const mysql = require('mysql2/promise');

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

    // Only import if:
    // 1. Keep = "Yes"
    // 2. Redirect URL is filled
    // 3. It's not one of our critical pages
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
        redirect_type: 301, // Permanent redirect
        notes: `Imported from Google Sheets. Original HTTP code: ${httpCode}, Access count: ${count}`
      });
    }
  }

  console.log(`\n📊 Found ${redirects.length} redirects to import\n`);

  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kerio_news',
  });

  console.log('✅ Connected to database\n');

  // Import redirects
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  for (const redirect of redirects) {
    try {
      const [result] = await connection.execute(
        `INSERT INTO redirects (source_path, destination_url, redirect_type, notes)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           destination_url=VALUES(destination_url),
           redirect_type=VALUES(redirect_type),
           notes=VALUES(notes),
           updated_at=CURRENT_TIMESTAMP`,
        [redirect.source_path, redirect.destination_url, redirect.redirect_type, redirect.notes]
      );

      if (result.affectedRows === 1) {
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

  await connection.end();

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
  console.error('❌ Usage: node import-redirects-from-sheet.js <path-to-tsv-file>');
  console.error('\nExample:');
  console.error('  node scripts/import-redirects-from-sheet.js redirects.tsv');
  console.error('\nTo create the TSV file:');
  console.error('  1. Copy the Google Sheets data you pasted');
  console.error('  2. Save it as "redirects.tsv"');
  console.error('  3. Run this script');
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
    process.exit(1);
  });
