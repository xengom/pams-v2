export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  balance: number;
  isPortfolio: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  transactionDate: Date;
  isHidden: boolean;
  createdAt: Date;
}

export interface CreateAccountInput {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  isPortfolio?: boolean;
}

export interface CreateTransactionInput {
  description: string;
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  transactionDate?: Date;
}

export interface UpdateAccountInput {
  code?: string;
  name?: string;
  type?: AccountType;
  parentId?: string;
  isPortfolio?: boolean;
}

export interface UpdateTransactionInput {
  description?: string;
  amount?: number;
  debitAccountId?: string;
  creditAccountId?: string;
  transactionDate?: Date;
}