export const typeDefs = /* GraphQL */ `
  scalar DateTime

  enum AccountType {
    ASSET
    LIABILITY
    EQUITY
    REVENUE
    EXPENSE
  }

  type Account {
    id: ID!
    code: String!
    name: String!
    type: AccountType!
    parentId: ID
    parent: Account
    balance: Float!
    isPortfolio: Boolean!
    children: [Account!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Transaction {
    id: ID!
    description: String!
    amount: Float!
    debitAccount: Account!
    creditAccount: Account!
    transactionDate: DateTime!
    isHidden: Boolean!
    createdAt: DateTime!
  }

  type PaginatedTransactions {
    transactions: [Transaction!]!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    totalCount: Int!
  }

  type FixedExpense {
    id: ID!
    category: String!
    paymentMethod: String!
    amount: Float!
    currency: String!
    paymentDate: String!
    type: String!
    note: String
    createdAt: DateTime!
  }

  type FixedExpenseSummary {
    monthlyTotal: Float!
    yearlyTotal: Float!
    monthlyAverageTotal: Float!
    currency: String!
  }

  type ExchangeRateInfo {
    from: String!
    to: String!
    rate: Float!
    timestamp: String!
    lastUpdated: String!
  }

  type SpendingPlan {
    id: ID!
    year: Int!
    month: Int!
    salary: Float
    category: String!
    description: String
    amount: Float!
    createdAt: DateTime!
  }

  type CardPayment {
    id: ID!
    account: Account!
    year: Int!
    month: Int!
    totalPayment: Float!
    totalDiscount: Float!
    totalBill: Float!
    createdAt: DateTime!
  }

  type CardMonthlyData {
    year: Int!
    month: Int!
    totalPayment: Float!
    discount: Float!
    actualBill: Float!
  }

  type CardTransactionSummary {
    account: Account!
    currentMonth: CardMonthlyData!
    lastMonth: CardMonthlyData!
  }

  type SalaryDetail {
    id: ID!
    year: Int!
    month: Int!
    baseSalary: Float
    mealAllowance: Float
    overtimePay: Float
    nightPay: Float
    vacationPay: Float
    incentive: Float
    nationalPension: Float
    healthInsurance: Float
    employmentInsurance: Float
    longTermCare: Float
    incomeTax: Float
    localTax: Float
    totalGross: Float
    totalDeduction: Float
    netPay: Float
    createdAt: DateTime!
  }

  # Statistics Types
  type MonthlyStats {
    month: Int!
    expenses: Float!
    revenues: Float!
  }

  type AccountSummary {
    account: Account!
    total: Float!
  }

  # Input Types
  input CreateAccountInput {
    code: String!
    name: String!
    type: AccountType!
    parentId: ID
    isPortfolio: Boolean = false
  }

  input UpdateAccountInput {
    code: String
    name: String
    type: AccountType
    parentId: ID
    isPortfolio: Boolean
  }

  input CreateTransactionInput {
    description: String!
    amount: Float!
    debitAccountId: ID!
    creditAccountId: ID!
    transactionDate: DateTime
  }

  input UpdateTransactionInput {
    description: String
    amount: Float
    debitAccountId: ID
    creditAccountId: ID
    transactionDate: DateTime
  }

  input CreateFixedExpenseInput {
    category: String!
    paymentMethod: String!
    amount: Float!
    currency: String = "KRW"
    paymentDate: String!
    type: String!
    note: String
  }

  input UpdateFixedExpenseInput {
    category: String!
    paymentMethod: String!
    amount: Float!
    currency: String = "KRW"
    paymentDate: String!
    type: String!
    note: String
  }

  input CreateSpendingPlanInput {
    year: Int!
    month: Int!
    salary: Float
    category: String!
    description: String
    amount: Float!
  }

  input UpdateSpendingPlanInput {
    year: Int
    month: Int
    salary: Float
    category: String
    description: String
    amount: Float
  }

  input UpdateCardDiscountInput {
    accountId: ID!
    year: Int!
    month: Int!
    discount: Float!
  }

  type Query {
    # Account queries
    accounts: [Account!]!
    account(id: ID!): Account
    accountsByType(type: AccountType!): [Account!]!
    accountHierarchy: [Account!]!

    # Transaction queries
    transactions(page: Int = 1, limit: Int = 20): PaginatedTransactions!
    transaction(id: ID!): Transaction

    # Fixed expense queries
    fixedExpenses: [FixedExpense!]!
    fixedExpense(id: ID!): FixedExpense
    fixedExpensesSummary: FixedExpenseSummary!
    exchangeRateInfo: ExchangeRateInfo!

    # Spending plan queries
    spendingPlans(year: Int!, month: Int!): [SpendingPlan!]!
    spendingPlan(id: ID!): SpendingPlan

    # Card payment queries
    cardPayments(year: Int!, month: Int!): [CardPayment!]!
    cardPayment(id: ID!): CardPayment
    cardTransactionSummary(currentYear: Int!, currentMonth: Int!, lastYear: Int!, lastMonth: Int!): [CardTransactionSummary!]!

    # Salary detail queries
    salaryDetails: [SalaryDetail!]!
    salaryDetail(year: Int!, month: Int!): SalaryDetail

    # Statistics queries
    monthlyStats(year: Int!): [MonthlyStats!]!
    accountSummary(year: Int!, month: Int!, type: AccountType!): [AccountSummary!]!
  }

  type Mutation {
    # Account mutations
    createAccount(input: CreateAccountInput!): Account!
    updateAccount(id: ID!, input: UpdateAccountInput!): Account!
    deleteAccount(id: ID!): Boolean!
    adjustPortfolioBalance(accountId: ID!, newBalance: Float!): Transaction!

    # Transaction mutations
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Boolean!

    # Fixed expense mutations
    createFixedExpense(input: CreateFixedExpenseInput!): FixedExpense!
    updateFixedExpense(id: ID!, input: UpdateFixedExpenseInput!): FixedExpense!
    deleteFixedExpense(id: ID!): Boolean!

    # Spending plan mutations
    createSpendingPlan(input: CreateSpendingPlanInput!): SpendingPlan!
    updateSpendingPlan(id: ID!, input: UpdateSpendingPlanInput!): SpendingPlan!
    deleteSpendingPlan(id: ID!): Boolean!
    deleteMonthlySpendingPlans(year: Int!, month: Int!): Boolean!

    # Card management mutations
    updateCardDiscount(input: UpdateCardDiscountInput!): CardMonthlyData!
  }
`;