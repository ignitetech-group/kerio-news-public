-- Redirects Table for managing URL redirects
CREATE TABLE IF NOT EXISTS redirects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_path VARCHAR(500) NOT NULL,
  destination_url VARCHAR(1000) NOT NULL,
  redirect_type INT DEFAULT 301,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT,
  UNIQUE KEY unique_source_path (source_path),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example redirects (you can import from the Google Sheets)
INSERT INTO redirects (source_path, destination_url, redirect_type, notes) VALUES
('/old-page', 'https://www.kerio.com/new-page', 301, 'Example redirect'),
('/blog/old-post', 'https://www.kerio.com/blog/new-post', 301, 'Blog post moved')
ON DUPLICATE KEY UPDATE destination_url=VALUES(destination_url);
