import { eq, and, gte, lte, sum, sql } from 'drizzle-orm';
import { formatInTimeZone } from 'date-fns-tz';
import type { Database } from '../db/connection';
import { transactions, accounts } from '../db/schema';
import type { AccountType } from '@pams/types';

export class StatisticsService {
  constructor(private db: Database) {}

  async getMonthlyStats(year: number) {
    const monthlyStats = [];

    for (let month = 1; month <= 12; month++) {
      const startDate = formatInTimeZone(
        new Date(year, month - 1, 1),
        'Asia/Seoul',
        "yyyy-MM-dd'T'00:00:00.000'Z'"
      );
      const endDate = formatInTimeZone(
        new Date(year, month, 0, 23, 59, 59),
        'Asia/Seoul',
        "yyyy-MM-dd'T'23:59:59.999'Z'"
      );

      // Get expense transactions for the month
      const expenseTransactions = await this.db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.debitAccountId, accounts.id))
        .where(
          and(
            eq(accounts.type, 'EXPENSE'),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate),
            eq(transactions.isHidden, false)
          )
        );

      // Get revenue transactions for the month
      const revenueTransactions = await this.db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.creditAccountId, accounts.id))
        .where(
          and(
            eq(accounts.type, 'REVENUE'),
            gte(transactions.transactionDate, startDate),
            lte(transactions.transactionDate, endDate),
            eq(transactions.isHidden, false)
          )
        );

      monthlyStats.push({
        month,
        expenses: expenseTransactions[0]?.totalAmount || 0,
        revenues: revenueTransactions[0]?.totalAmount || 0,
      });
    }

    return monthlyStats;
  }

  async getAccountSummary(year: number, month: number, type: AccountType) {
    const startDate = formatInTimeZone(
      new Date(year, month - 1, 1),
      'Asia/Seoul',
      "yyyy-MM-dd'T'00:00:00.000'Z'"
    );
    const endDate = formatInTimeZone(
      new Date(year, month, 0, 23, 59, 59),
      'Asia/Seoul',
      "yyyy-MM-dd'T'23:59:59.999'Z'"
    );

    // Get all accounts of the specified type
    const accountsOfType = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.type, type));

    const accountSummaries = [];

    for (const account of accountsOfType) {
      let totalAmount = 0;

      if (type === 'EXPENSE') {
        // For expenses, sum debit transactions
        const expenseTotal = await this.db
          .select({
            total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.debitAccountId, account.id),
              gte(transactions.transactionDate, startDate),
              lte(transactions.transactionDate, endDate),
              eq(transactions.isHidden, false)
            )
          );
        
        totalAmount = expenseTotal[0]?.total || 0;
      } else if (type === 'REVENUE') {
        // For revenues, sum credit transactions
        const revenueTotal = await this.db
          .select({
            total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.creditAccountId, account.id),
              gte(transactions.transactionDate, startDate),
              lte(transactions.transactionDate, endDate),
              eq(transactions.isHidden, false)
            )
          );
        
        totalAmount = revenueTotal[0]?.total || 0;
      }

      if (totalAmount > 0) {
        accountSummaries.push({
          account,
          total: totalAmount,
        });
      }
    }

    // Sort by total amount descending
    return accountSummaries.sort((a, b) => b.total - a.total);
  }




}