import { nanoid } from 'nanoid';
import {eq, and, isNull, sql, or, notLike} from 'drizzle-orm';
import type { Database } from '../db/connection';
import { accounts, transactions } from '../db/schema';
import type { CreateAccountInput, UpdateAccountInput, AccountType } from '@pams/types';

export class AccountService {
  constructor(private db: Database) {}

  async getAllAccounts() {
    return await this.db
        .select()
        .from(accounts);
        // .where(notLike(accounts.code, '%00'));
  }

  async getAccountById(id: string) {
    const result = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async getAccountsByType(type: AccountType) {
    return await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.type, type));
  }

  async getAccountHierarchy() {
    const allAccounts = await this.getAllAccounts();
    
    // Build hierarchy (parent accounts first, then children)
    const accountMap = new Map(allAccounts.map(acc => [acc.id, { ...acc, children: [] as any[] }]));
    const rootAccounts: any[] = [];

    for (const account of allAccounts) {
      const accountWithChildren = accountMap.get(account.id)!;
      
      if (!account.parentId) {
        rootAccounts.push(accountWithChildren);
      } else {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(accountWithChildren);
        }
      }
    }

    return rootAccounts;
  }

  async getChildAccounts(parentId: string) {
    return await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.parentId, parentId));
  }

  async createAccount(input: CreateAccountInput) {
    const id = nanoid();
    const now = new Date().toISOString();

    const accountData = {
      id,
      code: input.code,
      name: input.name,
      type: input.type,
      parentId: input.parentId || null,
      balance: 0,
      isPortfolio: input.isPortfolio || false,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.insert(accounts).values(accountData);
    
    return await this.getAccountById(id);
  }

  async updateAccount(id: string, input: UpdateAccountInput) {
    const now = new Date().toISOString();
    
    const updateData = {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.type && { type: input.type }),
      ...(input.parentId !== undefined && { parentId: input.parentId }),
      ...(input.isPortfolio !== undefined && { isPortfolio: input.isPortfolio }),
      updatedAt: now,
    };

    await this.db
      .update(accounts)
      .set(updateData)
      .where(eq(accounts.id, id));

    return await this.getAccountById(id);
  }

  async deleteAccount(id: string) {
    // Check if account exists
    const account = await this.getAccountById(id);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if account has children
    const children = await this.getChildAccounts(id);
    if (children.length > 0) {
      throw new Error('계정에 하위 계정이 있어 삭제할 수 없습니다. 먼저 하위 계정을 삭제해주세요.');
    }

    // Check if account has transactions (debit or credit)
    const transactionCount = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(
        or(
          eq(transactions.debitAccountId, id),
          eq(transactions.creditAccountId, id)
        )
      );

    if (transactionCount[0]?.count > 0) {
      throw new Error('거래 기록이 있는 계정은 삭제할 수 없습니다.');
    }

    // Perform deletion
    const result = await this.db
      .delete(accounts)
      .where(eq(accounts.id, id));

    return true;
  }

  async updateBalance(accountId: string, newBalance: number) {
    const now = new Date().toISOString();
    
    await this.db
      .update(accounts)
      .set({ 
        balance: newBalance,
        updatedAt: now 
      })
      .where(eq(accounts.id, accountId));

    // Update parent balance if exists
    const account = await this.getAccountById(accountId);
    if (account?.parentId) {
      await this.updateParentBalance(account.parentId);
    }
  }

  async updateParentBalance(parentId: string) {
    // Calculate sum of all children balances
    const children = await this.getChildAccounts(parentId);
    const totalBalance = children.reduce((sum, child) => sum + child.balance, 0);
    
    const now = new Date().toISOString();
    await this.db
      .update(accounts)
      .set({ 
        balance: totalBalance,
        updatedAt: now 
      })
      .where(eq(accounts.id, parentId));

    // Check if this parent also has a parent
    const parent = await this.getAccountById(parentId);
    if (parent?.parentId) {
      await this.updateParentBalance(parent.parentId);
    }
  }

  async getParentAccount(accountId: string) {
    const account = await this.getAccountById(accountId);
    if (!account?.parentId) return null;
    
    return await this.getAccountById(account.parentId);
  }
}