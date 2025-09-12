import { drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';

// Database schema setup script
const setupDatabase = async () => {
  // This would be run with actual D1 database instance
  const createTables = [
    sql`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('assets', 'liabilities', 'capital', 'revenue', 'expenses')),
        parent_id TEXT,
        balance REAL DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now', '+9 hours')),
        updated_at TEXT DEFAULT (datetime('now', '+9 hours')),
        FOREIGN KEY (parent_id) REFERENCES accounts(id)
      )
    `,
    sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        description TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        debit_account_id TEXT NOT NULL,
        credit_account_id TEXT NOT NULL,
        transaction_date TEXT DEFAULT (datetime('now', '+9 hours')),
        created_at TEXT DEFAULT (datetime('now', '+9 hours')),
        updated_at TEXT DEFAULT (datetime('now', '+9 hours')),
        FOREIGN KEY (debit_account_id) REFERENCES accounts(id),
        FOREIGN KEY (credit_account_id) REFERENCES accounts(id),
        CHECK (debit_account_id != credit_account_id)
      )
    `,
    sql`
      CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type)
    `,
    sql`
      CREATE INDEX IF NOT EXISTS idx_accounts_parent_id ON accounts(parent_id)
    `,
    sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)
    `,
    sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_debit ON transactions(debit_account_id)
    `,
    sql`
      CREATE INDEX IF NOT EXISTS idx_transactions_credit ON transactions(credit_account_id)
    `,
  ];

  // Sample data
  const sampleAccounts = [
    sql`
      INSERT OR IGNORE INTO accounts (id, code, name, type) VALUES 
      ('cash', '101', '현금', 'assets'),
      ('bank', '102', '예금', 'assets'),
      ('card', '201', '신용카드', 'liabilities'),
      ('capital', '301', '자본금', 'capital'),
      ('income', '401', '급여소득', 'revenue'),
      ('food', '501', '식비', 'expenses'),
      ('transport', '502', '교통비', 'expenses')
    `,
  ];

  console.log('Database setup SQL statements:');
  console.log('='.repeat(50));
  
  createTables.forEach((query, index) => {
    console.log(`-- Table/Index ${index + 1}`);
    console.log(query.queryChunks.join(''));
    console.log('');
  });

  sampleAccounts.forEach((query, index) => {
    console.log(`-- Sample Data ${index + 1}`);
    console.log(query.queryChunks.join(''));
    console.log('');
  });
};

setupDatabase().catch(console.error);