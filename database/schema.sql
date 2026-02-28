-- PostgreSQL Schema for Kerio News Redirects

-- Redirects Table for managing URL redirects
CREATE TABLE IF NOT EXISTS redirects (
  id SERIAL PRIMARY KEY,
  source_path VARCHAR(500) NOT NULL UNIQUE,
  destination_url VARCHAR(1000) NOT NULL,
  redirect_type INTEGER DEFAULT 301,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_redirects_active ON redirects(is_active);
CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects(source_path);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_redirects_updated_at BEFORE UPDATE ON redirects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Pages Table for editable HTML content (news feeds)
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(200) DEFAULT 'system'
);

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit Log Table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(200) NOT NULL,
  action VARCHAR(20) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_email);

-- News Items Table for individual news feed articles
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

CREATE INDEX IF NOT EXISTS idx_news_items_feed ON news_items(feed_slug, is_active, sort_order);

CREATE TRIGGER update_news_items_updated_at BEFORE UPDATE ON news_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
