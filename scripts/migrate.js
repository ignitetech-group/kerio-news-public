const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database');

  await client.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(200) NOT NULL,
      action VARCHAR(20) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(50),
      details TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('audit_log table ready');

  await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_email);`);
  console.log('audit_log indexes ready');

  await client.query(`
    CREATE TABLE IF NOT EXISTS news_items (
      id SERIAL PRIMARY KEY,
      feed_slug VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      article_date DATE NOT NULL DEFAULT CURRENT_DATE,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('news_items table ready');

  await client.query(`CREATE INDEX IF NOT EXISTS idx_news_items_feed ON news_items(feed_slug, is_active, sort_order);`);
  console.log('news_items indexes ready');

  // Reuse the existing trigger function for updated_at
  await client.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await client.query(`
    DO $$ BEGIN
      CREATE TRIGGER update_news_items_updated_at BEFORE UPDATE ON news_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  console.log('news_items trigger ready');

  await client.end();
  console.log('Migration complete');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
