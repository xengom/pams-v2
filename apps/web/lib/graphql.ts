import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8787/graphql'
  : process.env.NEXT_PUBLIC_API_URL + '/graphql';

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL queries
export const GET_ACCOUNTS = /* GraphQL */ `
  query GetAccounts {
    accounts {
      id
      code
      name
      type
      balance
      isPortfolio
      parentId
      createdAt
      updatedAt
    }
  }
`;

export const GET_ACCOUNT_HIERARCHY = /* GraphQL */ `
  query GetAccountHierarchy {
    accountHierarchy {
      id
      code
      name
      type
      balance
      isPortfolio
      children {
        id
        code
        name
        type
        balance
        isPortfolio
      }
    }
  }
`;

export const GET_TRANSACTIONS = /* GraphQL */ `
  query GetTransactions($page: Int, $limit: Int) {
    transactions(page: $page, limit: $limit) {
      transactions {
        id
        description
        amount
        transactionDate
        debitAccount {
          id
          name
          code
          type
        }
        creditAccount {
          id
          name
          code
          type
        }
      }
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
`;

export const CREATE_TRANSACTION = /* GraphQL */ `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
      description
      amount
      transactionDate
      debitAccount {
        id
        name
        code
      }
      creditAccount {
        id
        name
        code
      }
    }
  }
`;

export const UPDATE_TRANSACTION = /* GraphQL */ `
  mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
    updateTransaction(id: $id, input: $input) {
      id
      description
      amount
      transactionDate
      debitAccount {
        id
        name
        code
      }
      creditAccount {
        id
        name
        code
      }
    }
  }
`;

export const DELETE_TRANSACTION = /* GraphQL */ `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;

export const CREATE_ACCOUNT = /* GraphQL */ `
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
      code
      name
      type
      balance
      isPortfolio
      parentId
    }
  }
`;

export const UPDATE_ACCOUNT = /* GraphQL */ `
  mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
    updateAccount(id: $id, input: $input) {
      id
      code
      name
      type
      balance
      isPortfolio
      parentId
    }
  }
`;

export const DELETE_ACCOUNT = /* GraphQL */ `
  mutation DeleteAccount($id: ID!) {
    deleteAccount(id: $id)
  }
`;

export const GET_MONTHLY_STATS = /* GraphQL */ `
  query GetMonthlyStats($year: Int!) {
    monthlyStats(year: $year) {
      month
      expenses
      revenues
    }
  }
`;

export const GET_ACCOUNT_SUMMARY = /* GraphQL */ `
  query GetAccountSummary($year: Int!, $month: Int!, $type: AccountType!) {
    accountSummary(year: $year, month: $month, type: $type) {
      account {
        id
        name
        code
        type
      }
      total
    }
  }
`;

export const GET_FIXED_EXPENSES = /* GraphQL */ `
  query GetFixedExpenses {
    fixedExpenses {
      id
      category
      paymentMethod
      amount
      currency
      paymentDate
      type
      note
      createdAt
    }
  }
`;
export const GET_FIXED_EXPENSES_SUMMARY = /* GraphQL */ `
  query GetFixedExpensesSummary {
    fixedExpensesSummary {
      monthlyTotal
      yearlyTotal
      monthlyAverageTotal
      currency
    }
  }
`;

export const GET_EXCHANGE_RATE_INFO = /* GraphQL */ `
  query GetExchangeRateInfo {
    exchangeRateInfo {
      from
      to
      rate
      timestamp
      lastUpdated
    }
  }
`;

export const CREATE_FIXED_EXPENSE = /* GraphQL */ `
  mutation CreateFixedExpense($input: CreateFixedExpenseInput!) {
    createFixedExpense(input: $input) {
      id
      category
      paymentMethod
      amount
      currency
      paymentDate
      type
      note
    }
  }
`;
export const UPDATE_FIXED_EXPENSE = /* GraphQL */ `
  mutation UpdateFixedExpense($id: ID!, $input: UpdateFixedExpenseInput!) {
    updateFixedExpense(id: $id, input: $input) {
      id
      category
      paymentMethod
      amount
      currency
      paymentDate
      type
      note
    }
  }
`;
export const DELETE_FIXED_EXPENSE = /* GraphQL */ `
  mutation DeleteFixedExpense($id: ID!) {
    deleteFixedExpense(id: $id)
  }
`;

export const GET_SPENDING_PLANS = /* GraphQL */ `
  query GetSpendingPlans($year: Int!, $month: Int!) {
    spendingPlans(year: $year, month: $month) {
      id
      year
      month
      salary
      category
      description
      amount
      createdAt
    }
  }
`;
export const CREATE_SPENDING_PLAN = /* GraphQL */ `
  mutation CreateSpendingPlan($input: CreateSpendingPlanInput!) {
    createSpendingPlan(input: $input) {
      id
      year
      month
      salary
      category
      description
      amount
    }
  }
