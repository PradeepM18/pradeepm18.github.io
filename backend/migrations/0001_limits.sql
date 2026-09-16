CREATE TABLE chat_requests (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  month TEXT NOT NULL,
  reserved_microdollars INTEGER NOT NULL CHECK(reserved_microdollars > 0)
);
CREATE INDEX chat_requests_ip_time ON chat_requests(ip_hash, created_at);
CREATE INDEX chat_requests_time ON chat_requests(created_at);
CREATE INDEX chat_requests_month ON chat_requests(month);
CREATE TABLE challenge_attempts (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX challenge_attempts_ip_time ON challenge_attempts(ip_hash, created_at);
