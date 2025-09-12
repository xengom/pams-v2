import { sql } from 'drizzle-orm';
import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core';
import { AccountType } from '@pams/types';

const accountTypeValues = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    type: text('type', { enum: accountTypeValues }).notNull(),
    parentId: text('parent_id').references((): any => accounts.id),
    balance: real('balance').default(0).notNull(),
    isPortfolio: integer('is_portfolio', { mode: 'boolean' }).default(false).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => {
    return {
      codeIdx: index('code_idx').on(table.code),
      typeIdx: index('type_idx').on(table.type),
      parentIdx: index('parent_idx').on(table.parentId),
    };
  }
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    description: text('description').notNull(),
    amount: real('amount').notNull(),
    debitAccountId: text('debit_account_id').notNull().references(() => accounts.id),
    creditAccountId: text('credit_account_id').notNull().references(() => accounts.id),
    transactionDate: text('transaction_date').notNull(),
    isHidden: integer('is_hidden', { mode: 'boolean' }).default(false).notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    dateIdx: index('transaction_date_idx').on(table.transactionDate),
    debitIdx: index('debit_account_idx').on(table.debitAccountId),
    creditIdx: index('credit_account_idx').on(table.creditAccountId),
  })
);

export const fixedExpenses = sqliteTable('fixed_expenses', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  paymentMethod: text('payment_method').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').default('KRW').notNull(),
  paymentDate: text('payment_date').notNull(),
  type: text('type', { enum: ['MONTHLY', 'YEARLY'] }).notNull(),
  note: text('note'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const spendingPlans = sqliteTable('spending_plans', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  salary: real('salary'),
  category: text('category').notNull(),
  description: text('description'),
  amount: real('amount').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const cardPayments = sqliteTable('card_payments', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  totalPayment: real('total_payment').default(0).notNull(),
  totalDiscount: real('total_discount').default(0).notNull(),
  totalBill: real('total_bill').default(0).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const salaryDetails = sqliteTable('salary_details', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  baseSalary: real('base_salary'),
  mealAllowance: real('meal_allowance'),
  overtimePay: real('overtime_pay'),
  nightPay: real('night_pay'),
  vacationPay: real('vacation_pay'),
  incentive: real('incentive'),
  nationalPension: real('national_pension'),
  healthInsurance: real('health_insurance'),
  employmentInsurance: real('employment_insurance'),
  longTermCare: real('long_term_care'),
  incomeTax: real('income_tax'),
  localTax: real('local_tax'),
  totalGross: real('total_gross'),
  totalDeduction: real('total_deduction'),
  netPay: real('net_pay'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});