`;

export const UPDATE_SPENDING_PLAN = /* GraphQL */ `
  mutation UpdateSpendingPlan($id: ID!, $input: UpdateSpendingPlanInput!) {
    updateSpendingPlan(id: $id, input: $input) {
      id
      year
      month
      salary
      category
      description
      amount
    }
  }
`;

export const DELETE_SPENDING_PLAN = /* GraphQL */ `
  mutation DeleteSpendingPlan($id: ID!) {
    deleteSpendingPlan(id: $id)
  }
`;

export const DELETE_MONTHLY_SPENDING_PLANS = /* GraphQL */ `
  mutation DeleteMonthlySpendingPlans($year: Int!, $month: Int!) {
    deleteMonthlySpendingPlans(year: $year, month: $month)
  }
`;

export const GET_CARD_PAYMENTS = /* GraphQL */ `
  query GetCardPayments($year: Int!, $month: Int!) {
    cardPayments(year: $year, month: $month) {
      id
      account {
        id
        name
        code
      }
      year
      month
      totalPayment
      totalDiscount
      totalBill
      createdAt
    }
  }
`;
export const GET_CARD_TRANSACTION_SUMMARY = /* GraphQL */ `
  query GetCardTransactionSummary($currentYear: Int!, $currentMonth: Int!, $lastYear: Int!, $lastMonth: Int!) {
    cardTransactionSummary(currentYear: $currentYear, currentMonth: $currentMonth, lastYear: $lastYear, lastMonth: $lastMonth) {
      account {
        id
        name
        code
      }
      currentMonth {
        year
        month
        totalPayment
        discount
        actualBill
      }
      lastMonth {
        year
        month
        totalPayment
        discount
        actualBill
      }
    }
  }
`;

export const CREATE_CARD_PAYMENT = /* GraphQL */ `
  mutation CreateCardPayment($input: CreateCardPaymentInput!) {
    createCardPayment(input: $input) {
      id
      account {
        id
        name
        code
      }
      year
      month
      totalPayment
      totalDiscount
      totalBill
    }
  }
`;

export const UPDATE_CARD_PAYMENT = /* GraphQL */ `
  mutation UpdateCardPayment($id: ID!, $input: UpdateCardPaymentInput!) {
    updateCardPayment(id: $id, input: $input) {
      id
      account {
        id
        name
        code
      }
      year
      month
      totalPayment
      totalDiscount
      totalBill
    }
  }
`;
export const UPDATE_CARD_DISCOUNT = /* GraphQL */ `
  mutation UpdateCardDiscount($input: UpdateCardDiscountInput!) {
    updateCardDiscount(input: $input) {
      year
      month
      totalPayment
      discount
      actualBill
    }
  }
`;

export const GET_SALARY_DETAILS = /* GraphQL */ `
  query GetSalaryDetails {
    salaryDetails {
      id
      year
      month
      baseSalary
      mealAllowance
      overtimePay
      nightPay
      vacationPay
      incentive
      nationalPension
      healthInsurance
      employmentInsurance
      longTermCare
      incomeTax
      localTax
      totalGross
      totalDeduction
      netPay
      createdAt
    }
  }
`;

export const GET_SALARY_DETAIL = /* GraphQL */ `
  query GetSalaryDetail($year: Int!, $month: Int!) {
    salaryDetail(year: $year, month: $month) {
      id
      year
      month
      baseSalary
      mealAllowance
      overtimePay
      nightPay
      vacationPay
      incentive
      nationalPension
      healthInsurance
      employmentInsurance
      longTermCare
      incomeTax
      localTax
      totalGross
      totalDeduction
      netPay
      createdAt
    }
  }
`;

export const CREATE_SALARY_DETAIL = /* GraphQL */ `
  mutation CreateSalaryDetail($input: CreateSalaryDetailInput!) {
    createSalaryDetail(input: $input) {
      id
      year
      month
      baseSalary
      mealAllowance
      overtimePay
      nightPay
      vacationPay
      incentive
      nationalPension
      healthInsurance
      employmentInsurance
      longTermCare
      incomeTax
      localTax
      totalGross
      totalDeduction
      netPay
    }
  }
`;

export const UPDATE_SALARY_DETAIL = /* GraphQL */ `
  mutation UpdateSalaryDetail($id: ID!, $input: UpdateSalaryDetailInput!) {
    updateSalaryDetail(id: $id, input: $input) {
      id
      year
      month
      baseSalary
      mealAllowance
      overtimePay
      nightPay
      vacationPay
      incentive
      nationalPension
      healthInsurance
      employmentInsurance
      longTermCare
      incomeTax
      localTax
      totalGross
      totalDeduction
      netPay
    }
  }
`;
