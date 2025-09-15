import { nanoid } from 'nanoid';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';
import type { Database } from '../db/connection';
import { transactions, accounts } from '../db/schema';
import type { CreateTransactionInput, UpdateTransactionInput } from '@pams/types';
import { AccountService } from './account.service';
import { BalanceService } from './balance.service';

export class TransactionService {
  private accountService: AccountService;
  private balanceService: BalanceService;

  constructor(private db: Database) {
    this.accountService = new AccountService(db);
    this.balanceService = new BalanceService(db);
  }

  async getAllTransactions(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.isHidden, false));
    
    const totalCount = totalResult[0].count;
    
    // Get paginated transactions
    const transactionList = await this.db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        debitAccountId: transactions.debitAccountId,
        creditAccountId: transactions.creditAccountId,
        transactionDate: transactions.transactionDate,
        isHidden: transactions.isHidden,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .where(eq(transactions.isHidden, false))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      transactions: transactionList,
      hasNextPage: offset + limit < totalCount,
      hasPreviousPage: page > 1,
      totalCount,
    };
  }

  async getTransactionById(id: string) {
    const result = await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createTransaction(input: CreateTransactionInput) {
    // Validate double-entry bookkeeping rules
    await this.validateTransaction(input.debitAccountId, input.creditAccountId, input.amount);

    const id = nanoid();
    const kstDate = input.transactionDate 
      ? formatInTimeZone(input.transactionDate, 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      : formatInTimeZone(new Date(), 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    
    const now = formatInTimeZone(new Date(), 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    const transactionData = {
      id,
      description: input.description,
      amount: input.amount,
      debitAccountId: input.debitAccountId,
      creditAccountId: input.creditAccountId,
      transactionDate: kstDate,
      isHidden: false,
      createdAt: now,
    };

    await this.db.insert(transactions).values(transactionData);
    
    // Update account balances
    await this.balanceService.updateAccountBalancesFromTransaction(input.debitAccountId, input.creditAccountId, input.amount);
    
    return await this.getTransactionById(id);
  }

  async updateTransaction(id: string, input: UpdateTransactionInput) {
    const existingTransaction = await this.getTransactionById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Reverse the old transaction balances
    await this.balanceService.updateAccountBalancesFromTransaction(
      existingTransaction.debitAccountId,
      existingTransaction.creditAccountId,
      existingTransaction.amount,
      true // isReversal
    );

    // Validate new transaction if accounts or amount changed
    const debitAccountId = input.debitAccountId || existingTransaction.debitAccountId;
    const creditAccountId = input.creditAccountId || existingTransaction.creditAccountId;
    const amount = input.amount ?? existingTransaction.amount;

    await this.validateTransaction(debitAccountId, creditAccountId, amount);

    const updateData = {
      ...(input.description && { description: input.description }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.debitAccountId && { debitAccountId: input.debitAccountId }),
      ...(input.creditAccountId && { creditAccountId: input.creditAccountId }),
      ...(input.transactionDate && { 
        transactionDate: formatInTimeZone(input.transactionDate, 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
      }),
    };

    await this.db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id));

    // Apply new transaction balances
    await this.balanceService.updateAccountBalancesFromTransaction(debitAccountId, creditAccountId, amount);

    return await this.getTransactionById(id);
  }

  async deleteTransaction(id: string) {
    const existingTransaction = await this.getTransactionById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Reverse the transaction balances
    await this.balanceService.updateAccountBalancesFromTransaction(
      existingTransaction.debitAccountId,
      existingTransaction.creditAccountId,
      existingTransaction.amount,
      true // isReversal
    );

    await this.db.delete(transactions).where(eq(transactions.id, id));
    
    return true;
  }

  async adjustPortfolioBalance(accountId: string, newBalance: number) {
    const account = await this.accountService.getAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isPortfolio) {
      throw new Error('Account is not a portfolio asset');
    }

    // Find the equity adjustment account (차액조정)
    const equityAccounts = await this.accountService.getAccountsByType('EQUITY' as any);
    const adjustmentAccount = equityAccounts.find(acc => acc.code === '3100');
    
    if (!adjustmentAccount) {
      throw new Error('Equity adjustment account (3100) not found');
    }

    const balanceDifference = newBalance - account.balance;
    
    if (balanceDifference !== 0) {
      // Create hidden adjustment transaction
      const id = nanoid();
      const kstNow = formatInTimeZone(new Date(), 'Asia/Seoul', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      
      const transactionData = {
        id,
        description: `Portfolio balance adjustment for ${account.name}`,
        amount: Math.abs(balanceDifference),
        debitAccountId: balanceDifference > 0 ? accountId : adjustmentAccount.id,
        creditAccountId: balanceDifference > 0 ? adjustmentAccount.id : accountId,
        transactionDate: kstNow,
        isHidden: true, // Hidden from normal transaction views
        createdAt: kstNow,
      };

      await this.db.insert(transactions).values(transactionData);
      
      // Update account balances
      await this.balanceService.updateAccountBalancesFromTransaction(
        transactionData.debitAccountId,
        transactionData.creditAccountId,
        transactionData.amount
      );

      return await this.getTransactionById(id);
    }

    return null;
  }

  private async validateTransaction(debitAccountId: string, creditAccountId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    if (debitAccountId === creditAccountId) {
      throw new Error('Debit and credit accounts must be different');
    }

    const debitAccount = await this.accountService.getAccountById(debitAccountId);
    const creditAccount = await this.accountService.getAccountById(creditAccountId);

    if (!debitAccount) {
      throw new Error('Debit account not found');
    }

    if (!creditAccount) {
      throw new Error('Credit account not found');
    }

    // Check if portfolio assets can only be transferred from cash assets
    if (creditAccount.isPortfolio) {
      const debitParent = await this.accountService.getParentAccount(debitAccountId);
      if (!debitParent || debitParent.code !== '1100') { // 현금성자산
        throw new Error('Portfolio assets can only receive transfers from cash assets');
      }
    }
  }



  async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    const start = formatInTimeZone(startDate, 'Asia/Seoul', "yyyy-MM-dd'T'00:00:00.000'Z'");
    const end = formatInTimeZone(endDate, 'Asia/Seoul', "yyyy-MM-dd'T'23:59:59.999'Z'");

    return await this.db
      .select()
      .from(transactions)
      .where(
        and(
          gte(transactions.transactionDate, start),
          lte(transactions.transactionDate, end),
          eq(transactions.isHidden, false)
        )
      )
      .orderBy(desc(transactions.transactionDate));
  }
}