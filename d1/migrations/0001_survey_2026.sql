-- New 2026 database only. No historical Supabase data is imported.
PRAGMA foreign_keys = ON;

CREATE TABLE survey_responses (
  id TEXT PRIMARY KEY NOT NULL,
  submission_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  survey_year INTEGER NOT NULL CHECK (survey_year = 2026),
  schema_version TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  organization_name TEXT,
  response_data TEXT NOT NULL CHECK (json_valid(response_data)),
  is_completed INTEGER NOT NULL DEFAULT 1 CHECK (is_completed IN (0, 1)),
  reward_status TEXT NOT NULL DEFAULT '발송 대기'
    CHECK (reward_status IN ('추첨 대상 아님', '발송 대기', '정보 확인 중', '발송 완료')),
  reward_sent_at TEXT,
  reward_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX survey_responses_submitted_idx ON survey_responses (submitted_at DESC, id DESC);
CREATE INDEX survey_responses_reward_idx ON survey_responses (reward_status);

-- Personal data must never be included in the ordinary statistics query.
CREATE TABLE survey_response_pii (
  response_id TEXT PRIMARY KEY NOT NULL
    REFERENCES survey_responses(id) ON DELETE CASCADE,
  pii_data TEXT NOT NULL CHECK (json_valid(pii_data)),
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Password hashes are generated on the server. No default password is seeded.
CREATE TABLE export_passwords (
  id TEXT PRIMARY KEY NOT NULL CHECK (id = 'default'),
  password_hash TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE export_logs (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('all', 'response', 'pii')),
  export_format TEXT NOT NULL CHECK (export_format IN ('csv', 'json', 'xlsx')),
  response_count INTEGER NOT NULL CHECK (response_count >= 0),
  created_at TEXT NOT NULL
);

CREATE INDEX export_logs_created_idx ON export_logs (created_at DESC);
