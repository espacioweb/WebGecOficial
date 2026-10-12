CREATE TABLE IF NOT EXISTS brief_drafts (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  answers TEXT NOT NULL,
  source TEXT NOT NULL,
  step TEXT NOT NULL,
  consent INTEGER NOT NULL CHECK (consent IN (0,1)),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','completed','cancelled')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  creator_hash TEXT NOT NULL,
  claim TEXT,
  claim_at INTEGER,
  reminder_started_at INTEGER,
  reminder_email TEXT,
  reminder_sent_at INTEGER
);
CREATE INDEX IF NOT EXISTS brief_due ON brief_drafts(state,consent,updated_at);
CREATE INDEX IF NOT EXISTS brief_email ON brief_drafts(email,created_at);
CREATE INDEX IF NOT EXISTS brief_creator ON brief_drafts(creator_hash,created_at);
