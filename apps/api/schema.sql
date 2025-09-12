-- PAMS Database Schema
-- Double-entry bookkeeping system

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
  parent_id TEXT,
  balance REAL DEFAULT 0,
  is_portfolio INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT (datetime('now', '+9 hours')),
  updated_at TEXT DEFAULT (datetime('now', '+9 hours')),
  FOREIGN KEY (parent_id) REFERENCES accounts(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  description TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  debit_account_id TEXT NOT NULL,
  credit_account_id TEXT NOT NULL,
  transaction_date TEXT NOT NULL DEFAULT (datetime('now', '+9 hours')),
  is_hidden INTEGER DEFAULT 0 NOT NULL,
  created_at TEXT DEFAULT (datetime('now', '+9 hours')),
  FOREIGN KEY (debit_account_id) REFERENCES accounts(id),
  FOREIGN KEY (credit_account_id) REFERENCES accounts(id),
  CHECK (debit_account_id != credit_account_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_debit ON transactions(debit_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit ON transactions(credit_account_id);

-- Sample data
INSERT OR IGNORE INTO accounts (id, code, name, type) VALUES 
  ('cash', '101', '현금', 'ASSET'),
  ('bank', '102', '예금', 'ASSET'),
  ('card', '201', '신용카드', 'LIABILITY'),
  ('capital', '301', '자본금', 'EQUITY'),
  ('income', '401', '급여소득', 'REVENUE'),
  ('food', '501', '식비', 'EXPENSE'),
  ('transport', '502', '교통비', 'EXPENSE');