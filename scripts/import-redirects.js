/**
 * Import Redirects from CSV/Google Sheets Export
 *
 * Usage:
 * 1. Export Google Sheets as CSV
 * 2. Place CSV file in this directory
 * 3. Run: node scripts/import-redirects.js path/to/redirects.csv
 */

const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function importRedirects(csvFilePath) {
  // Read CSV file
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvContent.split('\n');

  // Parse CSV (simple parser - assumes comma-separated, no quotes)
  const redirects = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [sourcePath, destinationUrl, redirectType, notes] = line.split(',');

    if (sourcePath && destinationUrl) {
      redirects.push({
        source_path: sourcePath.trim(),
        destination_url: destinationUrl.trim(),
        redirect_type: redirectType ? parseInt(redirectType.trim()) : 301,
        notes: notes ? notes.trim() : ''
      });
    }
  }

  console.log(`Found ${redirects.length} redirects to import`);

  // Connect to database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kerio_news',
  });

  console.log('Connected to database');

  // Import redirects
  let imported = 0;
  let skipped = 0;

  for (const redirect of redirects) {
    try {
      await connection.execute(
        'INSERT INTO redirects (source_path, destination_url, redirect_type, notes) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE destination_url=VALUES(destination_url), redirect_type=VALUES(redirect_type), notes=VALUES(notes)',
        [redirect.source_path, redirect.destination_url, redirect.redirect_type, redirect.notes]
      );
      imported++;
      console.log(`✓ Imported: ${redirect.source_path} -> ${redirect.destination_url}`);
    } catch (error) {
      console.error(`✗ Failed to import: ${redirect.source_path}`, error.message);
      skipped++;
    }
  }

  await connection.end();

  console.log('\n=== Import Summary ===');
  console.log(`Total redirects: ${redirects.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

// Main execution
const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node import-redirects.js <path-to-csv-file>');
  console.error('\nExample:');
  console.error('  node import-redirects.js ./redirects.csv');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`File not found: ${csvPath}`);
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

importRedirects(csvPath)
  .then(() => {
    console.log('\n✅ Import completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });
