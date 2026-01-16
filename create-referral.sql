-- ===============================
-- Referral table (SQLite)
-- ===============================

CREATE TABLE IF NOT EXISTS Referral (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  referralCode TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_phone
ON Referral (phone);

CREATE INDEX IF NOT EXISTS idx_referral_email
ON Referral (email);

CREATE INDEX IF NOT EXISTS idx_referral_status
ON Referral (status);
