-- Create new table with correct id type but same table name later
CREATE TABLE IF NOT EXISTS Referral_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  product TEXT NOT NULL,
  referralCode TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tokensAwarded INTEGER NOT NULL DEFAULT 0,
  submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Copy data
INSERT INTO Referral_new (name, phone, email, product, referralCode, status, tokensAwarded, submittedAt)
SELECT name, phone, email, product, referralCode, status, tokensAwarded, submittedAt
FROM Referral;

-- Drop old table
DROP TABLE Referral;

-- Rename new table to the original name
ALTER TABLE Referral_new RENAME TO Referral;

-- Optional: recreate indexes
CREATE INDEX IF NOT EXISTS idx_referral_phone ON Referral(phone);
CREATE INDEX IF NOT EXISTS idx_referral_email ON Referral(email);
CREATE INDEX IF NOT EXISTS idx_referral_status ON Referral(status);
