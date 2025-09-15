import { Kind, GraphQLScalarType } from 'graphql';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { StatisticsService } from '../services/statistics.service';
import { PlanningService } from '../services/planning.service';
import { BalanceService } from '../services/balance.service';
import { BalanceTestUtility } from '../utils/balance-test';
import { exchangeRateService } from '../services/exchange-rate';

// Custom DateTime scalar
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    // Account queries
    accounts: async (_: any, __: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAllAccounts();
    },

    account: async (_: any, { id }: { id: string }, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountById(id);
    },

    accountsByType: async (_: any, { type }: { type: string }, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountsByType(type as any);
    },

    accountHierarchy: async (_: any, __: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountHierarchy();
    },

    // Transaction queries
    transactions: async (_: any, { page, limit }: { page?: number; limit?: number }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.getAllTransactions(page, limit);
    },

    transaction: async (_: any, { id }: { id: string }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.getTransactionById(id);
    },

    // Fixed expense queries
    fixedExpenses: async (_: any, __: any, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getAllFixedExpenses();
    },

    fixedExpense: async (_: any, { id }: { id: string }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getFixedExpenseById(id);
    },

    fixedExpensesSummary: async (_: any, __: any, { db }: any) => {
      const planningService = new PlanningService(db);
      const expenses = await planningService.getAllFixedExpenses();
      
      const monthlyExpenses = expenses.filter((e: any) => e.type === 'MONTHLY');
      const yearlyExpenses = expenses.filter((e: any) => e.type === 'YEARLY');
      
      // Convert all amounts to KRW
      const monthlyAmountsKRW = await exchangeRateService.convertMixedToKRW(monthlyExpenses);
      const yearlyAmountsKRW = await exchangeRateService.convertMixedToKRW(yearlyExpenses);
      
      const monthlyTotal = monthlyAmountsKRW.reduce((sum, amount) => sum + amount, 0);
      const yearlyTotal = yearlyAmountsKRW.reduce((sum, amount) => sum + amount, 0);
      const monthlyAverageTotal = monthlyTotal + (yearlyTotal / 12);
      
      return {
        monthlyTotal,
        yearlyTotal,
        monthlyAverageTotal,
        currency: 'KRW',
      };
    },

    exchangeRateInfo: async (_: any, __: any) => {
      const rate = await exchangeRateService.getUSDToKRW();
      const timestamp = new Date().toISOString();
      
      return {
        from: 'USD',
        to: 'KRW',
        rate,
        timestamp,
        lastUpdated: new Date().toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
    },

    // Spending plan queries
    spendingPlans: async (_: any, { year, month }: { year: number; month: number }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getSpendingPlans(year, month);
    },

    spendingPlan: async (_: any, { id }: { id: string }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getSpendingPlanById(id);
    },

    // Card payment queries
    cardPayments: async (_: any, { year, month }: { year: number; month: number }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getCardPayments(year, month);
    },

    cardPayment: async (_: any, { id }: { id: string }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getCardPaymentById(id);
    },

    cardTransactionSummary: async (
      _: any, 
      { currentYear, currentMonth, lastYear, lastMonth }: { 
        currentYear: number; 
        currentMonth: number; 
        lastYear: number; 
        lastMonth: number; 
      }, 
      { db }: any
    ) => {
      const planningService = new PlanningService(db);
      return await planningService.getCardTransactionSummary(currentYear, currentMonth, lastYear, lastMonth);
    },

    // Salary detail queries
    salaryDetails: async (_: any, __: any, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getAllSalaryDetails();
    },

    salaryDetail: async (_: any, { year, month }: { year: number; month: number }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.getSalaryDetail(year, month);
    },

    // Statistics queries
    monthlyStats: async (_: any, { year }: { year: number }, { db }: any) => {
      const statisticsService = new StatisticsService(db);
      return await statisticsService.getMonthlyStats(year);
    },

    accountSummary: async (_: any, { year, month, type }: { year: number; month: number; type: string }, { db }: any) => {
      const statisticsService = new StatisticsService(db);
      return await statisticsService.getAccountSummary(year, month, type as any);
    },
  },

  Mutation: {
    // Account mutations
    createAccount: async (_: any, { input }: { input: any }, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.createAccount(input);
    },

    updateAccount: async (_: any, { id, input }: { id: string; input: any }, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.updateAccount(id, input);
    },

    deleteAccount: async (_: any, { id }: { id: string }, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.deleteAccount(id);
    },

    adjustPortfolioBalance: async (_: any, { accountId, newBalance }: { accountId: string; newBalance: number }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.adjustPortfolioBalance(accountId, newBalance);
    },

    // Transaction mutations
    createTransaction: async (_: any, { input }: { input: any }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.createTransaction(input);
    },

    updateTransaction: async (_: any, { id, input }: { id: string; input: any }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.updateTransaction(id, input);
    },

    deleteTransaction: async (_: any, { id }: { id: string }, { db }: any) => {
      const transactionService = new TransactionService(db);
      return await transactionService.deleteTransaction(id);
    },

    // Balance management mutations
    recalculateAccountBalance: async (_: any, { accountId }: { accountId: string }, { db }: any) => {
      const balanceService = new BalanceService(db);
      const newBalance = await balanceService.calculateAccountBalance(accountId);
      
      // Update the account with recalculated balance
      const accountService = new AccountService(db);
      await accountService.updateBalance(accountId, newBalance);
      
      return {
        accountId,
        previousBalance: null, // Could be fetched if needed
        newBalance,
        success: true
      };
    },

    recalculateAllAccountBalances: async (_: any, __: any, { db }: any) => {
      const balanceService = new BalanceService(db);
      const results = await balanceService.recalculateAllAccountBalances();
      
      return {
        totalAccounts: results.length,
        updatedAccounts: results.filter(r => r.balanceChanged).length,
        results,
        success: true
      };
    },

    validateAccountBalances: async (_: any, __: any, { db }: any) => {
      const balanceService = new BalanceService(db);
      return await balanceService.validateAccountBalances();
    },

    // Balance testing mutations (for development/debugging)
    runBalanceTests: async (_: any, __: any, { db }: any) => {
      const balanceTestUtility = new BalanceTestUtility(db);
      return await balanceTestUtility.runBalanceTests();
    },

    generateBalanceReport: async (_: any, __: any, { db }: any) => {
      const balanceTestUtility = new BalanceTestUtility(db);
      return await balanceTestUtility.generateBalanceReport();
    },

    // Fixed expense mutations
    createFixedExpense: async (_: any, { input }: { input: any }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.createFixedExpense(input);
    },

    updateFixedExpense: async (_: any, { id, input }: { id: string; input: any }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.updateFixedExpense(id, input);
    },

    deleteFixedExpense: async (_: any, { id }: { id: string }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.deleteFixedExpense(id);
    },

    // Spending plan mutations
    createSpendingPlan: async (_: any, { input }: { input: any }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.createSpendingPlan(input);
    },

    updateSpendingPlan: async (_: any, { id, input }: { id: string; input: any }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.updateSpendingPlan(id, input);
    },

    deleteSpendingPlan: async (_: any, { id }: { id: string }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.deleteSpendingPlan(id);
    },
    deleteMonthlySpendingPlans: async (_: any, { year, month }: { year: number; month: number }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.deleteMonthlySpendingPlans(year, month);
    },

    // Card management mutations
    updateCardDiscount: async (_: any, { input }: { input: any }, { db }: any) => {
      const planningService = new PlanningService(db);
      return await planningService.updateCardDiscount(
        input.accountId,
        input.year,
        input.month,
        input.discount
      );
    },
  },

  // Field resolvers
  Account: {
    parent: async (account: any, _: any, { db }: any) => {
      if (!account.parentId) return null;
      const accountService = new AccountService(db);
      return await accountService.getAccountById(account.parentId);
    },

    children: async (account: any, _: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getChildAccounts(account.id);
    },
  },

  Transaction: {
    debitAccount: async (transaction: any, _: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountById(transaction.debitAccountId);
    },

    creditAccount: async (transaction: any, _: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountById(transaction.creditAccountId);
    },
  },

  CardPayment: {
    account: async (cardPayment: any, _: any, { db }: any) => {
      const accountService = new AccountService(db);
      return await accountService.getAccountById(cardPayment.accountId);
    },
  },

  AccountSummary: {
    account: async (summary: any, _: any, { db }: any) => {
      return summary.account; // Already included from the query
    },
  },
};