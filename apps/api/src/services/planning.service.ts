import { nanoid } from 'nanoid';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import type { Database } from '../db/connection';
import { fixedExpenses, spendingPlans, cardPayments, salaryDetails, accounts, transactions } from '../db/schema';

export class PlanningService {
  constructor(private db: Database) {}

  // Fixed Expenses
  async getAllFixedExpenses() {
    return await this.db.select().from(fixedExpenses);
  }

  async getFixedExpenseById(id: string) {
    const result = await this.db
      .select()
      .from(fixedExpenses)
      .where(eq(fixedExpenses.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createFixedExpense(input: any) {
    const id = nanoid();
    const now = new Date().toISOString();

    const expenseData = {
      id,
      category: input.category,
      paymentMethod: input.paymentMethod,
      amount: input.amount,
      currency: input.currency || 'KRW',
      paymentDate: input.paymentDate,
      type: input.type,
      note: input.note || null,
      createdAt: now,
    };

    await this.db.insert(fixedExpenses).values(expenseData);
    return await this.getFixedExpenseById(id);
  }

  async updateFixedExpense(id: string, input: any) {
    await this.db
      .update(fixedExpenses)
      .set({
        category: input.category,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        currency: input.currency || 'KRW',
        paymentDate: input.paymentDate,
        type: input.type,
        note: input.note || null,
      })
      .where(eq(fixedExpenses.id, id));

    return await this.getFixedExpenseById(id);
  }

  async deleteFixedExpense(id: string) {
    await this.db.delete(fixedExpenses).where(eq(fixedExpenses.id, id));
    return true;
  }

  // Spending Plans
  async getSpendingPlans(year: number, month: number) {
    return await this.db
      .select()
      .from(spendingPlans)
      .where(
        and(
          eq(spendingPlans.year, year),
          eq(spendingPlans.month, month)
        )
      );
  }

  async getSpendingPlanById(id: string) {
    const result = await this.db
      .select()
      .from(spendingPlans)
      .where(eq(spendingPlans.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createSpendingPlan(input: any) {
    const id = nanoid();
    const now = new Date().toISOString();

    const planData = {
      id,
      year: input.year,
      month: input.month,
      salary: input.salary || null,
      category: input.category,
      description: input.description || null,
      amount: input.amount,
      createdAt: now,
    };

    await this.db.insert(spendingPlans).values(planData);
    return await this.getSpendingPlanById(id);
  }

  async updateSpendingPlan(id: string, input: any) {
    await this.db
      .update(spendingPlans)
      .set({
        year: input.year,
        month: input.month,
        salary: input.salary || null,
        category: input.category,
        description: input.description || null,
        amount: input.amount,
      })
      .where(eq(spendingPlans.id, id));

    return await this.getSpendingPlanById(id);
  }

  async deleteSpendingPlan(id: string) {
    await this.db.delete(spendingPlans).where(eq(spendingPlans.id, id));
    return true;
  }

  async deleteMonthlySpendingPlans(year: number, month: number) {
    await this.db
      .delete(spendingPlans)
      .where(
        and(
          eq(spendingPlans.year, year),
          eq(spendingPlans.month, month)
        )
      );
    return true;
  }

  // Card Payments
  async getCardPayments(year: number, month: number) {
    return await this.db
      .select()
      .from(cardPayments)
      .where(
        and(
          eq(cardPayments.year, year),
          eq(cardPayments.month, month)
        )
      );
  }

  async getCardPaymentById(id: string) {
    const result = await this.db
      .select()
      .from(cardPayments)
      .where(eq(cardPayments.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  async createOrUpdateCardPayment(accountId: string, year: number, month: number, data: any) {
    // Check if card payment already exists
    const existing = await this.db
      .select()
      .from(cardPayments)
      .where(
        and(
          eq(cardPayments.accountId, accountId),
          eq(cardPayments.year, year),
          eq(cardPayments.month, month)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await this.db
        .update(cardPayments)
        .set({
          totalPayment: data.totalPayment || 0,
          totalDiscount: data.totalDiscount || 0,
          totalBill: (data.totalPayment || 0) - (data.totalDiscount || 0),
        })
        .where(eq(cardPayments.id, existing[0].id));

      return await this.getCardPaymentById(existing[0].id);
    } else {
      // Create new
      const id = nanoid();
      const now = new Date().toISOString();

      const paymentData = {
        id,
        accountId,
        year,
        month,
        totalPayment: data.totalPayment || 0,
        totalDiscount: data.totalDiscount || 0,
        totalBill: (data.totalPayment || 0) - (data.totalDiscount || 0),
        createdAt: now,
      };

      await this.db.insert(cardPayments).values(paymentData);
      return await this.getCardPaymentById(id);
    }
  }

  // Salary Details
  async getAllSalaryDetails() {
    return await this.db.select().from(salaryDetails);
  }

  async getSalaryDetail(year: number, month: number) {
    const result = await this.db
      .select()
      .from(salaryDetails)
      .where(
        and(
          eq(salaryDetails.year, year),
          eq(salaryDetails.month, month)
        )
      )
      .limit(1);
    
    return result[0] || null;
  }

  async createOrUpdateSalaryDetail(year: number, month: number, data: any) {
    // Check if salary detail already exists
    const existing = await this.getSalaryDetail(year, month);

    if (existing) {
      // Update existing
      await this.db
        .update(salaryDetails)
        .set({
          baseSalary: data.baseSalary || null,
          mealAllowance: data.mealAllowance || null,
          overtimePay: data.overtimePay || null,
          nightPay: data.nightPay || null,
          vacationPay: data.vacationPay || null,
          incentive: data.incentive || null,
          nationalPension: data.nationalPension || null,
          healthInsurance: data.healthInsurance || null,
          employmentInsurance: data.employmentInsurance || null,
          longTermCare: data.longTermCare || null,
          incomeTax: data.incomeTax || null,
          localTax: data.localTax || null,
          totalGross: data.totalGross || null,
          totalDeduction: data.totalDeduction || null,
          netPay: data.netPay || null,
        })
        .where(eq(salaryDetails.id, existing.id));

      return await this.getSalaryDetail(year, month);
    } else {
      // Create new
      const id = nanoid();
      const now = new Date().toISOString();

      const salaryData = {
        id,
        year,
        month,
        baseSalary: data.baseSalary || null,
        mealAllowance: data.mealAllowance || null,
        overtimePay: data.overtimePay || null,
        nightPay: data.nightPay || null,
        vacationPay: data.vacationPay || null,
        incentive: data.incentive || null,
        nationalPension: data.nationalPension || null,
        healthInsurance: data.healthInsurance || null,
        employmentInsurance: data.employmentInsurance || null,
        longTermCare: data.longTermCare || null,
        incomeTax: data.incomeTax || null,
        localTax: data.localTax || null,
        totalGross: data.totalGross || null,
        totalDeduction: data.totalDeduction || null,
        netPay: data.netPay || null,
        createdAt: now,
      };

      await this.db.insert(salaryDetails).values(salaryData);
      return await this.getSalaryDetail(year, month);
    }
  }

  async calculateFixedExpenseSummary() {
    const expenses = await this.getAllFixedExpenses();
    
    const monthlyTotal = expenses
      .filter(exp => exp.type === 'MONTHLY')
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const yearlyTotal = expenses
      .filter(exp => exp.type === 'YEARLY')
      .reduce((sum, exp) => sum + exp.amount, 0);

    // Convert yearly to monthly average
    const monthlyFromYearly = yearlyTotal / 12;
    
    return {
      monthlyTotal,
      yearlyTotal,
      monthlyAverage: monthlyTotal + monthlyFromYearly,
    };
  }

  // Card Transaction Summary methods
  async getCardTransactionSummary(currentYear: number, currentMonth: number, lastYear: number, lastMonth: number) {
    // Get all cards with parent account code '2100'
    const parentAccount = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.code, '2100'))
      .limit(1);
    
    if (parentAccount.length === 0) {
      return [];
    }

    const cardAccounts = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.parentId, parentAccount[0].id));

    const results = [];
    
    for (const cardAccount of cardAccounts) {
      // Get transaction aggregations for both months
      const currentMonthTransactions = await this.getCardTransactionTotal(cardAccount.id, currentYear, currentMonth);
      const lastMonthTransactions = await this.getCardTransactionTotal(cardAccount.id, lastYear, lastMonth);
      
      // Get existing card payment records for discount values
      const currentMonthPayment = await this.getCardPayment(cardAccount.id, currentYear, currentMonth);
      const lastMonthPayment = await this.getCardPayment(cardAccount.id, lastYear, lastMonth);
      
      results.push({
        account: cardAccount,
        currentMonth: {
          year: currentYear,
          month: currentMonth,
          totalPayment: currentMonthTransactions,
          discount: currentMonthPayment?.totalDiscount || 0,
          actualBill: currentMonthTransactions - (currentMonthPayment?.totalDiscount || 0)
        },
        lastMonth: {
          year: lastYear,
          month: lastMonth,
          totalPayment: lastMonthTransactions,
          discount: lastMonthPayment?.totalDiscount || 0,
          actualBill: lastMonthTransactions - (lastMonthPayment?.totalDiscount || 0)
        }
      });
    }
    
    return results;
  }

  private async getCardTransactionTotal(accountId: string, year: number, month: number): Promise<number> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = year === 2024 && month === 12 
      ? '2025-01-01' 
      : month === 12 
        ? `${year + 1}-01-01`
        : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    const result = await this.db
      .select({ total: sql<number>`SUM(${transactions.amount})` })
      .from(transactions)
      .where(
        and(
          eq(transactions.creditAccountId, accountId),
          gte(transactions.transactionDate, startDate),
          lt(transactions.transactionDate, endDate),
          eq(transactions.isHidden, false)
        )
      );

    return result[0]?.total || 0;
  }

  private async getCardPayment(accountId: string, year: number, month: number) {
    const result = await this.db
      .select()
      .from(cardPayments)
      .where(
        and(
          eq(cardPayments.accountId, accountId),
          eq(cardPayments.year, year),
          eq(cardPayments.month, month)
        )
      )
      .limit(1);
    
    return result[0] || null;
  }

  async updateCardDiscount(accountId: string, year: number, month: number, discount: number) {
    // Check if card payment record exists
    const existingPayment = await this.getCardPayment(accountId, year, month);
    
    if (existingPayment) {
      // Update existing record
      await this.db
        .update(cardPayments)
        .set({
          totalDiscount: discount,
          totalBill: existingPayment.totalPayment - discount
        })
        .where(eq(cardPayments.id, existingPayment.id));
    } else {
      // Create new record with transaction total
      const totalPayment = await this.getCardTransactionTotal(accountId, year, month);
      await this.db
        .insert(cardPayments)
        .values({
          id: crypto.randomUUID(),
          accountId,
          year,
          month,
          totalPayment,
          totalDiscount: discount,
          totalBill: totalPayment - discount
        });
    }
    
    return {
      year,
      month,
      totalPayment: existingPayment?.totalPayment || await this.getCardTransactionTotal(accountId, year, month),
      discount,
      actualBill: (existingPayment?.totalPayment || await this.getCardTransactionTotal(accountId, year, month)) - discount
    };
  }
}