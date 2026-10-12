CREATE TABLE IF NOT EXISTS brief_email_challenges (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  creator_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  verified_at INTEGER,
  verified_until INTEGER,
  delivered INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS brief_email_challenges_email ON brief_email_challenges(email,created_at);
CREATE INDEX IF NOT EXISTS brief_email_challenges_creator ON brief_email_challenges(creator_hash,created_at);
